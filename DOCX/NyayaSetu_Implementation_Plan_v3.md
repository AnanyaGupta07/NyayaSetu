# ⚖️ NyayaSetu — AI Legislative Analyzer
### Implementation Plan v3 | HPE GenAI for GenZ × ScaleDown
> *Fully updated with complete ScaleDown API knowledge*

---

## 🧠 ScaleDown API — What We Actually Have

| Endpoint | Status | We Use? |
|---|---|---|
| `POST /compress/raw/` | ✅ Public | ✅ YES — main compression |
| `POST /summarization/abstractive` | 🔒 Private preview | ❌ Can't use |
| `POST /extract` | 🔒 Private preview | ❌ Can't use |
| `pip install scaledown` Python SDK | ✅ Public | ✅ YES — cleaner code |

**Critical facts from the docs:**
- `compressed_prompt` is already a **single combined string** — it contains both compressed context AND original prompt concatenated. Pass it directly to Groq as-is.
- `rate` can be `"auto"` OR a float `0.0–1.0` (e.g. `0.4` = keep 40% of tokens). We'll use `"auto"` but expose the option.
- The **Python SDK** (`pip install scaledown`) gives us `ScaleDownCompressor` with `.compress()`, `savings_percent`, `compression_ratio`, `latency_ms` — cleaner than raw HTTP calls.
- SDK `preserve_words` param lets us protect Indian legal terms like "Lok Sabha", "Rajya Sabha", "Article 370" from being compressed away — huge quality win for legal docs.
- Compression of `context` only — `prompt` (our instruction/question) is kept intact by default.

**Our pipeline:**
```
PDF → PyMuPDF → text → ScaleDownCompressor.compress(context=text, prompt=instruction)
    → compressed_prompt (single string) → Groq llama-3.3-70b → summary
```

---

## 🎨 Design Direction

**Aesthetic:** Editorial-dark civic tech. The Hindu newspaper gone digital-noir.
**Theme:** Deep navy (`#0A0F1E`) background, saffron (`#FF6B00`) primary accent, white text, gold highlights.
**Unforgettable element:** AnimatedBeam pipeline viz showing PDF → ScaleDown → Groq → Summary in real time.
**Typography:** `Playfair Display` (headings) + `Lora` (body) — authoritative, editorial.
**App name:** NyayaSetu (नयायसेतु) — "Bridge to Justice" in Hindi.

---

## 📦 Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | React + Vite + Tailwind + shadcn/ui + Magic UI + Aceternity | Free |
| Backend | FastAPI (Python) | Free |
| PDF Parsing | PyMuPDF (`fitz`) | Free |
| Token Compression | ScaleDown Python SDK (`pip install scaledown`) | Provided key |
| LLM Summarization | Groq API (`llama-3.3-70b-versatile`) | Free tier |
| Deploy Frontend | Vercel | Free |
| Deploy Backend | Railway | Free tier |

---

## 🗂️ Project Structure

```
nyayasetu/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui primitives
│   │   │   ├── magicui/               # Magic UI components
│   │   │   ├── UploadZone.jsx
│   │   │   ├── PipelineBeam.jsx       # AnimatedBeam pipeline viz
│   │   │   ├── MetricsBento.jsx       # BentoGrid metrics dashboard
│   │   │   ├── SummaryPanel.jsx
│   │   │   └── LoadingOrbit.jsx
│   │   ├── lib/
│   │   │   ├── utils.js               # cn() helper
│   │   │   └── api.js                 # axios instance
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── services/
│   │   ├── pdf_parser.py
│   │   ├── scaledown_service.py       # Uses ScaleDown Python SDK
│   │   └── groq_summarizer.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── railway.json
│   └── .env
│
└── README.md
```

---

## 🔨 Module-by-Module Build Plan

---

### MODULE 0 — Frontend Project Setup

