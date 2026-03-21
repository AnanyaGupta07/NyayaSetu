# ⚖️ NyayaSetu — Implementation Plan v5
### Full Product | Sidebar Nav | 5 Pages | Antigravity Optimized
> Modules A–E (backend) already done. This plan covers frontend only + Supabase profile table addition.

---

## 🧭 Tool Assignment

| Task | Tool |
|---|---|
| All frontend code | **Copilot (VS Code)** |
| Supabase: add profiles table | **Antigravity + Supabase MCP** (Session 1) |
| Netlify deploy | **Antigravity Netlify MCP** (Session 2) |
| Backend already done | Modules A–E complete ✅ |

---

## 🗺️ App Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Global stats + recent analyses |
| `/papers` | My Papers | All uploads, upload new |
| `/analyze` | Analyze | Upload flow + language select |
| `/analysis/:shareId` | Analysis | Summary + metrics + Q&A + share |
| `/profile` | Profile | Name, language pref, delete account |
| `/share/:shareId` | Shared View | Public read-only analysis |
| `/auth` | Auth | Email OTP sign-in (redirect if logged in) |

---

## 🗂️ Final File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                      # shadcn primitives
│   │   ├── magicui/                 # Magic UI
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx          # Main sidebar nav
│   │   │   ├── AppLayout.jsx        # Wrapper: sidebar + content
│   │   │   └── TopBar.jsx           # Page header bar
│   │   ├── shared/
│   │   │   ├── StatCard.jsx         # Reusable metric card
│   │   │   ├── LanguageSelector.jsx # Language picker
│   │   │   ├── ShareButton.jsx      # Copy share link
│   │   │   ├── PDFReportButton.jsx  # Download PDF report
│   │   │   └── LoadingOrbit.jsx     # Loading animation
│   │   ├── analysis/
│   │   │   ├── PipelineBeam.jsx     # ScaleDown pipeline viz
│   │   │   ├── MetricsBento.jsx     # Stats bento grid
│   │   │   ├── SummaryPanel.jsx     # Summary + lang toggle
│   │   │   └── CitizenQA.jsx        # Q&A panel
│   │   └── auth/
│   │       └── AuthModal.jsx        # OTP modal
│   ├── pages/
│   │   ├── DashboardPage.jsx        # / 
│   │   ├── PapersPage.jsx           # /papers
│   │   ├── AnalyzePage.jsx          # /analyze
│   │   ├── AnalysisPage.jsx         # /analysis/:shareId
│   │   ├── ProfilePage.jsx          # /profile
│   │   └── SharedViewPage.jsx       # /share/:shareId
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useProfile.js            # NEW
│   ├── lib/
│   │   ├── utils.js
│   │   ├── api.js
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

---

## 📋 Build Order

```
MODULE A2 → [ANTIGRAVITY] Add profiles table to Supabase
MODULE 1  → [COPILOT] Install deps + design tokens + index.css
MODULE 2  → [COPILOT] supabase.js + useAuth.js + useProfile.js
MODULE 3  → [COPILOT] AuthModal.jsx
MODULE 4  → [COPILOT] Sidebar.jsx + AppLayout.jsx + TopBar.jsx
MODULE 5  → [COPILOT] Shared components (StatCard, LanguageSelector, ShareButton, PDFReportButton, LoadingOrbit)
MODULE 6  → [COPILOT] Analysis components (PipelineBeam, MetricsBento, SummaryPanel, CitizenQA)
MODULE 7  → [COPILOT] DashboardPage.jsx
MODULE 8  → [COPILOT] PapersPage.jsx
MODULE 9  → [COPILOT] AnalyzePage.jsx
MODULE 10 → [COPILOT] AnalysisPage.jsx
MODULE 11 → [COPILOT] ProfilePage.jsx
MODULE 12 → [COPILOT] SharedViewPage.jsx
MODULE 13 → [COPILOT] App.jsx + main.jsx (routes + auth guard)
             ⭐ Full local test
MODULE F  → [ANTIGRAVITY] Deploy to Netlify
MODULE G  → [MANUAL] Railway redeploy + Supabase URL config
MODULE H  → [COPILOT] Verification checklist
```

---

## MODULE A2 — [ANTIGRAVITY] Add Profiles Table

> Open Antigravity → Supabase MCP → New session
> This is a small session, only 3-4 MCP calls

**Antigravity prompt:**
```
Use the Supabase MCP server for the existing "nyayasetu" project.
Run this SQL exactly:

-- User profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'english',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

Confirm each step ran successfully and show me the table structure.
```

---

## MODULE 1 — [COPILOT] Install deps + Design Tokens

**Copilot prompt:**
```
TASK: Set up frontend project with all dependencies and design tokens.

STEP 1 — Install packages (in frontend/ folder):
npm install @supabase/supabase-js jspdf react-router-dom framer-motion
npx shadcn@latest add card badge progress button tabs separator skeleton sonner sheet dialog input label

STEP 2 — Add Magic UI components:
npx shadcn@latest add "https://magicui.design/r/number-ticker"
npx shadcn@latest add "https://magicui.design/r/animated-beam"
npx shadcn@latest add "https://magicui.design/r/bento-grid"
npx shadcn@latest add "https://magicui.design/r/magic-card"
npx shadcn@latest add "https://magicui.design/r/shimmer-button"
npx shadcn@latest add "https://magicui.design/r/typing-animation"
npx shadcn@latest add "https://magicui.design/r/word-pull-up"
npx shadcn@latest add "https://magicui.design/r/particles"
npx shadcn@latest add "https://magicui.design/r/orbiting-circles"
npx shadcn@latest add "https://magicui.design/r/number-ticker"

STEP 3 — Replace frontend/src/index.css:
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: #050810;
  color: #F1F5F9;
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 4px; }
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
  padding: 24px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #6B7280;
  transition: all 0.15s;
  cursor: pointer;
  text-decoration: none;
}

.sidebar-link:hover { background: rgba(255,255,255,0.04); color: #F1F5F9; }
.sidebar-link.active { background: rgba(255,107,0,0.12); color: #FF6B00; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.dot-pulse { animation: pulse-dot 1.4s ease-in-out infinite; }


STEP 4 — Replace tailwind.config.js theme.extend:
colors: {
  saffron: '#FF6B00',
  'saffron-dim': 'rgba(255,107,0,0.10)',
  navy: '#050810',
  card: '#0D1117',
  'card-2': '#111827',
  'card-border': 'rgba(255,255,255,0.06)',
  'card-border-hover': 'rgba(255,255,255,0.12)',
  gold: '#C8A951',
  emerald: '#10B981',
  sidebar: '#080D1A',
},
fontFamily: {
  display: ['"Playfair Display"', 'serif'],
  body: ['"DM Sans"', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
boxShadow: {
  saffron: '0 0 40px rgba(255,107,0,0.15)',
  card: '0 4px 24px rgba(0,0,0,0.4)',
},


STEP 5 — Update index.html Google Fonts:
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">


STEP 6 — Create frontend/.env.local:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

---

## MODULE 2 — [COPILOT] supabase.js + useAuth.js + useProfile.js

**Copilot prompt:**
```
TASK: Create three files.

