import os
from groq import Groq
from fastapi import HTTPException

MAX_CHARS = 380000  # ~95k tokens, leaves headroom for system prompt + response

SYSTEM_PROMPT = """You are NyayaSetu — India's bridge between law and citizens.
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
- [Fifth point — add more if needed]

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
	# Also support legacy single GROQ_API_KEY as fallback
	legacy = os.getenv("GROQ_API_KEY")
	if legacy and legacy.strip() and legacy.strip() not in keys:
		keys.append(legacy.strip())
	return keys


async def summarize(compressed_text: str) -> str:
	# --- Context window guard ---
	if len(compressed_text) > MAX_CHARS:
		print(f"[Groq] Input too long ({len(compressed_text)} chars), truncating to {MAX_CHARS}")
		compressed_text = compressed_text[:MAX_CHARS]

	keys = get_groq_keys()
	if not keys:
		raise HTTPException(500, "No Groq API keys configured. Add GROQ_API_KEY_1 to .env")

	last_error = None

	for i, key in enumerate(keys):
		try:
			print(f"[Groq] Trying key {i+1}/{len(keys)}")
			client = Groq(api_key=key)
			response = client.chat.completions.create(
				model="llama-3.3-70b-versatile",
				messages=[
					{"role": "system", "content": SYSTEM_PROMPT},
					{"role": "user", "content": compressed_text}
				],
				max_tokens=1500,
				temperature=0.3,
			)
			print(f"[Groq] Success with key {i+1}")
			return response.choices[0].message.content

		except Exception as e:
			error_str = str(e)
			if "429" in error_str:
				print(f"[Groq] Key {i+1} hit 429 rate limit, trying next key...")
				last_error = e
				continue
			elif "400" in error_str and "reduce" in error_str.lower():
				# Message still too long even after initial truncation — truncate harder
				print(f"[Groq] Key {i+1} got 400 too long, truncating to 70% and retrying same key...")
				compressed_text = compressed_text[:int(MAX_CHARS * 0.7)]
				last_error = e
				continue
			else:
				raise HTTPException(502, f"Groq error: {error_str}")

	raise HTTPException(429, f"All {len(keys)} Groq keys exhausted. Try again later.")