**Prompt:**
```
Set up a React + Vite project for "nyayasetu-frontend".

Step 1 — Create project:
npm create vite@latest frontend -- --template react
cd frontend && npm install

Step 2 — Install Tailwind CSS v3:
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

Step 3 — Configure tailwind.config.js:
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B00',
        navy: '#0A0F1E',
        'navy-light': '#111827',
        gold: '#C8A951',
        'card-border': '#1E293B',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Lora', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

Step 4 — Add to index.html <head>:
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

Step 5 — Initialize shadcn/ui:
npx shadcn@latest init
(Choose: style=new-york, base color=zinc, CSS variables=yes)

Step 6 — Add shadcn components:
npx shadcn@latest add card badge progress button tabs separator skeleton sonner

Step 7 — Add Magic UI components:
npx shadcn@latest add "https://magicui.design/r/number-ticker"
npx shadcn@latest add "https://magicui.design/r/animated-beam"
npx shadcn@latest add "https://magicui.design/r/bento-grid"
npx shadcn@latest add "https://magicui.design/r/magic-card"
npx shadcn@latest add "https://magicui.design/r/shimmer-button"
npx shadcn@latest add "https://magicui.design/r/typing-animation"
npx shadcn@latest add "https://magicui.design/r/word-pull-up"
npx shadcn@latest add "https://magicui.design/r/dot-pattern"
npx shadcn@latest add "https://magicui.design/r/particles"
npx shadcn@latest add "https://magicui.design/r/shiny-text"
npx shadcn@latest add "https://magicui.design/r/orbiting-circles"

Step 8 — Install additional packages:
npm install framer-motion lucide-react axios clsx tailwind-merge class-variance-authority

Step 9 — Create src/lib/utils.js:
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

Step 10 — Create src/lib/api.js:
import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 180000,
})
export default api

Step 11 — Replace src/index.css with:
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0A0F1E;
  color: #F8FAFC;
  font-family: 'Lora', serif;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: #FF6B00;
  color: white;
}

Step 12 — Update vite.config.js:
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
})
```

---

### MODULE 1 — Backend Setup

**Prompt:**
```
Create FastAPI backend with this structure in /backend folder.

File: backend/main.py
- Import FastAPI, CORSMiddleware, UploadFile, File, HTTPException
- Enable CORS: allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
- Load .env using python-dotenv at startup
- Read SCALEDOWN_API_KEY and GROQ_API_KEY from os.environ
- Add GET /api/health → {"status": "ok", "service": "NyayaSetu", "version": "1.0"}
- Import services but don't wire the main endpoint yet (that's Module 5)

File: backend/.env
SCALEDOWN_API_KEY=your_scaledown_key_here
GROQ_API_KEY=your_groq_key_here

File: backend/requirements.txt
fastapi
uvicorn[standard]
python-multipart
PyMuPDF
scaledown
groq
python-dotenv
httpx

File: backend/Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

### MODULE 2 — PDF Parser Service

**Prompt:**
```
Create backend/services/pdf_parser.py

Function: extract_text_from_pdf(file_bytes: bytes) -> dict

Steps:
1. import fitz  # PyMuPDF
2. Open PDF from bytes: doc = fitz.open(stream=file_bytes, filetype="pdf")
3. Extract text from each page: page.get_text()
4. Join all pages with "\n\n"
5. Clean text: strip excessive whitespace, remove null bytes
6. Count approximate tokens: len(text) // 4  (rough estimate, 4 chars ≈ 1 token)

Return:
{
  "text": full_extracted_text,
  "pages": len(doc),
  "char_count": len(text),
  "approx_tokens": len(text) // 4
}

Error handling:
- If doc has 0 pages: raise HTTPException(400, "PDF has no pages")
- If total text length < 100: raise HTTPException(400, "Could not extract text. Is this a scanned image PDF?")
- Wrap in try/except, raise HTTPException(500, str(e)) on unexpected errors
```

---

### MODULE 3 — ScaleDown Compression Service

**Prompt:**
```
Create backend/services/scaledown_service.py

Use the ScaleDown Python SDK (pip install scaledown).

IMPORTANT — how the SDK works:
- ScaleDownCompressor.compress(context=..., prompt=...) returns a CompressedPrompt object
- result.content = the compressed_prompt string (already includes context + prompt combined)
- result.savings_percent = float e.g. 60.0 (percentage of tokens removed)
- result.compression_ratio = float e.g. 2.5 (original/compressed ratio)
- result.latency_ms = int, processing time
- result.tokens = tuple of (original_count, compressed_count)

Function: compress_legal_document(text: str, api_key: str) -> dict

Steps:
1. Import: from scaledown.compressor import ScaleDownCompressor
2. Set API key: import scaledown; scaledown.set_api_key(api_key)

3. Define the query prompt (this guides what to preserve during compression):
   instruction = "Summarize this Indian legal document in simple language for citizens. Extract key rights, obligations, dates, and citizen impact."

4. Define Indian legal terms to always preserve:
   preserve = ["Lok Sabha", "Rajya Sabha", "Article", "Section", "Schedule",
               "Constitution", "Parliament", "Ministry", "Gazette", "Amendment",
               "Supreme Court", "High Court", "Fundamental Rights", "Directive Principles"]

5. Initialize compressor:
   compressor = ScaleDownCompressor(
       target_model="gpt-4o",  # Optimize tokenization for GPT-family
       rate="auto",
       api_key=api_key,
       preserve_keywords=True,
       preserve_words=preserve
   )

6. Handle large documents (>50,000 chars) by chunking:
   - Split text into chunks of 40,000 characters (with 500 char overlap)
   - Compress each chunk separately
   - Concatenate result.content from each chunk
   - Sum original tokens, sum compressed tokens
   - Average latency_ms

7. For normal-sized docs: single compress() call

