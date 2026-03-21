import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from services import groq_summarizer, pdf_parser, scaledown_service
from services.supabase_service import (
	save_analysis, get_user_history,
	get_analysis_by_share_id, get_global_stats
)
from services.groq_summarizer import summarize, answer_question

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
async def analyze(
	file: UploadFile = File(...),
	language: str = Form(default="english"),
	user_id: str = Form(default=None)
):
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

		summary = await summarize(compression_result["compressed_text"], language)
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

		analysis_record = {}
		if user_id and user_id.strip():
			analysis_record = save_analysis(
				user_id=user_id,
				document_name=file.filename,
				document_pages=pages,
				summary=summary,
				language=language,
				metrics={
					"original_tokens": original,
					"compressed_tokens": compressed,
					"tokens_saved": tokens_saved,
					"compression_percentage": pct,
					"compression_ratio": compression_ratio,
					"energy_saved_kwh": energy_saved_kwh,
					"co2_saved_grams": co2_saved_grams,
					"cost_saved_usd": cost_saved_usd,
					"information_density": information_density,
					"scaledown_latency_ms": compression_result["latency_ms"],
				}
			)

		return {
			"success": True,
			"document_name": filename,
			"document_pages": pages,
			"summary": summary,
			"language": language,
			"compressed_text": compression_result["compressed_text"],
			"share_id": analysis_record.get("share_id"),
			"analysis_id": str(analysis_record.get("id", "")),
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


@app.get("/api/history/{user_id}")
async def history(user_id: str):
	return {"history": get_user_history(user_id)}


@app.get("/api/share/{share_id}")
async def shared_analysis(share_id: str):
	data = get_analysis_by_share_id(share_id)
	if not data:
		raise HTTPException(404, "Analysis not found or not public")
	return data


@app.get("/api/stats")
async def stats():
	return get_global_stats()


@app.post("/api/qa")
async def citizen_qa(request: Request):
	body = await request.json()
	question = body.get("question", "").strip()
	compressed_context = body.get("compressed_context", "").strip()
	language = body.get("language", "english")

	if not question:
		raise HTTPException(400, "question is required")
	if not compressed_context:
		raise HTTPException(400, "compressed_context is required")
	if len(question) > 500:
		raise HTTPException(400, "Question too long (max 500 chars)")

	answer = await answer_question(compressed_context, question, language)
	return {"answer": answer, "question": question}

@app.delete("/api/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str):
	from services.supabase_service import delete_analysis as _delete
	deleted = _delete(analysis_id)
	if not deleted:
		raise HTTPException(404, "Analysis not found")
	return {"success": True, "deleted_id": analysis_id}

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