FILE 1 — frontend/src/lib/supabase.js:
import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = (url && key) ? createClient(url, key) : null


FILE 2 — frontend/src/hooks/useAuth.js:
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
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


FILE 3 — frontend/src/hooks/useProfile.js:
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!userId || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates) => {
    if (!userId || !supabase) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  return { profile, loading, updateProfile, refetch: fetchProfile }
}
```

---

## MODULE 3 — [COPILOT] AuthModal.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/components/auth/AuthModal.jsx

Email OTP modal. Two states: 'EMAIL' | 'OTP'.
Uses shadcn Dialog + ShimmerButton.

State: email(''), otp(''), authState('EMAIL'), loading(false), error(null), countdown(0)

EMAIL STATE (inside Dialog, max-w-sm, bg-card border border-card-border rounded-2xl p-8):
- Center ⚖️ text-4xl mb-4
- Heading font-display text-xl text-white: "Welcome to NyayaSetu"
- Subtext text-gray-500 text-sm mb-5: "Sign in to save your analyses"
- shadcn Input: type="email", placeholder="your@email.com"
  className="bg-navy border-card-border focus:border-saffron h-11 rounded-xl"
  onKeyDown: Enter → handleSendOTP
- ShimmerButton full width mt-3 shimmerColor="#FF6B00" background="#0D1117":
  "Send OTP →" disabled={!email.trim() || loading}
- "Continue as guest" text-gray-600 text-xs text-center mt-3 cursor-pointer onClick:onClose

handleSendOTP:
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
  if error → setError(error.message)
  else → setAuthState('OTP'), startCountdown(60)


OTP STATE:
- ← back button top-left → setAuthState('EMAIL')
- "Check your inbox" font-display text-xl
- "Code sent to " + <span className="text-saffron">{email}</span> text-sm text-gray-400
- Input: type="text" inputMode="numeric" maxLength={6}
  text-center text-2xl font-mono tracking-[0.5em] bg-navy border-card-border h-14 rounded-xl
  onChange: allow digits only, max 6. Auto-submit on length 6
- ShimmerButton: "Verify →" disabled={otp.length < 6 || loading}
- Resend: countdown>0 → "Resend in {countdown}s" | countdown===0 → "Resend →" text-saffron cursor-pointer
- error: text-red-400 text-sm

handleVerifyOTP:
  const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
  if error → setError(error.message), setOtp('')
  else → onSuccess(data.user), onClose()

Props: open(bool), onClose(fn), onSuccess(fn)
No X close button on Dialog — user must use "Continue as guest".
```

---

## MODULE 4 — [COPILOT] Sidebar + AppLayout + TopBar

**Copilot prompt:**
```
TASK: Create three layout components.

FILE 1 — frontend/src/components/layout/Sidebar.jsx

Fixed left sidebar, width w-60, bg-sidebar border-r border-card-border, full height.

Top section (px-5 pt-6 pb-4 border-b border-card-border):
  <div className="flex items-center gap-2.5">
    <span className="text-2xl">⚖️</span>
    <div>
      <h1 className="font-display font-bold text-white text-lg leading-none">NyayaSetu</h1>
      <p className="text-xs text-gray-600 font-body">Decode Indian Law</p>
    </div>
  </div>

Nav links (px-3 py-4 space-y-1):
Use NavLink from react-router-dom. className receives isActive bool.

NAV_ITEMS = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/papers',  icon: FileText,        label: 'My Papers'  },
  { to: '/analyze', icon: Upload,          label: 'Analyze'    },
]

Each NavLink:
  className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
  <Icon size={17} />
  <span>{label}</span>

Bottom section (absolute bottom-0 left-0 right-0 p-3 border-t border-card-border space-y-1):
  NavLink to="/profile": Profile icon + display_name or email (truncated)
  Sign out button (if user): LogOut icon + "Sign Out" text-red-400 hover state
  If not logged in: "Sign In" button → opens auth modal

Pass props: user(obj|null), profile(obj|null), onSignIn(fn), onSignOut(fn)

Import icons from lucide-react: LayoutDashboard, FileText, Upload, User, LogOut


FILE 2 — frontend/src/components/layout/TopBar.jsx

Slim top bar inside the main content area (not sidebar).
h-14 border-b border-card-border bg-navy/80 backdrop-blur sticky top-0 z-10
flex items-center justify-between px-6

Left: page title passed as prop (font-display font-bold text-white text-lg)
Right:
  - Badge "ScaleDown" bg-orange-500/10 text-orange-400 border-orange-500/20
  - Badge "Groq LLaMA 3.3" bg-green-500/10 text-green-400 border-green-500/20
  - If not logged in: "Sign In" button → onSignIn()
  - If logged in: avatar circle (initials from display_name, bg-saffron/20 text-saffron w-8 h-8 rounded-full)

Props: title(string), user(obj|null), onSignIn(fn)


FILE 3 — frontend/src/components/layout/AppLayout.jsx

Main layout wrapper used by all protected pages.

import Sidebar from './Sidebar'
import TopBar from './TopBar'

Layout:
<div className="flex h-screen overflow-hidden bg-navy">
  <Sidebar user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} />
  <div className="flex-1 flex flex-col overflow-hidden">
    <TopBar title={title} user={user} onSignIn={onSignIn} />
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </div>
</div>

Props: title(string), user, profile, onSignIn(fn), onSignOut(fn), children
```

---

## MODULE 5 — [COPILOT] Shared Components