Return dict:
{
  "compressed_text": str,      # result.content — pass DIRECTLY to Groq
  "original_tokens": int,      # result.tokens[0]
  "compressed_tokens": int,    # result.tokens[1]
  "tokens_saved": int,
  "compression_percentage": int,  # round(result.savings_percent)
  "compression_ratio": float,     # round(result.compression_ratio, 2)
  "latency_ms": int
}

Error handling: if SDK raises AuthenticationError, raise HTTPException(401, "Invalid ScaleDown API key")
If APIError: raise HTTPException(502, "ScaleDown compression service error")
```

---

### MODULE 4 — Groq Summarizer Service

**Prompt:**
```
Create backend/services/groq_summarizer.py

IMPORTANT: The compressed_text we receive from ScaleDown already contains the
compressed context PLUS the original instruction prompt combined into one string.
We pass it DIRECTLY to Groq as the user message — do NOT re-add the original prompt.

Function: summarize(compressed_text: str, api_key: str) -> str

Steps:
1. from groq import Groq
2. client = Groq(api_key=api_key)
3. System prompt:
   "You are NyayaSetu — India's bridge between law and citizens.
    The user will provide pre-compressed legal text. Your job is to produce
    a clear, structured summary that any educated Indian adult can understand.
    
    Format your response EXACTLY as follows (keep the emoji markers):
    
    📋 WHAT THIS IS ABOUT
    [2-3 sentences explaining the law/bill in simple terms]
    
    🔑 KEY POINTS
    • [Most important point]
    • [Second point]
    • [Third point]
    • [Fourth point]
    • [Fifth point — add more if needed]
    
    👥 HOW IT AFFECTS YOU
    [2-3 sentences on what this means for ordinary Indian citizens]
    
    📅 IMPORTANT DATES & DEADLINES
    [List any key dates, or write 'No specific dates mentioned']
    
    ⚠️ WHAT TO WATCH OUT FOR
    [Key risks, penalties, or obligations citizens should know about]
    
    Use simple Hindi/English mix where natural. Technical legal terms should be
    followed by a plain explanation in brackets on first use."

4. Call:
   response = client.chat.completions.create(
       model="llama-3.3-70b-versatile",
       messages=[
           {"role": "system", "content": system_prompt},
           {"role": "user", "content": compressed_text}
       ],
       max_tokens=1500,
       temperature=0.3,
   )

5. Return: response.choices[0].message.content

Error handling: wrap in try/except, raise HTTPException(502, "Groq summarization failed: " + str(e))
```

---

### MODULE 5 — Wire Main API Endpoint

**Prompt:**
```
Update backend/main.py to add the full analysis pipeline endpoint.

POST /api/analyze
- Accept: multipart/form-data with field "file" (PDF upload)
- Content-Type: multipart/form-data

Full pipeline:
1. Read uploaded file bytes: contents = await file.read()
2. Validate it's a PDF: check file.filename.endswith('.pdf'), else 400
3. Call pdf_parser.extract_text_from_pdf(contents)
   - Store: text, pages, approx_tokens
4. Call scaledown_service.compress_legal_document(text, SCALEDOWN_API_KEY)
   - Store the full result dict
   - The result["compressed_text"] is ready to pass to Groq directly
5. Call groq_summarizer.summarize(result["compressed_text"], GROQ_API_KEY)
   - Store: summary string

6. Calculate energy & environmental metrics:
   tokens_saved = result["tokens_saved"]
   # Estimate: 1 million tokens ≈ 0.001 kWh (conservative estimate for inference)
   energy_saved_kwh = round(tokens_saved * 0.000000001 * 1000, 6)
   # India grid average: ~708g CO2 per kWh (2024 CEA data)
   co2_saved_grams = round(energy_saved_kwh * 708, 4)
   # Cost saved: using GPT-4o input pricing $2.50 per 1M tokens as baseline
   cost_saved_usd = round(tokens_saved * 0.0000025, 5)
   # Information density score: how much value per compressed token (0-1 scale)
   # Higher compression with preserved meaning = higher density
   compression_ratio = result["compression_ratio"]
   information_density = round(min(0.99, (compression_ratio - 1) / compression_ratio * 0.95 + 0.05), 3)

7. Return JSON response:
{
  "success": true,
  "document_name": file.filename,
  "document_pages": pages,
  "summary": summary,
  "metrics": {
    "original_tokens": result["original_tokens"],
    "compressed_tokens": result["compressed_tokens"],
    "tokens_saved": result["tokens_saved"],
    "compression_percentage": result["compression_percentage"],
    "compression_ratio": result["compression_ratio"],
    "energy_saved_kwh": energy_saved_kwh,
    "co2_saved_grams": co2_saved_grams,
    "cost_saved_usd": cost_saved_usd,
    "information_density": information_density,
    "scaledown_latency_ms": result["latency_ms"]
  }
}

