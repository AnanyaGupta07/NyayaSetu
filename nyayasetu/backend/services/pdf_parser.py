import re

import fitz
from fastapi import HTTPException


def extract_text_from_pdf(file_bytes: bytes) -> dict:
	try:
		with fitz.open(stream=file_bytes, filetype="pdf") as doc:
			if len(doc) == 0:
				raise HTTPException(status_code=400, detail="PDF has no pages")

			page_text = [page.get_text() for page in doc]
			text = "\n\n".join(page_text)
			pages = len(doc)

		text = text.replace("\x00", "")
		text = re.sub(r"[ \t]+", " ", text)
		text = re.sub(r"\n{3,}", "\n\n", text)
		text = text.strip()

		if len(text) < 100:
			raise HTTPException(
				status_code=400,
				detail="Could not extract text. Is this a scanned image PDF?",
			)

		return {
			"text": text,
			"pages": pages,
			"char_count": len(text),
			"approx_tokens": len(text) // 4,
		}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))
