# ⚖️ NyayaSetu — Implementation Plan v4
### New Features Only | Optimized for Google Antigravity IDE
> Backend: Railway | Frontend Deploy: Netlify via Antigravity built-in MCP

---

## 🧭 Tool Assignment Map

| Task | Tool |
|---|---|
| Write all backend code | Copilot (VS Code) |
| Write all frontend code | Copilot (VS Code) |
| Supabase: create project, tables, SQL, auth config | **Antigravity + Supabase MCP** |
| Netlify: deploy frontend | **Antigravity built-in Netlify MCP** |
| Backend deploy | Railway (manual, same as before) |

---

## ⚠️ Antigravity Rate Limit Strategy

Since Antigravity's MCP rate limit is low, batch your Antigravity sessions:

- **Session 1** — All Supabase setup in one go (MODULE A)
- **Session 2** — Netlify deploy in one go (MODULE F)
- Do NOT use Antigravity for code writing — that's all Copilot

---

## 📋 Build Order

```
MODULE A  → [ANTIGRAVITY] Supabase: project + tables + SQL + auth
MODULE B  → [COPILOT] Backend: install deps + .env updates
MODULE C  → [COPILOT] Backend: supabase_service.py
MODULE D  → [COPILOT] Backend: update groq_summarizer.py (language + Q&A)
MODULE E  → [COPILOT] Backend: update main.py (new endpoints)
             ⭐ TEST backend with curl before touching frontend
MODULE 1  → [COPILOT] Frontend: install deps + redesign tokens
MODULE 2  → [COPILOT] Frontend: supabase.js + useAuth.js
MODULE 3  → [COPILOT] Frontend: AuthModal.jsx
MODULE 4  → [COPILOT] Frontend: LanguageSelector.jsx
MODULE 5  → [COPILOT] Frontend: Update UploadZone.jsx
MODULE 6  → [COPILOT] Frontend: GlobalStatsBar.jsx
MODULE 7  → [COPILOT] Frontend: Restyle MetricsBento.jsx
MODULE 8  → [COPILOT] Frontend: Update SummaryPanel.jsx (share + PDF)
MODULE 9  → [COPILOT] Frontend: ShareButton.jsx
MODULE 10 → [COPILOT] Frontend: CitizenQA.jsx
MODULE 11 → [COPILOT] Frontend: HistorySidebar.jsx
MODULE 12 → [COPILOT] Frontend: SharePage.jsx
MODULE 13 → [COPILOT] Frontend: Update main.jsx (router)
MODULE 14 → [COPILOT] Frontend: Update App.jsx (wire everything)
             ⭐ TEST full flow locally
MODULE F  → [ANTIGRAVITY] Deploy frontend to Netlify
MODULE G  → [MANUAL] Railway: update backend env vars + redeploy
MODULE H  → [COPILOT] Final verification checklist
```

---

## MODULE A — [ANTIGRAVITY] Supabase Full Setup

> Open Antigravity → Install Supabase MCP from MCP Store → New Agent session
> Use Planning mode (not Fast) for this session

**Antigravity prompt (paste this as one task):**
```
Use the Supabase MCP server to complete ALL of the following steps for a new
project called "nyayasetu". Do them in order, pause and confirm before each
major step.

STEP 1 — Create new Supabase project:
- Name: nyayasetu
- Region: ap-south-1 (Mumbai — closest to India)
- Wait for provisioning to complete

STEP 2 — Run this SQL in the SQL editor:

CREATE TABLE global_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_analyses INTEGER DEFAULT 0,
  total_tokens_saved BIGINT DEFAULT 0,
  total_co2_saved_grams FLOAT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO global_stats (id) VALUES (1);

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_pages INTEGER,
  summary TEXT NOT NULL,
  language TEXT DEFAULT 'english',
  original_tokens INTEGER,
  compressed_tokens INTEGER,
  tokens_saved INTEGER,
  compression_percentage INTEGER,
  compression_ratio FLOAT,
  energy_saved_kwh FLOAT,
  co2_saved_grams FLOAT,
  cost_saved_usd FLOAT,
  information_density FLOAT,
  scaledown_latency_ms INTEGER,
  is_public BOOLEAN DEFAULT TRUE,
  share_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analyses"
  ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can read public analyses"
  ON analyses FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Anyone can read global stats"
  ON global_stats FOR SELECT USING (TRUE);
CREATE POLICY "Service role can update global stats"
  ON global_stats FOR UPDATE USING (TRUE);

CREATE OR REPLACE FUNCTION increment_global_stats(tokens_saved_val INT, co2_val FLOAT)
RETURNS void AS $$
BEGIN
  UPDATE global_stats
  SET
    total_analyses = total_analyses + 1,
    total_tokens_saved = total_tokens_saved + tokens_saved_val,
    total_co2_saved_grams = total_co2_saved_grams + co2_val,
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

STEP 3 — Configure Email Auth:
- Enable Email provider
- Enable Email OTP (not magic link)
- Set OTP expiry to 600 seconds (10 minutes)
- Disable email confirmation requirement

STEP 4 — Configure SMTP for Resend:
- SMTP Host: smtp.resend.com
- SMTP Port: 465
- SMTP Username: resend
- SMTP Password: [I will provide the Resend API key]
- Sender name: NyayaSetu
- Sender email: onboarding@resend.dev

STEP 5 — Retrieve and show me these values:
- Project URL
- Anon (public) key
- Service role key (warn me this is secret)

Save all retrieved keys as an artifact so I can copy them.
```

---

## MODULE B — [COPILOT] Backend: Install deps + update .env