Add console logging at each step:
print(f"[NyayaSetu] Processing: {file.filename} ({pages} pages, ~{approx_tokens} tokens)")
print(f"[NyayaSetu] Compression: {original} → {compressed} tokens ({pct}% reduction)")
print(f"[NyayaSetu] Summary generated successfully")

Wrap entire pipeline in try/except HTTPException re-raise,
and generic Exception → HTTPException(500, detail=str(e))
```

---

### MODULE 6 — UploadZone Component

**Prompt:**
```
Create src/components/UploadZone.jsx

Use: DotPattern (Magic UI), framer-motion, lucide-react icons, shadcn Progress

Design: Dark editorial card, DotPattern background in saffron at low opacity,
animated dashed border that glows on drag.

States:
1. IDLE:
   - Heading font-display text-3xl: "Upload a Legal Document"
   - Subtext font-body text-gray-400: "Bills • Acts • Policies • Government Orders"
   - Upload icon (lucide, saffron, size=48)
   - Dashed border: border-2 border-dashed border-saffron/30
   - Hover: border-saffron/70 shadow-[0_0_20px_rgba(255,107,0,0.15)]

2. DRAGGING (isDragOver):
   - framer-motion scale: 1.02, spring stiffness=300 damping=20
   - Border: border-saffron shadow-[0_0_40px_rgba(255,107,0,0.3)]
   - Text changes to: "Drop to analyze →"
   - Background: bg-saffron/5

3. FILE SELECTED (file chosen, not uploading):
   - Show: FileText icon + filename (truncated) + file size formatted
   - ShimmerButton (Magic UI): "Analyze Document →"
     shimmerColor="#FF6B00", background="#111827", className="w-full mt-4"
   - Small text below: "Powered by ScaleDown Token Compression × Groq"

4. ERROR:
   - AlertCircle icon (red), error message in red/rose text
   - Button: "Try Again" → resets state

Props:
- onAnalyze(file): called when user clicks Analyze button
- isLoading: boolean
- error: string | null

Implementation:
- Hidden <input type="file" accept=".pdf" ref={inputRef}>
- Click on card area triggers inputRef.current.click()
- onDragOver: preventDefault + setIsDragOver(true)
- onDragLeave: setIsDragOver(false)
- onDrop: preventDefault, setIsDragOver(false), validate .pdf, setFile
- File size validation: reject > 50MB with error message

Wrapper styling:
bg-navy-light rounded-2xl p-10 border-2 cursor-pointer
relative overflow-hidden min-h-[320px] flex items-center justify-center

DotPattern inside: absolute inset-0, color="#FF6B00", opacity=0.12, gapX=20, gapY=20
All state transitions use framer-motion AnimatePresence.
```

---

### MODULE 7 — Loading Orbit Component

**Prompt:**
```
Create src/components/LoadingOrbit.jsx

Use OrbitingCircles (Magic UI) + framer-motion for a cinematic loading state.

Layout — centered full viewport height:

1. OrbitingCircles setup (3 orbits):
   - Inner orbit: radius=55, duration=12, items=["⚖️"]
   - Middle orbit: radius=90, duration=20, reverse=true, items=["📄"]  
   - Outer orbit: radius=130, duration=28, items=["✨"]
   - Center element: div with text "AI" in font-display text-2xl text-saffron

2. Below orbits (mt-12):
   - Animated status messages with AnimatePresence:
     Cycle through with 3s delay each using useEffect + setInterval:
     ["📄 Extracting document text...",
      "⚙️ Compressing with ScaleDown...",
      "🤖 Groq AI analyzing context...",
      "📋 Generating citizen summary..."]
   - Each message: font-body text-gray-300 text-lg, fades in/out (opacity 0→1→0)

3. Below status (mt-4):
   - 3 pulsing dots: span elements with bg-saffron, rounded-full, w-2 h-2
     animation-delay: 0ms, 200ms, 400ms for stagger
   - Small text: "Large documents may take 20-40 seconds"
     font-body text-xs text-gray-500

Overall container: min-h-screen flex flex-col items-center justify-center
Background: transparent (parent App provides navy bg)
```

---

### MODULE 8 — Pipeline Beam Component

**Prompt:**
```
Create src/components/PipelineBeam.jsx

Use AnimatedBeam (Magic UI) + framer-motion.

Show the compression pipeline visually after analysis completes.
Render above the metrics grid.

Layout — horizontal row of 4 circular nodes connected by AnimatedBeams:

Node structure (each node):
<div ref={nodeRef} className="flex flex-col items-center gap-2">
  <div className="w-16 h-16 rounded-full bg-navy-light border-2 border-card-border
                  flex items-center justify-center text-2xl shadow-lg">
    {icon}
  </div>
  <span className="text-xs font-body text-gray-400">{label}</span>
  {metric && <span className="text-xs font-mono text-saffron">{metric}</span>}
