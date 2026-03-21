import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services import groq_summarizer


class FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload
        self.text = str(payload)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise groq_summarizer.httpx.HTTPStatusError(
                "request failed",
                request=groq_summarizer.httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions"),
                response=groq_summarizer.httpx.Response(self.status_code),
            )

    def json(self):
        return self._payload


class FakeClient:
    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, url, headers=None, json=None):
        self.calls.append({"url": url, "headers": headers, "json": json})
        return self._responses.pop(0)


class GroqSummarizerTests(unittest.IsolatedAsyncioTestCase):
    async def test_summarize_retries_next_key_and_does_not_depend_on_groq_sdk(self):
        fake_client = FakeClient(
            [
                FakeResponse(429, {"error": {"message": "rate limit"}}),
                FakeResponse(
                    200,
                    {"choices": [{"message": {"content": "Plain-language summary"}}]},
                ),
            ]
        )

        with (
            patch.dict(
                os.environ,
                {"GROQ_API_KEY_1": "key-one", "GROQ_API_KEY_2": "key-two"},
                clear=False,
            ),
            patch.object(groq_summarizer, "_create_groq_client", return_value=fake_client),
        ):
            result = await groq_summarizer.summarize("compressed legal text", "english")

        self.assertEqual(result, "Plain-language summary")
        self.assertEqual(len(fake_client.calls), 2)
        self.assertEqual(fake_client.calls[0]["headers"]["Authorization"], "Bearer key-one")
        self.assertEqual(fake_client.calls[1]["headers"]["Authorization"], "Bearer key-two")


if __name__ == "__main__":
    unittest.main()