**Copilot prompt:**
```
TASK: Update backend dependencies and environment variables.

STEP 1 — Run in backend/ folder:
pip install supabase

STEP 2 — Add to backend/requirements.txt:
supabase

STEP 3 — Add to backend/.env (keep all existing vars, ADD these):
SUPABASE_URL=paste_your_project_url_here
SUPABASE_SERVICE_KEY=paste_your_service_role_key_here

STEP 4 — Verify:
python -c "from supabase import create_client; print('supabase ok')"
```

---

## MODULE C — [COPILOT] Backend: supabase_service.py

**Copilot prompt:**
```
TASK: Create backend/services/supabase_service.py with this exact content:

import os
import uuid
from supabase import create_client, Client
from fastapi import HTTPException


def get_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(500, "Supabase not configured")
    return create_client(url, key)


def save_analysis(user_id: str, document_name: str, document_pages: int,
                  summary: str, language: str, metrics: dict) -> dict:
    client = get_client()
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
        result = client.table("analyses").insert(data).execute()
        client.rpc("increment_global_stats", {
            "tokens_saved_val": int(metrics.get("tokens_saved", 0)),
            "co2_val": float(metrics.get("co2_saved_grams", 0))
        }).execute()
        return result.data[0] if result.data else {"share_id": share_id}
    except Exception as e:
        print(f"[Supabase] Save failed: {e}")
        return {"share_id": share_id}


def get_user_history(user_id: str) -> list:
    try:
        client = get_client()
        result = client.table("analyses") \
            .select("id, document_name, document_pages, language, compression_percentage, tokens_saved, created_at, share_id") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(20) \
            .execute()
        return result.data or []
    except Exception as e:
        print(f"[Supabase] History failed: {e}")
        return []


def get_analysis_by_share_id(share_id: str) -> dict:
    try:
        client = get_client()
        result = client.table("analyses") \
            .select("*") \
            .eq("share_id", share_id.upper()) \
            .eq("is_public", True) \
            .limit(1) \
            .execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"[Supabase] Share fetch failed: {e}")
        return {}


def get_global_stats() -> dict:
    try:
        client = get_client()
        result = client.table("global_stats").select("*").limit(1).execute()
        return result.data[0] if result.data else {
            "total_analyses": 0, "total_tokens_saved": 0, "total_co2_saved_grams": 0
        }
    except Exception as e:
        print(f"[Supabase] Stats failed: {e}")
        return {"total_analyses": 0, "total_tokens_saved": 0, "total_co2_saved_grams": 0}


After creating, verify:
python -c "from services.supabase_service import get_global_stats; print(get_global_stats())"
Should return dict with zero values (not an error).
```

---

## MODULE D — [COPILOT] Backend: Update groq_summarizer.py

**Copilot prompt:**
```
TASK: Two changes to backend/services/groq_summarizer.py.

CHANGE 1 — Add LANGUAGE_INSTRUCTIONS dict right after imports,
before the MAX_CHARS line:

LANGUAGE_INSTRUCTIONS = {
    "english":  "Respond in clear, simple English.",
    "hindi":    "Respond entirely in Hindi using Devanagari script. Use simple everyday Hindi.",
    "tamil":    "Respond entirely in Tamil script. Use simple everyday Tamil.",
    "bengali":  "Respond entirely in Bengali (Bangla) script. Use simple everyday Bengali.",
    "hinglish": "Respond in Hinglish — a natural mix of Hindi and English used by urban Indians. Example style: 'Is bill mein yeh provision hai ki...'"
}


CHANGE 2 — Update summarize() signature and system prompt usage:

Change: async def summarize(compressed_text: str) -> str:
To:     async def summarize(compressed_text: str, language: str = "english") -> str:

Inside the function, right after the MAX_CHARS truncation block, add:
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["english"])
    full_system_prompt = SYSTEM_PROMPT + f"\n\nLANGUAGE INSTRUCTION: {lang_instruction}"

Then in the client.chat.completions.create() call:
Change: {"role": "system", "content": SYSTEM_PROMPT}
To:     {"role": "system", "content": full_system_prompt}


CHANGE 3 — Add answer_question() function at the very end of the file:

async def answer_question(compressed_context: str, question: str, language: str = "english") -> str:
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["english"])
    context = compressed_context[:60000] if len(compressed_context) > 60000 else compressed_context

    qa_system = f"""You are NyayaSetu — India's legal assistant for citizens.
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
            client = Groq(api_key=key)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": qa_system},
                    {"role": "user", "content": f"Legal Context:\n{context}\n\nQuestion: {question}"}
                ],
                max_tokens=600,
                temperature=0.2,
            )
            return response.choices[0].message.content
        except Exception as e:
            if "429" in str(e):
                continue
            raise HTTPException(502, f"Groq Q&A error: {str(e)}")

    raise HTTPException(429, "All Groq keys exhausted for Q&A.")


Do NOT change anything else — MAX_CHARS, get_groq_keys(), the 400 retry logic all stay as-is.
```

---

## MODULE E — [COPILOT] Backend: Update main.py