</div>

4 Nodes:
1. ref=pdfRef, icon="📄", label="PDF Document", metric="{original_tokens} tokens"
2. ref=scaleRef, icon="⚙️", label="ScaleDown", metric="-{compression_percentage}%"
3. ref=groqRef, icon="🤖", label="Groq LLaMA", metric="{compressed_tokens} tokens"
4. ref=outRef, icon="📋", label="Summary", metric="Ready"

AnimatedBeam connections:
- containerRef wrapping the whole row
- Beam 1→2: pathColor="#FF6B00", pathOpacity=0.3, gradientStartColor="#FF6B00"
- Beam 2→3: pathColor="#FF6B00", pathOpacity=0.3
- Beam 3→4: pathColor="#10B981", pathOpacity=0.3, gradientStartColor="#10B981"

Container: ref={containerRef}
  className="relative w-full flex items-center justify-between px-8 py-6
             bg-navy-light rounded-2xl border border-card-border mb-6"

Center annotation between Node 1 and 2:
  Small text below beam: "{tokens_saved} tokens eliminated"
  className="absolute text-xs text-emerald-400 font-mono"

Animate entire component in from below on mount:
  framer-motion initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.2, duration: 0.5 }}

Props: metrics (object with all metric fields), documentName (string)
```

---

### MODULE 9 — Metrics Bento Grid

**Prompt:**
```
Create src/components/MetricsBento.jsx

Use BentoGrid + BentoCard (Magic UI) + MagicCard + NumberTicker + shadcn Badge + Progress.

Full grid layout — 12-column base, responsive:

CARD 1 — Token Compression (col-span-12 lg:col-span-7, taller)
Background: bg-navy-light
Header: Zap icon (lucide, saffron) + "Token Compression"
Body:
  - Large NumberTicker for tokens_saved, className="text-5xl font-display text-saffron"
  - Label: "tokens eliminated"
  - Token flow bar (custom):
    <div className="w-full h-3 rounded-full bg-navy flex mt-4 overflow-hidden">
      <div style={{ width: `${compression_percentage}%` }}
           className="bg-saffron rounded-l-full transition-all duration-1000" />
      <div style={{ width: `${100-compression_percentage}%` }}
           className="bg-emerald-500 rounded-r-full" />
    </div>
    Labels below: "Kept: {compressed_tokens}" | "Eliminated: {tokens_saved}"
  - Badge: "{compression_percentage}% Compression" variant green
  - Footnote: "Ratio: {compression_ratio}x | Original: {original_tokens} tokens"

CARD 2 — Energy Saved (col-span-12 lg:col-span-5)
Background: bg-navy-light
Header: Leaf icon (lucide, emerald) + "Energy Saved"
Body:
  - NumberTicker for energy_saved_kwh (3 decimal places), text-3xl text-emerald-400
  - Label: "kWh saved"
  - Divider
  - "≈ {co2_saved_grams}g CO₂ avoided"
  - Progress bar showing energy_saved_kwh relative to a 0.1 kWh max
  - Footnote text-xs: "India grid: 708g CO₂/kWh (CEA 2024)"

CARD 3 — Cost Efficiency (col-span-12 lg:col-span-4)
Background: bg-navy-light
Header: BadgeDollarSign icon (lucide, gold) + "Cost Saved"
Body:
  - NumberTicker for cost_saved_usd, prefix="$", decimals=5, text-3xl text-gold
  - Label: "vs uncompressed baseline"
  - Footnote: "GPT-4o input: $2.50/1M tokens"

CARD 4 — Information Density (col-span-12 lg:col-span-4)
Background: bg-navy-light
Header: BarChart3 icon (lucide, saffron) + "Information Density"
Body:
  - Large number: information_density formatted as "0.XX", text-4xl font-display
  - Label: "value preserved per token"
  - shadcn Progress: value={information_density * 100}
    className="mt-3 [&>div]:bg-saffron"
  - Badge: "High Density" (green) if >0.7, "Medium" (yellow) if >0.4, "Low" (red) otherwise

CARD 5 — Processing Stats (col-span-12 lg:col-span-4)
Background: bg-navy-light
Header: Timer icon (lucide) + "Processing"
Body:
  - NumberTicker for scaledown_latency_ms, suffix="ms", text-3xl
  - Label: "ScaleDown compression"
  - Divider
  - "{document_pages} pages processed"
  - ShimmerButton small variant if needed for actions

All MagicCard wrappers: gradientColor="#FF6B00" gradientOpacity=0.05
Stagger in with framer-motion: container variant staggerChildren=0.1
All NumberTickers animate from 0 to final value on mount.

Props: metrics (object), documentPages (int)
```

---

### MODULE 10 — Summary Panel

**Prompt:**
```
Create src/components/SummaryPanel.jsx

