import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services import supabase_service


class FakeResponse:
    def __init__(self, status_code=200, payload=None):
        self.status_code = status_code
        self._payload = payload if payload is not None else []
        self.text = str(self._payload)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise supabase_service.httpx.HTTPStatusError(
                "request failed",
                request=supabase_service.httpx.Request("GET", "https://example.supabase.co"),
                response=supabase_service.httpx.Response(self.status_code),
            )

    def json(self):
        return self._payload


class FakeClient:
    def __init__(self, response):
        self.response = response
        self.calls = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def request(self, method, url, headers=None, params=None, json=None):
        self.calls.append(
            {
                "method": method,
                "url": url,
                "headers": headers,
                "params": params,
                "json": json,
            }
        )
        return self.response


class SupabaseServiceTests(unittest.TestCase):
    def test_get_user_history_uses_rest_api_without_supabase_sdk(self):
        fake_client = FakeClient(
            FakeResponse(
                200,
                [
                    {
                        "id": "1",
                        "document_name": "Budget.pdf",
                        "share_id": "ABCD1234",
                    }
                ],
            )
        )

        with (
            patch.dict(
                os.environ,
                {
                    "SUPABASE_URL": "https://demo.supabase.co",
                    "SUPABASE_SERVICE_KEY": "service-key",
                },
                clear=False,
            ),
            patch.object(supabase_service, "_create_http_client", return_value=fake_client),
        ):
            data = supabase_service.get_user_history("user-123")

        self.assertEqual(data[0]["document_name"], "Budget.pdf")
        self.assertEqual(fake_client.calls[0]["method"], "GET")
        self.assertEqual(
            fake_client.calls[0]["url"],
            "https://demo.supabase.co/rest/v1/analyses",
        )
        self.assertEqual(fake_client.calls[0]["headers"]["apikey"], "service-key")
        self.assertEqual(fake_client.calls[0]["params"]["user_id"], "eq.user-123")


if __name__ == "__main__":
    unittest.main()