**Copilot prompt:**
```
TASK: Four changes to backend/main.py.

CHANGE 1 — Add new imports (merge with existing imports, no duplicates):
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from services.supabase_service import (
    save_analysis, get_user_history,
    get_analysis_by_share_id, get_global_stats
)
from services.groq_summarizer import summarize, answer_question


CHANGE 2 — Update /api/analyze signature to accept language and user_id:
Change:
    async def analyze(file: UploadFile = File(...)):
To:
    async def analyze(
        file: UploadFile = File(...),
        language: str = Form(default="english"),
        user_id: str = Form(default=None)
    ):

Pass language to summarize():
Change: summary = await groq_summarizer.summarize(result["compressed_text"])
To:     summary = await summarize(result["compressed_text"], language)

Add Supabase save BEFORE the return statement:
    analysis_record = {}
    if user_id and user_id.strip():
        analysis_record = save_analysis(
            user_id=user_id,
            document_name=file.filename,
            document_pages=pages,
            summary=summary,
            language=language,
            metrics={
                "original_tokens": original_tokens,
                "compressed_tokens": compressed_tokens,
                "tokens_saved": tokens_saved,
                "compression_percentage": compression_percentage,
                "compression_ratio": compression_ratio,
                "energy_saved_kwh": energy_saved_kwh,
                "co2_saved_grams": co2_saved_grams,
                "cost_saved_usd": cost_saved_usd,
                "information_density": information_density,
                "scaledown_latency_ms": scaledown_result["latency_ms"],
            }
        )

Add to the return dict:
    "language": language,
    "compressed_text": scaledown_result["compressed_text"],
    "share_id": analysis_record.get("share_id"),
    "analysis_id": str(analysis_record.get("id", "")),


CHANGE 3 — Add 3 GET endpoints after /api/analyze:

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


CHANGE 4 — Add Q&A endpoint:

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


⭐ AFTER ALL CHANGES — test with curl:

# Health check
curl http://localhost:8000/api/health

# Stats (should return zeros)
curl http://localhost:8000/api/stats

# Analyze with language
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@any_small.pdf" \
  -F "language=hindi"

Confirm response has: summary, language, compressed_text, share_id fields.
```

---

## MODULE 1 — [COPILOT] Frontend: Install deps + redesign tokens

**Copilot prompt:**
```
TASK: Install new frontend dependencies and update design tokens.

STEP 1 — In frontend/ folder:
npm install @supabase/supabase-js jspdf react-router-dom

STEP 2 — Replace frontend/src/index.css entirely with:

@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }

body {
  background-color: #050810;
  color: #F1F5F9;
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #0D1117; }
::-webkit-scrollbar-thumb { background: #FF6B00; border-radius: 4px; }

::selection { background: #FF6B00; color: white; }

.stat-number {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.card-base {
  background: #0D1117;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.dot-pulse { animation: pulse-dot 1.4s ease-in-out infinite; }


STEP 3 — Update tailwind.config.js theme.extend section:

colors: {
  saffron: '#FF6B00',
  'saffron-dim': 'rgba(255,107,0,0.12)',
  navy: '#050810',
  card: '#0D1117',
  'card-hover': '#111827',
  'card-border': 'rgba(255,255,255,0.06)',
  gold: '#C8A951',
  emerald: '#10B981',
},
fontFamily: {
  display: ['"Playfair Display"', 'serif'],
  body: ['"DM Sans"', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
boxShadow: {
  'saffron': '0 0 40px rgba(255,107,0,0.15)',
  'card': '0 4px 24px rgba(0,0,0,0.4)',
},


STEP 4 — Update Google Fonts link in frontend/index.html <head>:
Replace existing fonts link with:
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">


STEP 5 — Add shadcn sheet and skeleton (needed for later modules):
npx shadcn@latest add sheet skeleton
```

---

## MODULE 2 — [COPILOT] Frontend: supabase.js + useAuth.js

**Copilot prompt:**
```
TASK: Create two files.

FILE 1 — Create frontend/src/lib/supabase.js:

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null


FILE 2 — Create frontend/src/hooks/useAuth.js:

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}


FILE 3 — Add to frontend/.env.local:
VITE_SUPABASE_URL=paste_your_supabase_project_url
VITE_SUPABASE_ANON_KEY=paste_your_anon_key
```

---

## MODULE 3 — [COPILOT] Frontend: AuthModal.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/components/AuthModal.jsx

Email OTP auth modal. Two internal states: 'EMAIL' and 'OTP'.
Uses shadcn Dialog, ShimmerButton from Magic UI.

State: email(''), otp(''), authState('EMAIL'), loading(false), error(null), countdown(0)

EMAIL STATE layout (inside Dialog, max-w-md, bg-card border border-card-border rounded-2xl p-8):
- ⚖️ emoji centered, text-4xl, mb-4
- Heading font-display text-2xl text-white: "Welcome to NyayaSetu"
- Subtext text-gray-400 text-sm mb-6: "Sign in to save your analyses and access history"
- shadcn Input: type="email", placeholder="your@email.com"
  className="bg-navy border-card-border focus:border-saffron text-white rounded-xl h-12"
  onKeyDown: if Enter → handleSendOTP()
- ShimmerButton full width mt-3: "Send OTP →"
  shimmerColor="#FF6B00" background="#0D1117"
  disabled={!email.trim() || loading}
- Below: "Continue as guest →" text-gray-600 text-xs cursor-pointer text-center mt-3
  onClick: onClose()
- Error: text-red-400 text-sm mt-2

handleSendOTP:
  const { error } = await supabase.auth.signInWithOtp({
    email, options: { shouldCreateUser: true }
  })
  if (error) setError(error.message)
  else { setAuthState('OTP'); startCountdown() }

startCountdown: setCountdown(60), setInterval decrement, clear at 0


OTP STATE layout:
- Back button ← top-left, onClick: setAuthState('EMAIL')
- Heading: "Check your inbox"
- Subtext: "We sent a 6-digit code to " + <span className="text-saffron">{email}</span>
- Input: type="text" inputMode="numeric" maxLength={6}
  className="text-center text-3xl font-mono tracking-[0.5em] bg-navy border-card-border h-14 rounded-xl"
  value={otp}
  onChange: setOtp(e.target.value.replace(/\D/g,'').slice(0,6))
  useEffect: when otp.length === 6 → auto-call handleVerifyOTP
- ShimmerButton full width mt-3: "Verify →"
  disabled={otp.length < 6 || loading}