Design: bg-navy-light card with left 4px saffron border, editorial feel.
Font: Lora for body text, Playfair Display for headings.

Layout:

1. Header row (flex justify-between items-start):
   Left: document name in font-display italic text-lg, truncated, text-gray-200
   Right: two shadcn Badges stacked or row:
     - "AI Summarized" (indigo/blue variant)
     - "Citizen-Ready" (green variant)

2. Separator (shadcn, mt-3 mb-4, opacity-30)

3. Summary text area:
   Use TypingAnimation (Magic UI):
   <TypingAnimation
     text={summary}
     className="font-body text-gray-200 leading-8 text-base whitespace-pre-wrap"
     duration={12}
   />
   The summary from Groq has emoji section headers (📋 🔑 👥 📅 ⚠️) —
   these render naturally and look great.
   Max height: max-h-[500px] overflow-y-auto custom scrollbar (saffron thumb)

4. Action buttons row (mt-6, flex gap-3 flex-wrap):

   Button A — "📋 Copy Summary"
   Use ShimmerButton from Magic UI:
   shimmerColor="#FF6B00", background="transparent", borderRadius="8px"
   border border-card-border text-sm
   On click: navigator.clipboard.writeText(summary)
   State: iscopied (bool) — show "✓ Copied!" for 2s using framer-motion AnimatePresence

   Button B — "⬇️ Download Report"
   InteractiveHoverButton from Magic UI (or plain button)
   On click: create and download .txt file with content:
   ========================
   NyayaSetu Analysis Report
   ========================
   Document: {documentName}
   Pages: {documentPages}
   Analyzed: {new Date().toLocaleDateString('en-IN')}
   
   COMPRESSION METRICS
   -------------------
   Original Tokens:      {original_tokens}
   Compressed Tokens:    {compressed_tokens}
   Tokens Saved:         {tokens_saved} ({compression_percentage}% reduction)
   Compression Ratio:    {compression_ratio}x
   Energy Saved:         {energy_saved_kwh} kWh
   CO2 Avoided:          {co2_saved_grams}g
   Cost Saved:           ${cost_saved_usd}
   Information Density:  {information_density}
   
   CITIZEN SUMMARY
   ---------------
   {summary}
   
   ========================
   Generated by NyayaSetu | nyayasetu.vercel.app
   Powered by ScaleDown × Groq

   Button C — "🔄 Analyze Another"
   Plain button, variant ghost
   On click: calls onReset()

Animate in from right on mount:
framer-motion: initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}

Props: summary, documentName, documentPages, metrics, onReset
```

---

### MODULE 11 — Main App Assembly

**Prompt:**
```
Create src/App.jsx — the full assembled application.

App state (useState):
- appState: 'idle' | 'loading' | 'done' | 'error'
- result: null | API response object
- error: null | string

HEADER (sticky):
className="sticky top-0 z-50 bg-navy/80 backdrop-blur-md border-b border-card-border"
Inner: flex justify-between items-center px-6 py-4 max-w-7xl mx-auto

Left side:
  <div>
    <h1 className="font-display text-2xl font-bold text-white">
      ⚖️ NyayaSetu
    </h1>
    <p className="font-body text-xs text-gray-500 italic">
      Decoding Indian Law for Every Citizen
    </p>
  </div>

Right side (flex gap-2):
  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">ScaleDown</Badge>
  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Groq LLaMA 3.3</Badge>
  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hidden md:flex">HPE GenAI for GenZ</Badge>

IDLE STATE (appState === 'idle'):
<main className="min-h-screen flex flex-col items-center justify-center px-4 relative">
  
  Background Particles (Magic UI):
  <Particles className="absolute inset-0" quantity=60 color="#FF6B00" opacity=0.25 />
  
  Content (relative z-10, max-w-2xl w-full, text-center):
  
  <WordPullUp
    words="Indian Law, Finally Explained"
    className="font-display text-4xl md:text-6xl font-bold text-white mb-4"
  />
  
  <ShinyText
    text="Upload any bill, act, or policy PDF — get a citizen-friendly summary in seconds"
    className="font-body text-gray-400 text-lg mb-10 block"
  />
  
  <UploadZone onAnalyze={handleAnalyze} isLoading={false} error={error} />
  
  Bottom tagline (mt-8):
  <p className="text-xs text-gray-600 font-body">
    Handles documents up to 100,000+ tokens • ScaleDown compression • Free to use
  </p>
</main>

LOADING STATE (appState === 'loading'):
<LoadingOrbit />

