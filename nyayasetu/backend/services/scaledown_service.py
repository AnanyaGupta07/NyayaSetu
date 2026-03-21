import httpx
from fastapi import HTTPException
SCALEDOWN_URL = "https://api.scaledown.xyz/compress/raw/"

PRESERVE_TERMS = [
    "Lok Sabha", "Rajya Sabha", "Article", "Section", "Schedule",
    "Constitution", "Parliament", "Ministry", "Gazette", "Amendment",
    "Supreme Court", "High Court", "Fundamental Rights", "Directive Principles",
    "Preamble", "Union Territory", "State Legislature", "President", "Governor"
]

async def compress_legal_document(text: str, api_key: str) -> dict:
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    instruction = (
        "Summarize this Indian legal document in simple language for citizens. "
        "Extract key rights, obligations, dates, penalties, and citizen impact. "
        "Preserve all section numbers, article references, and legal term definitions."
    )

    # Chunk large documents (>40k chars per chunk)
    chunk_size = 40000
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

    compressed_parts = []
    total_original = 0
    total_compressed = 0
    total_latency = 0

    async with httpx.AsyncClient(timeout=90) as client:
        for i, chunk in enumerate(chunks):
            print(f"[ScaleDown] Compressing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
            payload = {
                "context": chunk,
                "prompt": instruction,
                "scaledown": {"rate": "auto"}
            }
            try:
                resp = await client.post(SCALEDOWN_URL, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                result = data.get("results", {})

                if not data.get("successful", True):
                    raise HTTPException(502, f"ScaleDown returned unsuccessful on chunk {i+1}")

                compressed_parts.append(result["compressed_prompt"])
                total_original += result["original_prompt_tokens"]
                total_compressed += result["compressed_prompt_tokens"]
                total_latency += data.get("latency_ms", 0)

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise HTTPException(401, "Invalid ScaleDown API key")
                elif e.response.status_code == 429:
                    raise HTTPException(429, "ScaleDown rate limit exceeded. Try again in a moment.")
                else:
                    raise HTTPException(502, f"ScaleDown API error on chunk {i+1}: {str(e)}")
            except httpx.TimeoutException:
                raise HTTPException(504, f"ScaleDown timed out on chunk {i+1}")

    compressed_text = "\n\n".join(compressed_parts)
    tokens_saved = total_original - total_compressed

    print(f"[ScaleDown] Done: {total_original} → {total_compressed} tokens ({round((tokens_saved/total_original)*100) if total_original > 0 else 0}% reduction)")

    return {
        "compressed_text": compressed_text,
        "original_tokens": total_original,
        "compressed_tokens": total_compressed,
        "tokens_saved": tokens_saved,
        "compression_percentage": round((tokens_saved / total_original) * 100) if total_original > 0 else 0,
        "compression_ratio": round(total_original / total_compressed, 2) if total_compressed > 0 else 1.0,
        "latency_ms": total_latency
    }