- Resend section mt-4 text-center:
  countdown > 0: "Resend in {countdown}s" text-gray-500 text-xs
  countdown === 0: "Resend code →" text-saffron text-xs cursor-pointer
    onClick: handleSendOTP() + reset countdown
- Error: text-red-400 text-sm mt-2

handleVerifyOTP:
  const { data, error } = await supabase.auth.verifyOtp({
    email, token: otp, type: 'email'
  })
  if (error) { setError(error.message); setOtp('') }
  else { onSuccess(data.user); onClose() }

Props: open(bool), onClose(fn), onSuccess(fn)

Wrap everything in shadcn Dialog with open prop.
Dialog has no X close button — only "Continue as guest" closes it.
```

---

## MODULE 4 — [COPILOT] Frontend: LanguageSelector.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/components/LanguageSelector.jsx

const LANGUAGES = [
  { id: "english",  label: "English",  flag: "🇬🇧", native: "English"  },
  { id: "hindi",    label: "Hindi",    flag: "🇮🇳", native: "हिन्दी"   },
  { id: "tamil",    label: "Tamil",    flag: "🇮🇳", native: "தமிழ்"    },
  { id: "bengali",  label: "Bengali",  flag: "🇮🇳", native: "বাংলা"    },
  { id: "hinglish", label: "Hinglish", flag: "🇮🇳", native: "Hinglish" },
]

Layout:
- Label: "Summary Language" text-xs text-gray-500 mb-2
- Flex-wrap row of 5 buttons, gap-2:

Each button:
  className={cn(
    "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-body transition-all",
    selectedLanguage === lang.id
      ? "border-saffron bg-saffron/10 text-white"
      : "border-card-border bg-card text-gray-500 hover:border-white/20 hover:text-gray-300"
  )}
  onClick={() => onLanguageChange(lang.id)

Inside button: {lang.flag} {lang.label} • {lang.native}
Selected: show ✓ after native text

Animate in: framer-motion initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} duration:0.3

Props: selectedLanguage(string), onLanguageChange(fn)
```

---

## MODULE 5 — [COPILOT] Frontend: Update UploadZone.jsx

**Copilot prompt:**
```
TASK: Update UploadZone.jsx with PDF validation + LanguageSelector integration.

CHANGE 1 — Add validateFile function:
const validateFile = (f) => {
  if (!f.name.toLowerCase().endsWith('.pdf')) {
    setError(`❌ "${f.name}" is not a PDF.\nNyayaSetu only supports PDF documents.\nPlease convert your file to PDF and try again.`)
    setFile(null)
    return false
  }
  if (f.size > 50 * 1024 * 1024) {
    setError(`❌ File too large (${(f.size/1024/1024).toFixed(1)}MB).\nMaximum size is 50MB.`)
    setFile(null)
    return false
  }
  setError(null)
  return true
}

Use validateFile() in both handleFileSelect and onDrop.

CHANGE 2 — Add selectedLanguage state (default 'english') inside component.

CHANGE 3 — Import LanguageSelector and render it between file info and Analyze button:
{file && (
  <div className="mt-4 w-full">
    <LanguageSelector
      selectedLanguage={selectedLanguage}
      onLanguageChange={setSelectedLanguage}
    />
  </div>
)}

CHANGE 4 — Update Analyze button call:
Change: onAnalyze(file)
To:     onAnalyze(file, selectedLanguage)

CHANGE 5 — Update error display:
- Border: border-red-500/40 bg-red-500/5
- Show AlertCircle icon (lucide, text-red-400 size=18)
- Error text: text-red-400 text-sm whitespace-pre-line
- Helper text: text-gray-600 text-xs mt-1 "Supported: PDF only (.pdf)"
- "Try Again" button: resets error and file state

CHANGE 6 — Update Props signature:
onAnalyze(file, language) — document this change in a comment
```

---

## MODULE 6 — [COPILOT] Frontend: GlobalStatsBar.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/components/GlobalStatsBar.jsx

Fetches GET /api/stats on mount. Shows live cumulative stats.

State: stats(null), loading(true)

useEffect on mount:
  api.get('/api/stats')
    .then(r => setStats(r.data))
    .catch(() => {}) // silent fail
    .finally(() => setLoading(false))

LOADING: 3 shadcn Skeleton items side by side (h-8 w-24 bg-card rounded-lg)

ERROR / null stats: return null (render nothing)

LOADED layout:
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-center justify-center gap-6 md:gap-10 flex-wrap
             bg-card/50 backdrop-blur border border-card-border
             rounded-2xl px-6 md:px-10 py-4 mb-8"
>
  {/* Stat 1 */}
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-1.5">
      <span>📄</span>
      <NumberTicker value={stats.total_analyses} className="stat-number text-xl text-saffron" />
    </div>
    <span className="text-xs text-gray-600 mt-0.5">Docs Analyzed</span>
  </div>

  <div className="w-px h-6 bg-card-border hidden md:block" />

  {/* Stat 2 */}
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-1.5">
      <span>⚡</span>
      <NumberTicker value={Math.round(stats.total_tokens_saved/1000)} className="stat-number text-xl text-saffron" />
      <span className="text-saffron font-display font-bold">K</span>
    </div>
    <span className="text-xs text-gray-600 mt-0.5">Tokens Saved</span>
  </div>

  <div className="w-px h-6 bg-card-border hidden md:block" />

  {/* Stat 3 */}
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-1.5">
      <span>🌱</span>
      <NumberTicker value={Math.round(stats.total_co2_saved_grams)} className="stat-number text-xl text-emerald" />
      <span className="text-emerald font-display font-bold">g</span>
    </div>
    <span className="text-xs text-gray-600 mt-0.5">CO₂ Avoided</span>
  </div>
