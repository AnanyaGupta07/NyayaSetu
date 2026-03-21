import os

import httpx
from fastapi import HTTPException

LANGUAGE_INSTRUCTIONS = {
    "english": "Respond in clear, simple English.",
    "hindi": "Respond entirely in Hindi using Devanagari script. Use simple everyday Hindi.",
    "tamil": "Respond entirely in Tamil script. Use simple everyday Tamil.",
    "bengali": "Respond entirely in Bengali (Bangla) script. Use simple everyday Bengali.",
    "hinglish": "Respond in Hinglish - a natural mix of Hindi and English used by urban Indians. Example style: 'Is bill mein yeh provision hai ki...'",
}

MAX_CHARS = 380000  # ~95k tokens, leaves headroom for system prompt + response
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are NyayaSetu - India's bridge between law and citizens.
The user will provide pre-compressed legal text. Your job is to produce
a clear, structured summary that any educated Indian adult can understand.

Format your response EXACTLY as follows (keep the emoji markers):

📋 WHAT THIS IS ABOUT
[2-3 sentences explaining the law/bill in simple terms]

🔑 KEY POINTS
- [Most important point]
- [Second point]
- [Third point]
- [Fourth point]
- [Fifth point - add more if needed]

👥 HOW IT AFFECTS YOU
[2-3 sentences on what this means for ordinary Indian citizens]

📅 IMPORTANT DATES & DEADLINES
[List any key dates, or write 'No specific dates mentioned']

⚠️ WHAT TO WATCH OUT FOR
[Key risks, penalties, or obligations citizens should know about]

Use simple Hindi/English mix where natural. Technical legal terms should be
followed by a plain explanation in brackets on first use."""


def get_groq_keys() -> list[str]:
    keys = []
    for i in range(1, 6):  # supports up to 5 keys
        key = os.getenv(f"GROQ_API_KEY_{i}")
        if key and key.strip():
            keys.append(key.strip())

    legacy = os.getenv("GROQ_API_KEY")
    if legacy and legacy.strip() and legacy.strip() not in keys:
        keys.append(legacy.strip())

    return keys


def _extract_content(response_json: dict) -> str:
    try:
        return response_json["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(502, "Groq returned an unexpected response format") from exc


def _create_groq_client() -> httpx.Client:
    return httpx.Client(timeout=60)


def _chat_completion(api_key: str, messages: list[dict], max_tokens: int, temperature: float) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    with _create_groq_client() as client:
        try:
            response = client.post(GROQ_CHAT_URL, headers=headers, json=payload)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            error_text = exc.response.text
            if status_code == 429:
                raise HTTPException(429, "Groq rate limit exceeded") from exc
            if status_code == 400 and "reduce" in error_text.lower():
                raise HTTPException(400, error_text) from exc
            raise HTTPException(502, f"Groq API error ({status_code}): {error_text}") from exc
        except httpx.HTTPError as exc:
            raise HTTPException(502, f"Groq connection error: {str(exc)}") from exc

    return _extract_content(response.json())


async def summarize(compressed_text: str, language: str = "english") -> str:
    if len(compressed_text) > MAX_CHARS:
        print(f"[Groq] Input too long ({len(compressed_text)} chars), truncating to {MAX_CHARS}")
        compressed_text = compressed_text[:MAX_CHARS]

    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["english"])
    full_system_prompt = SYSTEM_PROMPT + f"\n\nLANGUAGE INSTRUCTION: {lang_instruction}"

    keys = get_groq_keys()
    if not keys:
        raise HTTPException(500, "No Groq API keys configured. Add GROQ_API_KEY_1 to .env")

    for i, key in enumerate(keys):
        try:
            print(f"[Groq] Trying key {i+1}/{len(keys)}")
            return _chat_completion(
                api_key=key,
                messages=[
                    {"role": "system", "content": full_system_prompt},
                    {"role": "user", "content": compressed_text},
                ],
                max_tokens=1500,
                temperature=0.3,
            )
        except HTTPException as exc:
            error_str = str(exc.detail)
            if exc.status_code == 429:
                print(f"[Groq] Key {i+1} hit 429 rate limit, trying next key...")
                continue
            if exc.status_code == 400 and "reduce" in error_str.lower():
                print(f"[Groq] Key {i+1} got 400 too long, truncating to 70% and retrying same key...")
                compressed_text = compressed_text[: int(MAX_CHARS * 0.7)]
                continue
            raise HTTPException(502, f"Groq error: {error_str}") from exc

    raise HTTPException(429, f"All {len(keys)} Groq keys exhausted. Try again later.")


async def answer_question(compressed_context: str, question: str, language: str = "english") -> str:
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["english"])
    context = compressed_context[:60000] if len(compressed_context) > 60000 else compressed_context

    qa_system = f"""You are NyayaSetu - India's legal assistant for citizens.
Answer the citizen's question using ONLY the provided legal document context.
Be concise, direct, and use simple language a common person understands.
Cite specific section or article numbers when relevant.
If the answer is not in the context, say: "This information is not in the document."
Do NOT make up or assume any information.
LANGUAGE INSTRUCTION: {lang_instruction}"""

    keys = get_groq_keys()
    if not keys:
        raise HTTPException(500, "No Groq API keys configured")

    for i, key in enumerate(keys):
        try:
            print(f"[Groq Q&A] Trying key {i+1}/{len(keys)}")
            return _chat_completion(
                api_key=key,
                messages=[
                    {"role": "system", "content": qa_system},
                    {"role": "user", "content": f"Legal Context:\n{context}\n\nQuestion: {question}"},
                ],
                max_tokens=600,
                temperature=0.2,
            )
        except HTTPException as exc:
            if exc.status_code == 429:
                continue
            raise HTTPException(502, f"Groq Q&A error: {str(exc.detail)}") from exc

    raise HTTPException(429, "All Groq keys exhausted for Q&A.")
