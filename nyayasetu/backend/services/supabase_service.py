import os
import uuid

import httpx
from fastapi import HTTPException


def _get_settings() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(500, "Supabase not configured")
    return url.rstrip("/"), key


def _build_headers(api_key: str, prefer: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def _create_http_client() -> httpx.Client:
    return httpx.Client(timeout=20)


def _request(
    method: str,
    path: str,
    *,
    params: dict | None = None,
    json: dict | list | None = None,
    prefer: str | None = None,
) -> list | dict:
    base_url, api_key = _get_settings()
    url = f"{base_url}{path}"
    headers = _build_headers(api_key, prefer=prefer)

    with _create_http_client() as client:
        try:
            response = client.request(method, url, headers=headers, params=params, json=json)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                502,
                f"Supabase API error ({exc.response.status_code}): {exc.response.text}",
            ) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(502, f"Supabase connection error: {str(exc)}") from exc

    if not response.text:
        return {}
    return response.json()


def save_analysis(
    user_id: str,
    document_name: str,
    document_pages: int,
    summary: str,
    language: str,
    metrics: dict,
) -> dict:
    share_id = str(uuid.uuid4())[:8].upper()
    data = {
        "user_id": user_id,
        "document_name": document_name,
        "document_pages": document_pages,
        "summary": summary,
        "language": language,
        "share_id": share_id,
        "is_public": True,
        "original_tokens": metrics.get("original_tokens", 0),
        "compressed_tokens": metrics.get("compressed_tokens", 0),
        "tokens_saved": metrics.get("tokens_saved", 0),
        "compression_percentage": metrics.get("compression_percentage", 0),
        "compression_ratio": metrics.get("compression_ratio", 1.0),
        "energy_saved_kwh": metrics.get("energy_saved_kwh", 0),
        "co2_saved_grams": metrics.get("co2_saved_grams", 0),
        "cost_saved_usd": metrics.get("cost_saved_usd", 0),
        "information_density": metrics.get("information_density", 0),
        "scaledown_latency_ms": metrics.get("scaledown_latency_ms", 0),
    }

    try:
        result = _request(
            "POST",
            "/rest/v1/analyses",
            json=data,
            prefer="return=representation",
        )
        _request(
            "POST",
            "/rest/v1/rpc/increment_global_stats",
            json={
                "tokens_saved_val": int(metrics.get("tokens_saved", 0)),
                "co2_val": float(metrics.get("co2_saved_grams", 0)),
            },
        )
        if isinstance(result, list) and result:
            return result[0]
        return {"share_id": share_id}
    except Exception as exc:
        print(f"[Supabase] Save failed: {exc}")
        return {"share_id": share_id}


def get_user_history(user_id: str) -> list:
    try:
        result = _request(
            "GET",
            "/rest/v1/analyses",
            params={
                "select": "id,document_name,document_pages,language,compression_percentage,tokens_saved,created_at,share_id",
                "user_id": f"eq.{user_id}",
                "order": "created_at.desc",
                "limit": "20",
            },
        )
        return result if isinstance(result, list) else []
    except Exception as exc:
        print(f"[Supabase] History failed: {exc}")
        return []


def get_analysis_by_share_id(share_id: str) -> dict:
    try:
        result = _request(
            "GET",
            "/rest/v1/analyses",
            params={
                "select": "*",
                "share_id": f"eq.{share_id.upper()}",
                "is_public": "eq.true",
                "limit": "1",
            },
        )
        return result[0] if isinstance(result, list) and result else {}
    except Exception as exc:
        print(f"[Supabase] Share fetch failed: {exc}")
        return {}


def get_global_stats() -> dict:
    try:
        result = _request(
            "GET",
            "/rest/v1/global_stats",
            params={"select": "*", "limit": "1"},
        )
        if isinstance(result, list) and result:
            return result[0]
        return {
            "total_analyses": 0,
            "total_tokens_saved": 0,
            "total_co2_saved_grams": 0,
        }
    except Exception as exc:
        print(f"[Supabase] Stats failed: {exc}")
        return {
            "total_analyses": 0,
            "total_tokens_saved": 0,
            "total_co2_saved_grams": 0,
        }