</motion.div>

Import api from '@/lib/api'
Import NumberTicker from '@/components/magicui/number-ticker'
```

---

## MODULE 7 — [COPILOT] Frontend: Restyle MetricsBento.jsx

**Copilot prompt:**
```
TASK: Restyle MetricsBento.jsx — design only, no logic changes.

1. All card backgrounds: bg-card (was bg-navy-light)
2. All borders: border-card-border
3. All MagicCard: gradientColor="#FF6B00" gradientOpacity={0.07}
4. All icon containers: w-9 h-9 rounded-xl bg-saffron/10 flex items-center justify-center
5. All NumberTicker for main stats: add className="stat-number"
   Token compression main number: text-5xl md:text-6xl
   Other numbers: text-3xl md:text-4xl
6. Token flow bar: height h-4, add overflow-hidden rounded-full
   Saffron portion: bg-gradient-to-r from-saffron to-orange-400
   Emerald portion: bg-gradient-to-r from-emerald to-green-400
7. Progress bar (Information Density):
   className="[&>div]:bg-gradient-to-r [&>div]:from-saffron [&>div]:to-orange-400"
8. Badge colors:
   Compression %: bg-emerald/10 text-emerald border border-emerald/20
   High Density: bg-emerald/10 text-emerald border border-emerald/20
   Medium: bg-yellow-500/10 text-yellow-400 border border-yellow-500/20
   Low: bg-red-500/10 text-red-400 border border-red-500/20
9. Add top gradient accent line to Token Compression card:
   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-saffron/40 to-transparent" />
   Add relative positioning to that card's wrapper.

Nothing else changes.
```

---

## MODULE 8 — [COPILOT] Frontend: Update SummaryPanel.jsx

**Copilot prompt:**
```
TASK: Two changes to SummaryPanel.jsx.

CHANGE 1 — Add ShareButton to header:
Import ShareButton: import ShareButton from './ShareButton'
In the header row after the badges, add: <ShareButton shareId={shareId} />
Add shareId to Props list.

CHANGE 2 — Replace txt download with jsPDF:
Add import: import jsPDF from 'jspdf'

Replace downloadReport function with:

const downloadPDF = () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 20
  const CW = W - M * 2
  let y = 20

  // Header
  doc.setFillColor(5, 8, 16)
  doc.rect(0, 0, W, 42, 'F')
  doc.setDrawColor(255, 107, 0)
  doc.setLineWidth(0.4)
  doc.line(0, 42, W, 42)
  doc.setTextColor(255, 107, 0)
  doc.setFontSize(20)
  doc.setFont('times', 'bold')
  doc.text('NyayaSetu', M, 17)
  doc.setTextColor(150, 150, 150)
  doc.setFontSize(9)
  doc.setFont('times', 'normal')
  doc.text('Decoding Indian Law for Every Citizen', M, 26)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}`, M, 34)
  doc.text('ScaleDown × Groq | HPE GenAI for GenZ', W - M, 34, { align: 'right' })
  y = 54

  // Doc info
  doc.setTextColor(255, 107, 0)
  doc.setFontSize(12)
  doc.setFont('times', 'bold')
  doc.text('Document Information', M, y); y += 7
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(10)
  doc.setFont('times', 'normal')
  doc.text(`File: ${documentName}`, M, y); y += 6
  doc.text(`Pages: ${documentPages} | Language: ${language || 'English'}`, M, y); y += 6
  if (shareId) { doc.text(`Share ID: ${shareId}`, M, y); y += 6 }
  y += 4

  // Metrics box
  doc.setFillColor(13, 17, 23)
  doc.setDrawColor(255, 107, 0)
  doc.setLineWidth(0.2)
  doc.roundedRect(M, y, CW, 52, 3, 3, 'FD')
  doc.setTextColor(255, 107, 0)
  doc.setFontSize(11)
  doc.setFont('times', 'bold')
  doc.text('Compression Metrics', M + 5, y + 10)
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(9)
  doc.setFont('times', 'normal')
  doc.text(`Original: ${metrics.original_tokens?.toLocaleString()} tokens → Compressed: ${metrics.compressed_tokens?.toLocaleString()} tokens`, M + 5, y + 20)
  doc.text(`Reduction: ${metrics.compression_percentage}%  |  Ratio: ${metrics.compression_ratio}x  |  Saved: ${metrics.tokens_saved?.toLocaleString()} tokens`, M + 5, y + 29)
  doc.text(`Energy: ${metrics.energy_saved_kwh} kWh  |  CO₂: ${metrics.co2_saved_grams}g  |  Cost: $${metrics.cost_saved_usd}`, M + 5, y + 38)
  doc.text(`Information Density: ${metrics.information_density}  |  ScaleDown latency: ${metrics.scaledown_latency_ms}ms`, M + 5, y + 46)
  y += 62

  // Summary
  doc.setTextColor(255, 107, 0)
  doc.setFontSize(12)
  doc.setFont('times', 'bold')
  doc.text('Citizen Summary', M, y); y += 8
  doc.setTextColor(210, 210, 210)
  doc.setFontSize(10)
  doc.setFont('times', 'normal')
  const clean = summary.replace(/[📋🔑👥📅⚠️•]/g, '-').replace(/[^\x00-\x7F]/g, '')
  doc.splitTextToSize(clean, CW).forEach(line => {
    if (y > 272) { doc.addPage(); y = 20 }
    doc.text(line, M, y); y += 5.5
  })

  // Footer on all pages
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFillColor(5, 8, 16)
    doc.rect(0, 285, W, 12, 'F')
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(7)
    doc.text(`NyayaSetu  |  Page ${i}/${total}  |  nyayasetu.netlify.app`, W/2, 291, { align: 'center' })
  }

  doc.save(`NyayaSetu_${documentName.replace('.pdf','')}_Report.pdf`)
}

Update button: label → "⬇️ Download PDF Report", onClick → downloadPDF

Update Props to include: shareId(string), language(string)
```

