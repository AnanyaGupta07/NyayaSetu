import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from services import groq_summarizer, pdf_parser, scaledown_service

load_dotenv()

SCALEDOWN_API_KEY = os.environ.get("SCALEDOWN_API_KEY")

app = FastAPI(title="NyayaSetu API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
	return {"status": "ok", "service": "NyayaSetu", "version": "1.0"}


@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...)):
	try:
		contents = await file.read()

		filename = file.filename or ""
		if not filename.lower().endswith(".pdf"):
			raise HTTPException(status_code=400, detail="Only PDF files are supported")

		parsed = pdf_parser.extract_text_from_pdf(contents)
		text = parsed["text"]
		pages = parsed["pages"]
		approx_tokens = parsed["approx_tokens"]

		print(f"[NyayaSetu] Processing: {filename} ({pages} pages, ~{approx_tokens} tokens)")

		compression_result = await scaledown_service.compress_legal_document(text, SCALEDOWN_API_KEY)

		original = compression_result["original_tokens"]
		compressed = compression_result["compressed_tokens"]
		pct = compression_result["compression_percentage"]

		print(f"[NyayaSetu] Compression: {original} → {compressed} tokens ({pct}% reduction)")

		summary = await groq_summarizer.summarize(compression_result["compressed_text"])
		print("[NyayaSetu] Summary generated successfully")

		tokens_saved = compression_result["tokens_saved"]
		energy_saved_kwh = round(tokens_saved * 0.000000001 * 1000, 6)
		co2_saved_grams = round(energy_saved_kwh * 708, 4)
		cost_saved_usd = round(tokens_saved * 0.0000025, 5)

		compression_ratio = compression_result["compression_ratio"]
		information_density = round(
			min(0.99, (compression_ratio - 1) / compression_ratio * 0.95 + 0.05),
			3,
		)

		return {
			"success": True,
			"document_name": filename,
			"document_pages": pages,
			"summary": summary,
			"metrics": {
				"original_tokens": compression_result["original_tokens"],
				"compressed_tokens": compression_result["compressed_tokens"],
				"tokens_saved": compression_result["tokens_saved"],
				"compression_percentage": compression_result["compression_percentage"],
				"compression_ratio": compression_result["compression_ratio"],
				"energy_saved_kwh": energy_saved_kwh,
				"co2_saved_grams": co2_saved_grams,
				"cost_saved_usd": cost_saved_usd,
				"information_density": information_density,
				"scaledown_latency_ms": compression_result["latency_ms"],
			},
		}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))