**Copilot prompt:**
```
TASK: Create 5 shared components.

FILE 1 — frontend/src/components/shared/StatCard.jsx

Reusable metric card used across Dashboard and AnalysisPage.

Props: icon(string emoji or component), label(string), value(number|string),
       unit(string), subtext(string), color('saffron'|'emerald'|'gold'|'white'),
       animate(bool default true), large(bool default false)

Layout (card-base):
  <div className="card-base">
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg",
        color==='saffron' && "bg-saffron/10",
        color==='emerald' && "bg-emerald/10",
        color==='gold'    && "bg-gold/10",
      )}>
        {icon}
      </div>
      <span className="text-xs text-gray-500 font-body">{label}</span>
    </div>
    <div className="flex items-end gap-1.5">
      {animate && typeof value === 'number'
        ? <NumberTicker value={value} className={cn("stat-number", large ? "text-5xl" : "text-3xl", colorClass)} />
        : <span className={cn("stat-number", large ? "text-5xl" : "text-3xl", colorClass)}>{value}</span>
      }
      {unit && <span className={cn("font-display font-bold mb-1", colorClass)}>{unit}</span>}
    </div>
    {subtext && <p className="text-xs text-gray-600 font-body mt-1.5">{subtext}</p>}
  </div>

colorClass map: saffron→text-saffron, emerald→text-emerald, gold→text-gold, white→text-white


FILE 2 — frontend/src/components/shared/LanguageSelector.jsx
(Compact horizontal pill selector)

LANGUAGES = [
  { id:'english',  label:'English',  flag:'🇬🇧', native:'English'  },
  { id:'hindi',    label:'Hindi',    flag:'🇮🇳', native:'हिन्दी'   },
  { id:'tamil',    label:'Tamil',    flag:'🇮🇳', native:'தமிழ்'   },
  { id:'bengali',  label:'Bengali',  flag:'🇮🇳', native:'বাংলা'   },
  { id:'hinglish', label:'Hinglish', flag:'🇮🇳', native:'Hinglish' },
]

Layout: flex-wrap gap-2
Each button: rounded-xl border text-xs font-body px-3 py-2
Selected: border-saffron bg-saffron/10 text-white
Unselected: border-card-border text-gray-500 hover:border-white/20

Show flag + label only (no native text) in compact mode prop.
Show flag + label + native in full mode (default).

Props: selectedLanguage(string), onChange(fn), compact(bool default false)


FILE 3 — frontend/src/components/shared/ShareButton.jsx
import { useState } from 'react'
import { Link, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

Props: shareId(string|null)
if !shareId return null

const url = `${window.location.origin}/share/${shareId}`
State: copied(false)

Button: flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all
Copied state: border-emerald/40 bg-emerald/10 text-emerald
Default: border-card-border text-gray-400 hover:border-saffron/30 hover:text-saffron
{copied ? <Check size={11}/> : <Link size={11}/>} {copied ? "Copied!" : "Share"}
onClick: clipboard.writeText(url), setCopied(true), reset after 3s


FILE 4 — frontend/src/components/shared/PDFReportButton.jsx

Button that generates and downloads jsPDF report.
Props: documentName, documentPages, language, summary, metrics, shareId

import jsPDF from 'jspdf'

const generate = () => {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 20, CW = W - M*2
  let y = 20

  // Header bar
  doc.setFillColor(5,8,16); doc.rect(0,0,W,42,'F')
  doc.setDrawColor(255,107,0); doc.setLineWidth(0.4); doc.line(0,42,W,42)
  doc.setTextColor(255,107,0); doc.setFontSize(20); doc.setFont('times','bold')
  doc.text('NyayaSetu', M, 17)
  doc.setTextColor(150,150,150); doc.setFontSize(9); doc.setFont('times','normal')
  doc.text('Decoding Indian Law for Every Citizen', M, 26)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}`, M, 34)
  doc.text('ScaleDown × Groq | HPE GenAI for GenZ', W-M, 34, {align:'right'})
  y = 54

  // Doc info
  doc.setTextColor(255,107,0); doc.setFontSize(12); doc.setFont('times','bold')
  doc.text('Document Information', M, y); y+=7
  doc.setTextColor(200,200,200); doc.setFontSize(10); doc.setFont('times','normal')
  doc.text(`File: ${documentName}`, M, y); y+=6
  doc.text(`Pages: ${documentPages} | Language: ${language||'English'}`, M, y); y+=6
  if (shareId) { doc.text(`Share ID: ${shareId}`, M, y); y+=6 }
  y+=4

  // Metrics box
  doc.setFillColor(13,17,23); doc.setDrawColor(255,107,0); doc.setLineWidth(0.2)
  doc.roundedRect(M, y, CW, 52, 3, 3, 'FD')
  doc.setTextColor(255,107,0); doc.setFontSize(11); doc.setFont('times','bold')
  doc.text('Compression Metrics', M+5, y+10)
  doc.setTextColor(180,180,180); doc.setFontSize(9); doc.setFont('times','normal')
  doc.text(`Original: ${metrics.original_tokens?.toLocaleString()} tokens → Compressed: ${metrics.compressed_tokens?.toLocaleString()} tokens`, M+5, y+20)
  doc.text(`Reduction: ${metrics.compression_percentage}%  |  Ratio: ${metrics.compression_ratio}x  |  Saved: ${metrics.tokens_saved?.toLocaleString()} tokens`, M+5, y+29)
  doc.text(`Energy: ${metrics.energy_saved_kwh} kWh  |  CO₂: ${metrics.co2_saved_grams}g  |  Cost Saved: $${metrics.cost_saved_usd}`, M+5, y+38)
  doc.text(`Information Density: ${metrics.information_density}  |  ScaleDown: ${metrics.scaledown_latency_ms}ms`, M+5, y+46)
  y+=62

  // Summary
  doc.setTextColor(255,107,0); doc.setFontSize(12); doc.setFont('times','bold')
  doc.text('Citizen Summary', M, y); y+=8
  doc.setTextColor(210,210,210); doc.setFontSize(10); doc.setFont('times','normal')
  const clean = summary.replace(/[📋🔑👥📅⚠️•]/g,'-').replace(/[^\x00-\x7F]/g,'')
  doc.splitTextToSize(clean, CW).forEach(line => {
    if (y>272) { doc.addPage(); y=20 }
    doc.text(line, M, y); y+=5.5
  })

  // Footer
  const total = doc.internal.getNumberOfPages()
  for (let i=1; i<=total; i++) {
    doc.setPage(i)
    doc.setFillColor(5,8,16); doc.rect(0,285,W,12,'F')
    doc.setTextColor(80,80,80); doc.setFontSize(7)
    doc.text(`NyayaSetu  |  Page ${i}/${total}  |  nyayasetu.netlify.app`, W/2, 291, {align:'center'})
  }

  doc.save(`NyayaSetu_${documentName.replace('.pdf','')}_Report.pdf`)
}