---

## MODULE 9 — [COPILOT] Frontend: ShareButton.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/components/ShareButton.jsx

import { useState } from 'react'
import { Link, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

Props: shareId (string | null)
If !shareId return null

const shareUrl = `${window.location.origin}/share/${shareId}`
State: copied(false)

const handleCopy = async () => {
  await navigator.clipboard.writeText(shareUrl)
  setCopied(true)
  setTimeout(() => setCopied(false), 3000)
}

Render:
<button
  onClick={handleCopy}
  title={shareUrl}
  className={cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body border transition-all",
    copied
      ? "border-emerald/40 bg-emerald/10 text-emerald"
      : "border-card-border bg-card text-gray-400 hover:border-saffron/30 hover:text-saffron"
  )}
>
  {copied ? <Check size={11} /> : <Link size={11} />}
  {copied ? "Copied!" : "Share"}
</button>
```

---

## MODULE 10 — [COPILOT] Frontend: CitizenQA.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/components/CitizenQA.jsx

State: qaHistory([]), currentQuestion(''), isLoading(false), error(null)

SUGGESTED_QUESTIONS = [
  "What are the key penalties for non-compliance?",
  "How does this affect common citizens?",
  "What are the important implementation dates?",
  "What rights does this give to citizens?",
  "Who is responsible for enforcement?"
]

handleSubmit(questionOverride = null):
  const q = (questionOverride || currentQuestion).trim()
  if (!q || isLoading) return
  setIsLoading(true); setCurrentQuestion(''); setError(null)
  try {
    const res = await api.post('/api/qa', {
      question: q,
      compressed_context: compressedContext,
      language
    })
    setQaHistory(prev => [...prev, { question: q, answer: res.data.answer, timestamp: Date.now() }])
  } catch(e) {
    setError(e.response?.data?.detail || 'Failed to get answer. Try again.')
  } finally { setIsLoading(false) }

Full layout (card-base p-6 mt-6):

HEADER:
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-saffron/10 flex items-center justify-center text-lg">💬</div>
    <div>
      <h3 className="font-display font-bold text-white">Ask About This Law</h3>
      <p className="text-xs text-gray-500 font-body">Get plain-language answers in your chosen language</p>
    </div>
  </div>

SUGGESTED PILLS (show only when qaHistory.length === 0):
  <div className="flex flex-wrap gap-2 mb-5">
    {SUGGESTED_QUESTIONS.map(q => (
      <button key={q} onClick={() => handleSubmit(q)}
        className="text-xs font-body px-3 py-1.5 rounded-full border border-card-border
                   text-gray-500 hover:border-saffron/30 hover:text-saffron transition-all">
        {q}
      </button>
    ))}
  </div>

QA HISTORY (max-h-80 overflow-y-auto space-y-4 mb-4):
  Each item:
  - Question (right): flex justify-end → div bg-saffron/10 border border-saffron/20
    max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-body text-white
  - Answer (left): flex justify-start → div bg-card border border-card-border
    max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-body text-gray-200 leading-relaxed
    + small timestamp text-xs text-gray-600 font-mono mt-1.5

LOADING DOTS (when isLoading, show in answer position):
  <div className="flex gap-1.5 px-4 py-3 w-16">
    <span className="w-2 h-2 rounded-full bg-saffron dot-pulse" style={{animationDelay:'0ms'}} />
    <span className="w-2 h-2 rounded-full bg-saffron dot-pulse" style={{animationDelay:'180ms'}} />
    <span className="w-2 h-2 rounded-full bg-saffron dot-pulse" style={{animationDelay:'360ms'}} />
  </div>

INPUT ROW:
  <div className="flex gap-2">
    <input type="text" value={currentQuestion}
      onChange={e => setCurrentQuestion(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      placeholder="Ask a question about this law..." maxLength={500}
      disabled={isLoading}
      className="flex-1 bg-navy border border-card-border rounded-xl px-4 py-2.5
                 text-sm font-body text-white placeholder-gray-600
                 focus:outline-none focus:border-saffron/40 transition-colors" />
    <button onClick={() => handleSubmit()} disabled={isLoading || !currentQuestion.trim()}
      className="px-4 py-2.5 rounded-xl bg-saffron text-white text-sm font-body font-medium
                 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
      Ask →
    </button>
  </div>
  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

Props: compressedContext(string), language(string), documentName(string)
```

---

## MODULE 11 — [COPILOT] Frontend: HistorySidebar.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/components/HistorySidebar.jsx

Uses shadcn Sheet (side="right", className="w-full sm:w-96 bg-card border-l border-card-border")

State: history([]), loading(false)

useEffect when open changes to true:
  if (!open || !userId) return
  setLoading(true)
  api.get(`/api/history/${userId}`)
    .then(r => setHistory(r.data.history || []))
    .catch(() => setHistory([]))
    .finally(() => setLoading(false))

LOADING: space-y-3 pt-4
  {[1,2,3].map(i => <div key={i} className="space-y-2">
    <Skeleton className="h-4 w-3/4 bg-card-hover" />
    <Skeleton className="h-3 w-1/2 bg-card-hover" />
  </div>)}

EMPTY STATE (history.length === 0 && !loading):
  <div className="flex flex-col items-center justify-center h-40 text-center">
    <span className="text-3xl mb-2">📂</span>
    <p className="text-gray-500 font-body text-sm">No analyses yet</p>
    <p className="text-gray-600 text-xs mt-1">Upload a PDF to get started</p>
  </div>