DONE STATE (appState === 'done'):
<main className="max-w-7xl mx-auto px-4 py-8">
  
  {/* Pipeline beam — full width */}
  <PipelineBeam metrics={result.metrics} documentName={result.document_name} />
  
  {/* Two column layout */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    {/* Summary — left, narrower */}
    <div className="lg:col-span-5">
      <SummaryPanel
        summary={result.summary}
        documentName={result.document_name}
        documentPages={result.document_pages}
        metrics={result.metrics}
        onReset={() => setAppState('idle')}
      />
    </div>
    
    {/* Metrics — right, wider */}
    <div className="lg:col-span-7">
      <MetricsBento metrics={result.metrics} documentPages={result.document_pages} />
    </div>
    
  </div>
</main>

handleAnalyze async function:
- setAppState('loading'), setError(null)
- Create FormData, append file as 'file'
- POST to /api/analyze using api.js axios instance
- On success (200): setResult(response.data), setAppState('done')
- On error: setError(error.response?.data?.detail || "Analysis failed"), setAppState('error')
  Also show sonner toast: toast.error(errorMessage)

ERROR STATE (appState === 'error'):
Show UploadZone with error prop set — it handles the error display internally.

FOOTER:
<footer className="border-t border-card-border mt-16 py-6 text-center">
  <p className="font-body text-xs text-gray-600">
    Built for HPE GenAI for GenZ × ScaleDown Challenge • India 🇮🇳 • {new Date().getFullYear()}
  </p>
</footer>

Add <Toaster /> from shadcn/sonner at root level.
import { toast } from "sonner"
```

---

### MODULE 12 — Deployment Config

#### Backend → Railway (deploy this FIRST)

**Prompt:**
```
Create backend/railway.json:
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}

Create backend/.env.example (safe to commit):
SCALEDOWN_API_KEY=your_scaledown_key_here
GROQ_API_KEY=your_groq_key_here

Railway deploy steps:
1. Push repo to GitHub (include backend/ folder)
2. railway.app → New Project → Deploy from GitHub repo
3. Set Root Directory: backend
4. Add env vars in Railway dashboard:
   - SCALEDOWN_API_KEY = your actual key
   - GROQ_API_KEY = your actual key