Render: <button onClick={generate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
  text-xs border border-card-border text-gray-400 hover:border-saffron/30 hover:text-saffron transition-all">
  ⬇️ PDF Report
</button>


FILE 5 — frontend/src/components/shared/LoadingOrbit.jsx

Centered loading screen using OrbitingCircles from Magic UI.

Layout (min-h-screen flex flex-col items-center justify-center bg-navy):

OrbitingCircles (3 orbits):
- Inner radius=55 duration=12: "⚖️"
- Middle radius=90 duration=20 reverse: "📄"
- Outer radius=130 duration=28: "✨"
Center: "AI" font-display text-xl text-saffron

Status messages (cycle every 3s with AnimatePresence):
["📄 Extracting document text...",
 "⚙️ Compressing with ScaleDown...",
 "🤖 Groq AI analyzing...",
 "📋 Generating summary..."]

3 pulsing dots (dot-pulse class, staggered 180ms)

Props: messages(array optional, uses defaults if not provided)
```

---

## MODULE 6 — [COPILOT] Analysis Components

**Copilot prompt:**
```
TASK: Create 4 analysis-specific components.

FILE 1 — frontend/src/components/analysis/PipelineBeam.jsx

AnimatedBeam pipeline showing: PDF → ScaleDown → Groq → Summary
4 circular nodes (w-14 h-14 rounded-full bg-card border-2 border-card-border)
connected by AnimatedBeam (gradientStartColor="#FF6B00", pathColor="#FF6B00")

Node 1: 📄 "PDF Document" metric: "{original_tokens} tokens"
Node 2: ⚙️ "ScaleDown" metric: "-{compression_percentage}%"
Node 3: 🤖 "Groq LLaMA" metric: "{compressed_tokens} tokens"
Node 4: 📋 "Summary" metric: "Ready"

Beam 3→4 uses gradientStartColor="#10B981" (green)
Container: flex items-center justify-between px-8 py-5 card-base mb-6
All node labels: text-xs text-gray-500 font-body text-center mt-1.5
All node metrics: text-xs font-mono text-saffron text-center

Props: metrics(obj), documentName(string)
Animate in on mount: framer-motion y:20→0 opacity:0→1 delay:0.2


FILE 2 — frontend/src/components/analysis/MetricsBento.jsx

BentoGrid layout of metric cards. Uses StatCard component.

Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

CARD 1 — Token Compression (lg:col-span-2, large=true):
  StatCard icon="⚡" label="Tokens Eliminated" value={metrics.tokens_saved}
  unit="" color="saffron" large animate
  EXTRA below StatCard:
    Token flow bar (w-full h-3.5 rounded-full bg-navy flex overflow-hidden mt-4):
      Saffron portion: width={compression_percentage}% bg-gradient-to-r from-saffron to-orange-400
      Emerald portion: remaining % bg-gradient-to-r from-emerald to-green-400
    Labels row: "Kept: {compressed_tokens}" | "Eliminated: {tokens_saved}"
    Badge: "{compression_percentage}% Compression" bg-emerald/10 text-emerald border-emerald/20

CARD 2 — Energy Saved:
  StatCard icon="🌱" label="Energy Saved" value={metrics.energy_saved_kwh}
  unit="kWh" color="emerald"
  subtext="≈ {co2_saved_grams}g CO₂ avoided"
  footnote: "India grid: 708g CO₂/kWh (CEA 2024)"

CARD 3 — Cost Saved:
  StatCard icon="💰" label="Cost Saved" value={metrics.cost_saved_usd}
  unit="USD" color="gold"
  subtext="vs GPT-4o input pricing"

CARD 4 — Information Density:
  StatCard icon="📊" label="Info Density" value={metrics.information_density}
  color="saffron"
  EXTRA: shadcn Progress value={metrics.information_density*100}
  className="[&>div]:bg-gradient-to-r [&>div]:from-saffron [&>div]:to-orange-400 mt-2"
  Badge: ≥0.7→"High" emerald | ≥0.4→"Medium" yellow | else→"Low" red

CARD 5 — Speed:
  StatCard icon="⏱️" label="ScaleDown Speed" value={metrics.scaledown_latency_ms}
  unit="ms" color="white"
  subtext="{document_pages} pages processed"

All cards animate in with framer-motion staggerChildren=0.08

Props: metrics(obj), documentPages(int)


FILE 3 — frontend/src/components/analysis/SummaryPanel.jsx

Card showing the Groq-generated summary with language toggle.

Props: summary(string), documentName(string), documentPages(int),
       language(string), onLanguageChange(fn), shareId(string), metrics(obj), onReset(fn|null)

Layout (card-base):

HEADER row (flex justify-between items-start mb-4):
  Left:
    <p className="font-display italic text-gray-200 text-base truncate max-w-xs">{documentName}</p>
    <div className="flex gap-2 mt-1.5">
      <Badge>AI Summarized</Badge>
      <Badge>{language}</Badge>
    </div>
  Right (flex gap-2):
    <ShareButton shareId={shareId} />
    <PDFReportButton documentName={documentName} documentPages={documentPages}
      language={language} summary={summary} metrics={metrics} shareId={shareId} />

SEPARATOR

LANGUAGE TOGGLE (small section, mb-4):
  Label "Summary Language:" text-xs text-gray-500 mb-2
  <LanguageSelector selectedLanguage={language} onChange={onLanguageChange} compact />

SUMMARY TEXT (max-h-96 overflow-y-auto pr-1):
  <TypingAnimation text={summary} className="font-body text-gray-200 leading-8 text-sm whitespace-pre-wrap" duration={10} />

FOOTER (mt-4 flex gap-3):
  If onReset !== null:
    <button onClick={onReset} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
      🔄 Analyze Another
    </button>


FILE 4 — frontend/src/components/analysis/CitizenQA.jsx

Q&A panel for follow-up questions.

State: qaHistory([]), question(''), loading(false), error(null)

SUGGESTED_QUESTIONS = [
  "What are the key penalties?",
  "How does this affect common citizens?",
  "What are the implementation dates?",
  "What rights does this give citizens?",
  "Who enforces this law?"
]

handleSubmit(q = question):
  if (!q.trim() || loading) return
  setLoading(true); setQuestion(''); setError(null)
  try {
    const res = await api.post('/api/qa', { question: q.trim(), compressed_context: compressedContext, language })
    setQaHistory(prev => [...prev, { question: q.trim(), answer: res.data.answer, ts: Date.now() }])
  } catch(e) {
    setError(e.response?.data?.detail || 'Failed. Try again.')
  } finally { setLoading(false) }

Layout (card-base mt-4):
  Header: 💬 icon + "Ask About This Law" font-display + subtext

  Suggested pills (show when qaHistory empty):
    flex-wrap gap-2 — each pill is text-xs border rounded-full px-3 py-1.5
    border-card-border text-gray-500 hover:text-saffron hover:border-saffron/30

  QA history (max-h-72 overflow-y-auto space-y-4):
    Question (right bubble): bg-saffron/10 border-saffron/20 rounded-2xl rounded-tr-sm
    Answer (left bubble): bg-card border-card-border rounded-2xl rounded-tl-sm
    Timestamp: text-xs text-gray-600 font-mono

  Loading (3 dot-pulse dots in answer position)

  Input row: flex gap-2
    input: bg-navy border-card-border focus:border-saffron/40 rounded-xl px-4 py-2.5 text-sm
    button: bg-saffron text-white rounded-xl px-4 text-sm disabled:opacity-40

Props: compressedContext(string), language(string), documentName(string)
```

---

## MODULE 7 — [COPILOT] DashboardPage.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/pages/DashboardPage.jsx

Route: /
Fetches: GET /api/stats AND GET /api/history/{userId} (if logged in)

State: stats(null), recentAnalyses([]), loading(true)

On mount:
  Parallel: api.get('/api/stats') + (user ? api.get(`/api/history/${user.id}`) : Promise.resolve({data:{history:[]}}))
  setStats + setRecentAnalyses(data.history.slice(0,5))

Layout (inside AppLayout title="Dashboard"):

SECTION 1 — Welcome banner (mb-8):
  If logged in:
    <h2 className="font-display text-2xl font-bold text-white">
      Welcome back, {profile?.display_name || user?.email?.split('@')[0]} 👋
    </h2>
    <p className="text-gray-500 font-body text-sm mt-1">Here's what NyayaSetu has processed so far.</p>
  If guest:
    <h2 className="font-display text-2xl font-bold text-white">NyayaSetu Dashboard</h2>
    <p className="text-gray-500 font-body text-sm mt-1">
      Sign in to save your analyses. 
      <span className="text-saffron cursor-pointer ml-1" onClick={onSignIn}>Sign in →</span>
    </p>

SECTION 2 — Global Stats (4 StatCards in grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8):

Card 1: icon="📄" label="Documents Analyzed" value={stats.total_analyses} color="saffron"
Card 2: icon="⚡" value={Math.round(stats.total_tokens_saved/1000)} unit="K"
        label="Tokens Optimized" color="saffron"
        subtext="Tokens compressed by ScaleDown"
Card 3: icon="🌱" value={parseFloat(stats.total_co2_saved_grams?.toFixed(1))} unit="g"
        label="CO₂ Avoided" color="emerald"
        subtext="India grid: 708g CO₂/kWh"
Card 4: icon="💰" value={parseFloat((stats.total_tokens_saved * 0.0000025).toFixed(3))} unit="USD"
        label="Cost Saved" color="gold"
        subtext="vs GPT-4o input baseline"

Show skeleton placeholders while loading (4 Skeleton cards h-28).

SECTION 3 — Recent Analyses heading row (flex justify-between items-center mb-4):
  <h3 className="font-display font-semibold text-white">Recent Analyses</h3>
  <a href="/papers" className="text-xs text-saffron hover:underline">View all →</a>

If not logged in: show prompt card instead:
  card-base flex items-center gap-4 p-5
  "🔒" + "Sign in to see your analysis history" + Sign In button

If loading: 3 Skeleton rows h-16

If recentAnalyses.length === 0 (logged in, no history):
  card-base text-center py-8
  "📂" + "No analyses yet" + <a href="/analyze"> Analyze your first document →</a>

RECENT ANALYSES TABLE (card-base overflow-hidden p-0):
  Table header: Document | Pages | Compression | Language | Date | Actions
  Each row (border-b border-card-border last:border-0 hover:bg-card-2 transition-colors px-5 py-3.5):
    - Document name (truncated max-w-xs font-body font-medium text-white text-sm)
    - Pages (text-gray-500 text-xs font-mono)
    - "{compression_percentage}%" badge (emerald)
    - Language pill (text-xs)
    - Date (text-xs text-gray-500 font-mono)
    - Actions: "👁 View" → navigate(`/analysis/${item.share_id}`)
               "🔗 Share" → copy URL to clipboard
  Show max 5 rows. If more → "View all in My Papers →"

Props received from App: user, profile, onSignIn
```

---

## MODULE 8 — [COPILOT] PapersPage.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/pages/PapersPage.jsx

Route: /papers
Shows all user analyses with filter/sort. Upload new button.

State: analyses([]), loading(true), searchQuery(''), sortBy('newest')

On mount: api.get(`/api/history/${user.id}`) → setAnalyses(data.history)
If not logged in: show sign-in prompt.

Layout (inside AppLayout title="My Papers"):

TOP BAR (flex justify-between items-center mb-6):
  Left: search input (bg-card border-card-border rounded-xl px-4 py-2 text-sm w-64
        placeholder "Search documents..." icon Search inside)
  Right:
    Sort select (shadcn): newest | oldest | most compressed | most pages
    <a href="/analyze">
      <ShimmerButton shimmerColor="#FF6B00">+ Analyze New Document</ShimmerButton>
    </a>

STATS ROW (3 small inline stats, mb-6, text-xs text-gray-500):
  "{analyses.length} documents" | "{totalTokensSaved}K tokens saved" | "{totalCO2.toFixed(1)}g CO₂ avoided"
  Calculate these from the analyses array.

NOT LOGGED IN STATE:
  card-base text-center py-16
  "🔐" icon + "Sign in to see your papers" + Sign In button (calls onSignIn)

EMPTY STATE (logged in, no analyses):
  card-base text-center py-16
  "📂" large + "No documents analyzed yet"
  subtext "Upload your first Indian legal document to get started"
  <a href="/analyze"><ShimmerButton>Analyze Your First Document →</ShimmerButton></a>

PAPERS GRID (grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4):
  Filter analyses by searchQuery (document_name contains query, case-insensitive)
  Sort by sortBy value

  Each paper card (card-base hover:border-card-border-hover transition-all cursor-pointer):
    Top row: document name (font-body font-medium text-white truncate) + language badge
    Meta row: text-xs text-gray-500 font-mono gap-3:
      "{pages} pages" | "{compression_percentage}% compressed" | "{tokens_saved.toLocaleString()} tokens saved"
    Stats row (3 tiny stat pills):
      Energy: "{energy_saved_kwh} kWh"
      CO₂: "{co2_saved_grams}g"
      Cost: "${cost_saved_usd}"
    Footer (flex justify-between items-center mt-4 pt-3 border-t border-card-border):
      Date: text-xs text-gray-600
      Actions: "👁 View" → navigate(`/analysis/${item.share_id}`)
               "🔗 Share" → copy URL
               "⬇️ PDF" → (need to store compressed_text — skip for now, show disabled)

  Show framer-motion stagger animation on cards.

LOADING STATE: 6 Skeleton cards in the grid.

Props from App: user, onSignIn
```

---

## MODULE 9 — [COPILOT] AnalyzePage.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/pages/AnalyzePage.jsx

Route: /analyze
The main upload + analysis flow.

State:
  pageState: 'upload' | 'loading' | 'done' | 'error'
  selectedFile: null
  selectedLanguage: string (default = profile?.preferred_language || 'english')
  error: null

On profile load: set selectedLanguage to profile.preferred_language if available.

UPLOAD STATE layout (inside AppLayout title="Analyze Document"):

MAX WIDTH: max-w-2xl mx-auto

Heading section (text-center mb-8):
  <h2 className="font-display text-3xl font-bold text-white mb-2">
    Analyze a Legal Document
  </h2>
  <p className="text-gray-500 font-body">
    Upload any Indian bill, act, or policy PDF
  </p>

Upload zone (card-base, dashed animated border):
  Drag & drop area:
    - Large ⬆️ icon (saffron, 48px) centered
    - "Drop your PDF here" font-display text-xl
    - "or click to browse" text-gray-500 text-sm
    - Hidden file input, click triggers on card click
    - onDragOver: border-saffron glow
    - onDrop: validate + setFile

  PDF VALIDATION (validateFile function):
    if (!file.name.toLowerCase().endsWith('.pdf')):
      setError(`"${file.name}" is not a PDF.\nNyayaSetu only supports PDF files (.pdf)`)
      return false
    if (file.size > 50*1024*1024):
      setError(`File too large (${(file.size/1024/1024).toFixed(1)}MB). Max: 50MB`)
      return false
    return true

  FILE SELECTED STATE (show after valid PDF chosen):
    File info row: 📄 icon + filename (truncated) + file size formatted
    LanguageSelector (full mode) below file info
    "Analyze Document →" ShimmerButton full-width mt-4 shimmerColor="#FF6B00"

  ERROR STATE:
    Red border + AlertCircle icon + error text (whitespace-pre-line)
    "Try Again" button → clear error + file

handleAnalyze:
  setPageState('loading')
  const fd = new FormData()
  fd.append('file', selectedFile)
  fd.append('language', selectedLanguage)
  if (user?.id) fd.append('user_id', user.id)
  try {
    const res = await api.post('/api/analyze', fd, { headers: {'Content-Type': 'multipart/form-data'} })
    // Navigate to analysis page with state
    navigate(`/analysis/${res.data.share_id}`, { state: { result: res.data, fromUpload: true } })
  } catch(e) {
    setError(e.response?.data?.detail || 'Analysis failed')
    setPageState('error')
  }

LOADING STATE: Replace entire content with <LoadingOrbit />

Note: After success, navigate to AnalysisPage — don't render result here.

Constraint notice (below upload zone, text-xs text-gray-600 text-center mt-4):
  "Supports PDFs up to 50MB • Handles 100,000+ token documents • Powered by ScaleDown compression"

Props from App: user, profile
```

---

## MODULE 10 — [COPILOT] AnalysisPage.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/pages/AnalysisPage.jsx

Route: /analysis/:shareId

Two data sources:
1. If navigated FROM AnalyzePage: use location.state.result (fast, no fetch)
2. If accessed directly by URL: fetch GET /api/share/:shareId

State: result(null), loading(true), error(null), language(string), compressedContext('')

On mount:
  if location.state?.result → setResult(location.state.result), setLanguage(result.language), setCompressedContext(result.compressed_text||''), setLoading(false)
  else → fetch /api/share/:shareId → reconstruct result object → setResult, setLoading(false)

Language toggle handler:
  When user changes language on this page, make a NEW Groq call to re-summarize:
  setLoading(true)
  api.post('/api/qa', { question: 'Please provide a full summary of this document.', compressed_context: compressedContext, language: newLang })
    .then(r => { setResult(prev => ({...prev, summary: r.data.answer, language: newLang})); setLanguage(newLang) })
    .finally(() => setLoading(false))
  NOTE: This is a Q&A call used as re-summarize — works without extra endpoint

LOADING: <LoadingOrbit messages={["Loading analysis..."]} />

ERROR (404):
  card-base text-center py-16 max-w-md mx-auto
  "🔍" + "Analysis Not Found" + back button → navigate(-1)

DONE layout (inside AppLayout title={result.document_name truncated}):

ROW 1 — Pipeline Beam (full width):
  <PipelineBeam metrics={result.metrics} documentName={result.document_name} />

ROW 2 — Two column grid (lg:grid-cols-12 gap-6):

  LEFT col (lg:col-span-5):
    <SummaryPanel
      summary={result.summary}
      documentName={result.document_name}
      documentPages={result.document_pages}
      language={language}
      onLanguageChange={handleLanguageChange}
      shareId={result.share_id}
      metrics={result.metrics}
      onReset={() => navigate('/analyze')}
    />

  RIGHT col (lg:col-span-7):
    <MetricsBento metrics={result.metrics} documentPages={result.document_pages} />

ROW 3 — Citizen Q&A (full width, only if compressedContext exists):
  {compressedContext && (
    <CitizenQA compressedContext={compressedContext} language={language} documentName={result.document_name} />
  )}
  If no compressedContext (accessed via share URL, compressedContext not stored):
    <div className="card-base text-center py-8 text-gray-600 text-sm">
      💬 Q&A is only available for analyses you perform directly.
    </div>

Props from App: user, profile
```

---

## MODULE 11 — [COPILOT] ProfilePage.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/pages/ProfilePage.jsx

Route: /profile
If not logged in: redirect to / with sign-in prompt.

State: displayName(''), preferredLanguage('english'), saving(false),
       saveSuccess(false), showDeleteConfirm(false)

On mount / profile load:
  setDisplayName(profile?.display_name || '')
  setPreferredLanguage(profile?.preferred_language || 'english')

Layout (inside AppLayout title="Profile", max-w-xl mx-auto):

SECTION 1 — Avatar + identity (card-base mb-5 flex items-center gap-5):
  Avatar circle (w-16 h-16 rounded-full bg-saffron/20 flex items-center justify-center
                 font-display text-2xl text-saffron):
    First letter of displayName or email
  Right side:
    <p className="font-display font-bold text-white text-lg">{displayName || 'Anonymous'}</p>
    <p className="text-gray-500 text-sm font-body">{user.email}</p>
    <Badge className="mt-1 bg-saffron/10 text-saffron border-saffron/20">
      Member since {new Date(user.created_at).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
    </Badge>


SECTION 2 — Edit profile form (card-base mb-5 space-y-5):
  Heading: "Profile Settings" font-display font-semibold text-white mb-4

  FIELD 1 — Display Name:
    <Label className="text-gray-400 text-xs">Display Name</Label>
    <Input value={displayName} onChange={e=>setDisplayName(e.target.value)}
      placeholder="Your name"
      className="bg-navy border-card-border focus:border-saffron mt-1 h-11 rounded-xl" />

  FIELD 2 — Email (read-only):
    <Label className="text-gray-400 text-xs">Email Address</Label>
    <Input value={user?.email || ''} disabled
      className="bg-navy/50 border-card-border text-gray-500 mt-1 h-11 rounded-xl cursor-not-allowed" />
    <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>

  FIELD 3 — Default Summary Language:
    <Label className="text-gray-400 text-xs mb-2 block">Default Summary Language</Label>
    <LanguageSelector selectedLanguage={preferredLanguage} onChange={setPreferredLanguage} compact />
    <p className="text-xs text-gray-600 mt-2">This will be pre-selected when you analyze documents</p>

  Save button (ShimmerButton shimmerColor="#FF6B00" full width):
    "Save Changes" disabled={saving}
    onClick → handleSave

  Success toast: saveSuccess && "✓ Profile saved!" text-emerald text-sm

handleSave:
  setS saving(true)
  const { error } = await updateProfile({ display_name: displayName, preferred_language: preferredLanguage })
  if (!error) { setSaveSuccess(true); setTimeout(()=>setSaveSuccess(false), 3000) }
  setSaving(false)


SECTION 3 — Stats summary (card-base mb-5):
  Heading: "Your Activity" font-display font-semibold text-white mb-4
  Fetch from /api/history/{userId} on mount, derive:
  grid grid-cols-3 gap-3:
    "{history.length}" → "Documents analyzed"
    "{totalTokensSaved}K" → "Tokens saved"
    "{totalCO2.toFixed(0)}g" → "CO₂ avoided"
  Each: small StatCard with no animation (animate=false)


SECTION 4 — Danger zone (card-base border-red-500/20):
  Heading: "Danger Zone" text-red-400 font-semibold mb-3
  Row: "Delete Account" description + button

  If !showDeleteConfirm:
    <button onClick={()=>setShowDeleteConfirm(true)}
      className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
      Delete Account
    </button>

  If showDeleteConfirm:
    Warning card (bg-red-500/5 border border-red-500/20 rounded-xl p-4):
      "⚠️ This will permanently delete your account and all your analyses."
      Two buttons: "Cancel" + "Yes, Delete My Account" (bg-red-500 text-white)
      handleDelete:
        await supabase.auth.admin.deleteUser(user.id) // Note: needs service role — instead:
        await api.delete(`/api/user/${user.id}`) // call backend endpoint
        signOut()
        navigate('/')

Props from App: user, profile, updateProfile, signOut
```

---

## MODULE 12 — [COPILOT] SharedViewPage.jsx

**Copilot prompt:**
```
TASK: Create frontend/src/pages/SharedViewPage.jsx

Route: /share/:shareId
Public page — no auth required. No sidebar.

State: data(null), loading(true), error(null)

On mount: api.get(`/api/share/${shareId}`)
  .then(r => setData(r.data))
  .catch(e => setError(e.response?.status))
  .finally(() => setLoading(false))

LOADING: <LoadingOrbit messages={["Loading shared analysis..."]} />

ERROR:
  Full page centered (bg-navy min-h-screen flex items-center justify-center):
  card-base text-center max-w-sm:
    "🔍" text-4xl mb-3
    "Analysis Not Found" font-display text-xl font-bold text-white
    "This link may be incorrect or the analysis was removed." text-gray-500 text-sm mt-2 mb-5
    <a href="/"><ShimmerButton>← Analyze Your Own Document</ShimmerButton></a>

SUCCESS layout (no sidebar — full page):

MINIMAL HEADER (bg-navy border-b border-card-border py-3 px-6 flex justify-between):
  Left: "⚖️ NyayaSetu" font-display font-bold text-white
        "Shared Analysis" text-xs text-gray-500 ml-2
  Right: <a href="/"><button className="text-xs text-saffron border border-saffron/20 px-3 py-1.5 rounded-lg">
    Analyze Your Own →</button></a>

SHARED BANNER (bg-saffron/5 border-b border-saffron/10 py-2.5 px-6):
  "📋 Read-Only Shared Analysis  •  Shared by a NyayaSetu user  •
   Analyzed: {new Date(data.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}"
  text-xs text-gray-500

MAIN content (max-w-7xl mx-auto px-4 py-8):
  Reconstruct result object from data fields.
  <PipelineBeam metrics={result.metrics} documentName={result.document_name} />
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
    <div className="lg:col-span-5">
      <SummaryPanel ...result fields onReset={null}
        onLanguageChange={null} (disable toggle on shared view) />
    </div>
    <div className="lg:col-span-7">
      <MetricsBento metrics={result.metrics} documentPages={result.document_pages} />
    </div>
  </div>
  Q&A disabled notice (card-base text-center py-6 text-gray-600 text-sm mt-4):
    "💬 Q&A is not available in shared view"
```

---

## MODULE 13 — [COPILOT] App.jsx + main.jsx

**Copilot prompt:**
```
TASK: Create the router + auth gate in App.jsx and main.jsx.

FILE 1 — Replace frontend/src/main.jsx:
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
  </React.StrictMode>
)


FILE 2 — Replace frontend/src/App.jsx:

import { Routes, Route, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import AppLayout from '@/components/layout/AppLayout'
import AuthModal from '@/components/auth/AuthModal'

import DashboardPage  from '@/pages/DashboardPage'
import PapersPage     from '@/pages/PapersPage'
import AnalyzePage    from '@/pages/AnalyzePage'
import AnalysisPage   from '@/pages/AnalysisPage'
import ProfilePage    from '@/pages/ProfilePage'
import SharedViewPage from '@/pages/SharedViewPage'

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { profile, updateProfile } = useProfile(user?.id)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const onSignIn = () => setShowAuthModal(true)
  const onSignOut = async () => {
    await signOut()
    toast.success('Signed out')
  }

  // Common props passed to all pages
  const pageProps = { user, profile, onSignIn, onSignOut, updateProfile }

  // Wrapper for pages that use AppLayout
  const withLayout = (title, Component) => (
    <AppLayout title={title} {...pageProps}>
      <Component {...pageProps} />
    </AppLayout>
  )

  return (
    <>
      <Routes>
        {/* Public routes (no sidebar) */}
        <Route path="/share/:shareId" element={<SharedViewPage />} />

        {/* App routes (with sidebar) */}
        <Route path="/"         element={withLayout('Dashboard', DashboardPage)}  />
        <Route path="/papers"   element={withLayout('My Papers', PapersPage)}     />
        <Route path="/analyze"  element={withLayout('Analyze',   AnalyzePage)}    />
        <Route path="/analysis/:shareId" element={withLayout('Analysis', AnalysisPage)} />
        <Route path="/profile"  element={withLayout('Profile',   ProfilePage)}    />

        {/* Catch-all → dashboard */}
        <Route path="*" element={withLayout('Dashboard', DashboardPage)} />
      </Routes>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setShowAuthModal(false)
          toast.success(`Welcome! Signed in as ${u.email}`)
        }}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0D1117',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#F1F5F9'
          }
        }}
      />
    </>
  )
}


⭐ After creating both files, run: npm run dev
Test every route manually:
  / → Dashboard loads
  /papers → Papers page loads
  /analyze → Analyze page loads
  /profile → Profile page loads
  /share/TESTID → SharedViewPage shows "not found"
  Upload a PDF on /analyze → navigates to /analysis/:id
```

---

## MODULE F — [ANTIGRAVITY] Deploy to Netlify

> Open Antigravity → ensure Netlify MCP connected → New session

**Antigravity prompt:**
```
Use the Netlify MCP server (built-in) to deploy the NyayaSetu frontend.

STEP 1 — Create netlify.toml in the project root (or frontend/ folder):
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

STEP 2 — Deploy the site. Site name: nyayasetu (or nyayasetu-app if taken)

STEP 3 — Set these environment variables on the Netlify site:
  VITE_SUPABASE_URL      = [from Supabase setup]
  VITE_SUPABASE_ANON_KEY = [from Supabase setup]
  VITE_API_URL           = [Railway backend URL]

STEP 4 — Trigger a deploy and wait for it to complete.

STEP 5 — Show me the final Netlify URL.

STEP 6 — Verify routing works:
  Visit {netlify_url}/share/TEST → should show SharedViewPage "not found"
  (NOT a blank page or 404 from Netlify — the React router should handle it)
```

---

## MODULE G — [MANUAL] Railway + Supabase final config

```
1. Railway → backend service → Variables:
   Confirm SUPABASE_URL and SUPABASE_SERVICE_KEY exist
   Trigger redeploy if you added them fresh.

2. Test: curl https://your-railway-url.railway.app/api/stats
   Should return: { total_analyses: 0, ... }

3. Supabase → Authentication → URL Configuration:
   Site URL:      https://your-app.netlify.app
   Redirect URLs: https://your-app.netlify.app/**
   Save.

4. Add delete user endpoint to backend/main.py:
   @app.delete("/api/user/{user_id}")
   async def delete_user(user_id: str):
       from services.supabase_service import get_client
       try:
           client = get_client()
           client.auth.admin.delete_user(user_id)
           return {"success": True}
       except Exception as e:
           raise HTTPException(500, str(e))
   Redeploy Railway after this change.
```

---

## MODULE H — [COPILOT] Verification Checklist

**Copilot prompt:**
```
TASK: Full end-to-end verification on the Netlify deployment URL.
Test each item, report PASS/FAIL/NOTES.

NAVIGATION
[ ] Sidebar shows: Dashboard, My Papers, Analyze, Profile links
[ ] All links navigate correctly with no blank pages
[ ] /share/TEST shows SharedViewPage "not found" (not a Netlify 404)

AUTH
[ ] "Sign In" opens OTP modal
[ ] Enter real email → OTP received
[ ] Enter OTP → logged in, sidebar shows email + correct name
[ ] Sign out works, returns to guest state

PDF VALIDATION (on /analyze)
[ ] Upload .jpg → instant error with clear message
[ ] Upload .docx → instant error
[ ] Upload .pdf → LanguageSelector appears

ANALYZE FLOW
[ ] Select Hindi → click Analyze → loading orbit shows
[ ] Navigates to /analysis/:shareId after success
[ ] Summary is in Hindi

ANALYSIS PAGE
[ ] PipelineBeam shows correct token numbers
[ ] All 5 metric cards show real numbers
[ ] Language toggle re-fetches summary in new language
[ ] Share button copies /share/xxx URL
[ ] Copied URL works in incognito (SharedViewPage)
[ ] Q&A: type question → answer in selected language
[ ] Suggested Q pills auto-submit
[ ] PDF Report downloads correctly formatted file

DASHBOARD
[ ] Global stats show live numbers
[ ] Recent analyses table shows after first analysis
[ ] "View" links go to /analysis/:id

MY PAPERS
[ ] Shows all past analyses in grid
[ ] Search filters by document name
[ ] Sort works
[ ] "Analyze New" goes to /analyze

PROFILE
[ ] Shows display name + email (read-only)
[ ] Change display name + save → updates sidebar immediately
[ ] Change preferred language → next /analyze pre-selects that language
[ ] Delete account: confirm dialog → account deleted → redirected to /

SHARED VIEW
[ ] /share/:realId shows full analysis without login
[ ] Shows "Read Only" banner
[ ] PDF Download works on shared view
[ ] Q&A shows disabled notice

Report as table:
| Category | Test | Status | Notes |
```

---

## 📊 Final Scoring Impact

| Category | Points | How v5 Helps |
|---|---|---|
| Problem Understanding | 10 | Full product = deep problem understanding |
| Technique Implementation | 25 | Core pipeline unchanged + language shows depth |
| Measurable Results | 25 | Dashboard with cumulative stats = real impact proof |
| Real-World Feasibility | 15 | Auth + history + profile = real product, not demo |
| Demo & Reproducibility | 15 | Deployed URL + share links = judges test live instantly |
| Presentation & Clarity | 10 | Sidebar nav + 5 pages = polished, not a hackathon prototype |
| **Total** | **100** | 🏆 |