NO USER STATE (!userId):
  <p className="text-gray-500 text-sm text-center mt-8">Sign in to view your history</p>

HISTORY LIST (space-y-1):
  {history.map(item => (
    <div key={item.id} className="py-3 px-2 -mx-2 rounded-lg hover:bg-card-hover transition-colors border-b border-card-border last:border-0">
      <p className="font-body font-medium text-white text-sm truncate mb-1">{item.document_name}</p>
      <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mb-2 flex-wrap">
        <span>{item.document_pages}p</span>
        <span>•</span>
        <span className="text-saffron">{item.compression_percentage}% compressed</span>
        <span>•</span>
        <span>{item.language}</span>
        <span>•</span>
        <span>{new Date(item.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${item.share_id}`)}
          className="text-xs px-2.5 py-1 rounded-lg border border-card-border text-gray-500 hover:text-saffron hover:border-saffron/30 transition-all">
          🔗 Share
        </button>
        <button onClick={() => window.open(`/share/${item.share_id}`, '_blank')}
          className="text-xs px-2.5 py-1 rounded-lg border border-card-border text-gray-500 hover:text-white hover:border-white/20 transition-all">
          👁 View
        </button>
      </div>
    </div>
  ))}

SHEET HEADER (SheetHeader):
  <div className="flex items-center justify-between">
    <h2 className="font-display font-bold text-white">Your Analyses</h2>
    {history.length > 0 && <span className="text-xs text-gray-600">{history.length} docs</span>}
  </div>

Props: open(bool), onClose(fn), userId(string|null)
```

---

## MODULE 12 — [COPILOT] Frontend: SharePage.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/pages/SharePage.jsx

Uses useParams() to get shareId from URL /share/:shareId

State: data(null), loading(true), error(null)

useEffect on mount:
  api.get(`/api/share/${shareId}`)
    .then(r => setData(r.data))
    .catch(e => setError(e.response?.status === 404 ? 'not_found' : 'error'))
    .finally(() => setLoading(false))

LOADING: <LoadingOrbit /> (import existing component)

ERROR layout (centered min-h-screen flex flex-col items-center justify-center):
  <span className="text-5xl mb-4">🔍</span>
  <h2 className="font-display text-2xl font-bold text-white mb-2">Analysis Not Found</h2>
  <p className="text-gray-500 font-body text-sm mb-6 text-center max-w-sm">
    This analysis may have been removed or the link is incorrect.
  </p>
  <a href="/"
    className="px-6 py-3 bg-saffron text-white rounded-xl font-body text-sm hover:bg-orange-500 transition-all">
    ← Analyze Your Own Document
  </a>

SUCCESS layout:
  Reconstruct result object:
  const result = {
    summary: data.summary, document_name: data.document_name,
    document_pages: data.document_pages, language: data.language,
    share_id: data.share_id,
    metrics: {
      original_tokens: data.original_tokens, compressed_tokens: data.compressed_tokens,
      tokens_saved: data.tokens_saved, compression_percentage: data.compression_percentage,
      compression_ratio: data.compression_ratio, energy_saved_kwh: data.energy_saved_kwh,
      co2_saved_grams: data.co2_saved_grams, cost_saved_usd: data.cost_saved_usd,
      information_density: data.information_density, scaledown_latency_ms: data.scaledown_latency_ms,
    }
  }

  Top banner:
  <div className="bg-saffron/10 border-b border-saffron/20 py-3 px-6 flex justify-between items-center">
    <span className="text-saffron text-sm font-body">📋 Shared Analysis — Read Only</span>
    <a href="/" className="text-gray-400 text-sm font-body hover:text-white transition-colors">
      Analyze Your Own Document →
    </a>
  </div>

  Same NyayaSetu header (branding only, no auth buttons)

  Main content (max-w-7xl mx-auto px-4 py-8):
    <PipelineBeam metrics={result.metrics} documentName={result.document_name} />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      <div className="lg:col-span-5">
        <SummaryPanel
          summary={result.summary}
          documentName={result.document_name}
          documentPages={result.document_pages}
          metrics={result.metrics}
          shareId={result.share_id}
          language={result.language}
          onReset={null}  // hide Analyze Another on shared view
        />
      </div>
      <div className="lg:col-span-7">
        <MetricsBento metrics={result.metrics} documentPages={result.document_pages} />
      </div>
    </div>

    <p className="text-xs text-gray-600 text-center mt-6 font-body">
      Analyzed on {new Date(data.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
    </p>
```

---

## MODULE 13 — [COPILOT] Frontend: Update main.jsx

**Copilot prompt:**
```
TASK: Replace frontend/src/main.jsx with:

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

## MODULE 14 — [COPILOT] Frontend: Update App.jsx

**Copilot prompt:**
```
TASK: Update App.jsx to wire all new components.

ADD imports:
import { Routes, Route } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/AuthModal'
import HistorySidebar from '@/components/HistorySidebar'
import GlobalStatsBar from '@/components/GlobalStatsBar'
import CitizenQA from '@/components/CitizenQA'
import SharePage from '@/pages/SharePage'

ADD state:
const { user, loading: authLoading, signOut } = useAuth()
const [showAuthModal, setShowAuthModal] = useState(false)
const [showHistory, setShowHistory] = useState(false)
const [qaCompressedContext, setQaCompressedContext] = useState('')
const [language, setLanguage] = useState('english')

UPDATE handleAnalyze to accept (file, selectedLanguage):
  setLanguage(selectedLanguage)
  formData.append('language', selectedLanguage)
  if (user?.id) formData.append('user_id', user.id)
  After success: setQaCompressedContext(response.data.compressed_text || '')

UPDATE HEADER right side:
  {/* Badges */}
  <div className="hidden md:flex items-center gap-2">
    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">ScaleDown</Badge>
    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Groq LLaMA 3.3</Badge>
  </div>
  {/* Auth */}
  {!authLoading && (
    user ? (
      <div className="flex items-center gap-3">
        <button onClick={() => setShowHistory(true)}
          className="flex items-center gap-1.5 text-xs font-body text-gray-400 border border-card-border rounded-lg px-3 py-1.5 hover:border-white/20 hover:text-white transition-all">
          📂 History
        </button>
        <span className="text-xs text-gray-500 hidden md:block truncate max-w-32">{user.email}</span>
        <button onClick={signOut} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Sign out</button>
      </div>
    ) : (
      <button onClick={() => setShowAuthModal(true)}
        className="px-4 py-2 rounded-xl bg-saffron/10 border border-saffron/20 text-saffron text-sm font-body hover:bg-saffron/20 transition-all">
        Sign In
      </button>
    )
  )}

UPDATE IDLE STATE — add GlobalStatsBar above UploadZone.

UPDATE UploadZone call: onAnalyze receives (file, lang) from UploadZone.

UPDATE DONE STATE — add below the metrics/summary grid:
  {qaCompressedContext && (
    <CitizenQA
      compressedContext={qaCompressedContext}
      language={language}
      documentName={result?.document_name}
    />
  )}

UPDATE SummaryPanel call: add shareId={result?.share_id} language={language}

ADD at end of return before closing tag:
  <AuthModal
    open={showAuthModal}
    onClose={() => setShowAuthModal(false)}
    onSuccess={(u) => { setShowAuthModal(false); toast.success(`Signed in as ${u.email}`) }}
  />
  <HistorySidebar open={showHistory} onClose={() => setShowHistory(false)} userId={user?.id} />
  <Toaster position="bottom-right" toastOptions={{
    style: { background: '#0D1117', border: '1px solid rgba(255,255,255,0.06)', color: '#F1F5F9' }
  }} />

WRAP entire return in Routes:
  <Routes>
    <Route path="/share/:shareId" element={<SharePage />} />
    <Route path="/*" element={/* existing app JSX */} />
  </Routes>

⭐ TEST locally — full flow: upload PDF, sign in, check history, share, Q&A, download PDF
```

---

## MODULE F — [ANTIGRAVITY] Deploy Frontend to Netlify

> Open Antigravity → ensure Netlify MCP is connected (built-in) → New Agent session

**Antigravity prompt:**
```
Use the Netlify MCP server to deploy the NyayaSetu frontend.

STEP 1 — Create netlify.toml in the frontend/ folder:
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

STEP 2 — Set these environment variables on the Netlify site:
  VITE_SUPABASE_URL = [value from Supabase setup]
  VITE_SUPABASE_ANON_KEY = [value from Supabase setup]
  VITE_API_URL = [Railway backend URL]

STEP 3 — Deploy the site from the current repo.

STEP 4 — Once deployed, show me the Netlify URL.

STEP 5 — Verify the deployed URL works by checking
  {netlify_url}/share/TEST123
  should return the 404 "Analysis Not Found" page (not a blank page)
  — this confirms routing works correctly.
```

---

## MODULE G — [MANUAL] Railway: Update env + redeploy

```
1. Go to Railway dashboard → nyayasetu backend service
2. Variables tab → confirm these exist (add if missing):
   SUPABASE_URL = your supabase project URL
   SUPABASE_SERVICE_KEY = your service role key
3. Trigger redeploy
4. Test: curl https://your-railway-url.railway.app/api/stats
   Should return: {"total_analyses":0,"total_tokens_saved":0,"total_co2_saved_grams":0}
5. Update Supabase Auth → URL Configuration:
   Site URL: https://your-app.netlify.app
   Redirect URLs: https://your-app.netlify.app/**
```

---

## MODULE H — [COPILOT] Verification Checklist

**Copilot prompt:**
```
TASK: Run full verification. Test each item, report PASS/FAIL.

Using the deployed Netlify URL, test:

1. PDF VALIDATION
   Upload .jpg → instant error, no API call
   Upload .pdf → LanguageSelector appears
   
2. LANGUAGE
   Select Hindi → analyze → summary in Hindi/Devanagari

3. AUTH
   Click Sign In → OTP modal → real email → get code → verify → logged in

4. SAVE TO SUPABASE
   While logged in, analyze PDF → check Supabase Table Editor → row exists

5. GLOBAL STATS
   Homepage stats bar shows numbers → analyze PDF → numbers increment

6. HISTORY
   Click 📂 History → shows past analyses

7. SHARE
   Click Share → copy URL → open in incognito → full analysis shows

8. Q&A
   Type question → get answer in selected language
   Click suggested pill → auto-submits

9. PDF DOWNLOAD
   Click "⬇️ Download PDF Report" → .pdf file downloads → opens correctly

10. SHARE PAGE DIRECT
    Navigate to /share/{valid_id} directly → renders without login

11. GUEST FLOW
    Sign out → analyze → History button not visible → share still works

Report as:
| Test | Status | Notes |
```

---

## 📊 Antigravity Usage Summary

| Session | What you do in Antigravity | MCP Used | Rate limit impact |
|---|---|---|---|
| Session 1 | MODULE A — Full Supabase setup | Supabase MCP | Medium (8-10 calls) |
| Session 2 | MODULE F — Netlify deploy | Netlify MCP (built-in) | Low (3-4 calls) |

Everything else is Copilot — zero rate limit impact on Antigravity.