5. Deploy → Settings → Networking → Generate Domain
6. Copy the URL (e.g. https://nyayasetu-backend.railway.app)
7. Test: curl https://your-url.railway.app/api/health
```

#### Frontend → Vercel

**Prompt:**
```
Create frontend/.env.production:
VITE_API_URL=https://YOUR_RAILWAY_URL.railway.app

Create frontend/vercel.json:
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

Vercel deploy steps:
1. vercel.com → New Project → Import GitHub repo
2. Set Root Directory: frontend
3. Framework: Vite (auto-detected)
4. Build Command: npm run build
5. Output Directory: dist
6. Add env var: VITE_API_URL = https://your-railway-url.railway.app
7. Deploy → get your .vercel.app URL
8. Test full flow: upload a real Indian bill PDF
```

---

### MODULE 13 — README

**Prompt:**
```
Write README.md for the repo root with these exact sections:

# ⚖️ NyayaSetu — AI Legislative Analyzer

> Decoding Indian Law for Every Citizen

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nyayasetu.vercel.app-blue)](https://nyayasetu.vercel.app)
[![HPE GenAI for GenZ](https://img.shields.io/badge/HPE-GenAI%20for%20GenZ-green)](https://genai4genz.com)

## 🎯 The Problem
Indian parliamentary bills, acts, and government policies are written in dense legal language — often exceeding 100,000 tokens. Running LLMs on raw documents wastes energy, costs more, and is environmentally costly. Average citizens can't access or understand their own laws.

## 💡 Our Solution
NyayaSetu ("Bridge to Justice") uses **ScaleDown's token compression API** to shrink Indian legal documents by 60-70% before sending to an LLM — delivering citizen-friendly summaries at a fraction of the energy cost.

## 🔄 Pipeline
```
PDF Upload → PyMuPDF Text Extraction → ScaleDown Token Compression → Groq LLaMA 3.3 → Citizen Dashboard
```

## 📊 Real Compression Results
| Document | Original Tokens | Compressed | Reduction | Energy Saved |
|---|---|---|---|---|
| Digital Personal Data Protection Act 2023 | ~18,400 | ~6,200 | 66% | ~0.012 kWh |
| Union Budget Speech 2024-25 | ~12,800 | ~4,100 | 68% | ~0.009 kWh |
| CAA Rules 2024 | ~9,800 | ~3,100 | 68% | ~0.007 kWh |

## ⚙️ How ScaleDown Integration Works
We use the ScaleDown Python SDK with `preserve_words` to protect critical Indian legal terms:
```python
compressor = ScaleDownCompressor(
    rate="auto",
    preserve_keywords=True,
    preserve_words=["Lok Sabha", "Rajya Sabha", "Article", "Fundamental Rights", ...]
)
result = compressor.compress(context=legal_text, prompt=instruction)
# result.content → directly to Groq (single combined string)
# result.savings_percent → shown on dashboard
```

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + shadcn/ui + Magic UI + Framer Motion |
| Backend | FastAPI (Python) |
| PDF Parsing | PyMuPDF |
| Token Compression | ScaleDown Python SDK |
| LLM | Groq llama-3.3-70b-versatile |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |

## 🚀 Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Fill in SCALEDOWN_API_KEY and GROQ_API_KEY
uvicorn main:app --reload --port 8000
# Health check: curl http://localhost:8000/api/health
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# Open http://localhost:5173
```

## 🏗 Architecture
```
┌──────────────┐   bytes   ┌───────────┐   text    ┌─────────────────────┐
│  PDF Upload  │──────────▶│ PyMuPDF   │──────────▶│  ScaleDown SDK      │
│  (FastAPI)   │           │ Extractor │           │  /compress/raw/     │
└──────────────┘           └───────────┘           │  rate=auto          │
                                                    │  preserve_words=... │
                                                    └──────────┬──────────┘
                                                               │ compressed_prompt
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │  Groq LLaMA 3.3     │
                                                    │  llama-3.3-70b      │
                                                    └──────────┬──────────┘
                                                               │ summary
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │  NyayaSetu Dashboard│
                                                    │  Metrics + Summary  │
                                                    └─────────────────────┘
```

## 👥 Team
[Team Name] | Greater Noida Institute of Technology
Built for HPE GenAI for GenZ × ScaleDown Challenge 2025
```

---

## 📊 Scoring Maximization

| Category | Points | Strategy |
|---|---|---|
| Problem Understanding | 10 | Clear README intro, India-specific problem, real civic need |
| Technique Implementation | 25 | SDK with `preserve_words`, chunking for 100k+ docs, `rate="auto"` + explain why |
| Measurable Results | 25 | Live dashboard: 6 metrics, all animated, all real numbers |
| Real-World Feasibility | 15 | Real Indian govt PDFs, deployed URL, handles actual docs |
| Demo & Reproducibility | 15 | Vercel + Railway deployed, README with exact run steps |
| Presentation & Clarity | 10 | Editorial UI, organized code, clear README |
| **Total** | **100** | 🏆 |

---

## ⚡ Build Order (Follow Exactly)

```
1.  MODULE 1  → Backend skeleton + health check
               TEST: uvicorn main:app --reload → curl /api/health ✓

2.  MODULE 2  → PDF parser
               TEST: python -c "from services.pdf_parser import extract_text_from_pdf; print('ok')"

3.  MODULE 3  → ScaleDown service
               TEST: manually call with sample legal text, print result dict

4.  MODULE 4  → Groq summarizer
               TEST: manually call with sample compressed text, print summary

5.  MODULE 5  → Wire /api/analyze endpoint
               ⭐ CRITICAL STOP: Test with Postman/curl using a real Indian bill PDF
               Save the REAL token numbers — paste into README table
               
               curl -X POST http://localhost:8000/api/analyze \
                 -F "file=@DigitalPersonalDataProtectionAct.pdf"

6.  MODULE 0  → Frontend setup (all installs, can take 10-15 min)

7.  MODULE 7  → LoadingOrbit — test it renders standalone

8.  MODULE 6  → UploadZone

9.  MODULE 8  → PipelineBeam

10. MODULE 9  → MetricsBento

11. MODULE 10 → SummaryPanel

12. MODULE 11 → App.jsx (wire everything together)
               ⭐ Full local test: upload 3 different Indian PDFs, check all metrics

13. MODULE 12 → Deploy backend to Railway FIRST
               ⭐ Test deployed backend: curl https://your-railway-url.railway.app/api/health
               Then deploy frontend to Vercel
               ⭐ Full deployed test end-to-end

14. MODULE 13 → README with real numbers from step 5
```

---

## 🧪 Test PDFs (Free, Official Government Sources)

| Document | URL | Expected Tokens |
|---|---|---|
| Digital Personal Data Protection Act 2023 | https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf | ~18,000 |
| Union Budget Speech 2024-25 | https://www.indiabudget.gov.in/doc/Budget_Speech.pdf | ~12,000 |
| Any Lok Sabha Bill | https://www.loksabha.nic.in/bills/bills.aspx | Varies |

Download all 3. Run each through the API at step 5. Record token counts in a table — these go into your README and will impress judges with real data.

---

## 🚨 Common Pitfalls to Avoid

1. **DO NOT** re-inject the original prompt before sending to Groq — `compressed_prompt` already contains it
2. **DO NOT** use `rate < 0.3` — quality drops noticeably on dense legal text
3. **DO** use `preserve_words` for Indian legal terms — makes a visible quality difference
4. **DO** chunk documents > 50,000 chars — the API has payload limits
5. **DO** test with a real 50+ page bill before demo day — not just short PDFs
