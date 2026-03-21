import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { analyzeDocument } from "@/lib/api"
import { supabase } from "@/lib/supabase"

const LANGUAGES = [
  { code: 'english', flag: '🇬🇧', label: 'English' },
  { code: 'hindi', flag: '🇮🇳', label: 'Hindi • हिन्दी' },
  { code: 'tamil', flag: '🇮🇳', label: 'Tamil • தமிழ்' },
  { code: 'bengali', flag: '🇮🇳', label: 'Bengali • বাংলা' },
  { code: 'hinglish', flag: '🇮🇳', label: 'Hinglish' },
]

function IdleState({ onFileSelected }) {
  return (
    <div className="w-full max-w-[640px] mx-auto">
      {/* Heading */}
      <section className="mb-10 text-center">
        <h1 className="font-headline text-[32px] font-bold text-[#F1F5F9] leading-tight mb-2">
          Analyze a Legal Document
        </h1>
        <p className="font-body text-[#F1F5F9]/50 text-sm tracking-wide">
          Upload any Indian bill, act, or policy PDF
        </p>
      </section>

      {/* Upload Zone */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-container/20 to-tertiary/20 rounded-[22px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <label className="relative flex flex-col items-center justify-center min-h-[240px] bg-[#0D1117] border-2 border-dashed border-primary-container/30 rounded-[20px] cursor-pointer hover:border-primary-container/60 transition-all overflow-hidden group">
          {/* Dot Pattern */}
          <div className="absolute inset-0 dot-pattern opacity-[0.08] pointer-events-none" />
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-8">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-4xl text-primary-container">upload</span>
            </div>
            <h3 className="font-headline text-[22px] text-white mb-1">Drop your PDF here</h3>
            <p className="font-body text-[#F1F5F9]/50 text-[13px]">or click to browse your local archive</p>
          </div>
          <input accept=".pdf" className="hidden" type="file" onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])} />
        </label>
      </div>

      {/* Feature Bento */}
      <div className="grid grid-cols-3 gap-4 mt-12">
        <div className="bg-surface-container-low p-4 rounded-xl border border-white/5 flex flex-col gap-2">
          <span className="material-symbols-outlined text-secondary text-xl">verified_user</span>
          <div>
            <p className="text-[10px] font-label text-secondary uppercase tracking-widest">Security</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">End-to-end encrypted processing.</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border border-white/5 flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          <div>
            <p className="text-[10px] font-label text-primary uppercase tracking-widest">Intelligence</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">Neural clause extraction active.</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border border-white/5 flex flex-col gap-2">
          <span className="material-symbols-outlined text-tertiary text-xl">history_edu</span>
          <div>
            <p className="text-[10px] font-label text-tertiary uppercase tracking-widest">Jurisdiction</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">Optimized for Indian Constitution.</p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <footer className="mt-16 text-center">
        <p className="font-body text-[11px] text-[#F1F5F9]/40 tracking-wide flex items-center justify-center gap-2">
          <span>Supports PDFs up to 50MB</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
          <span>Handles 100,000+ token documents</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
          <span className="font-semibold text-primary/60 italic">Powered by ScaleDown</span>
        </p>
      </footer>
    </div>
  )
}

function FileSelectedState({ file, onClear, onAnalyze, language, setLanguage }) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)

  return (
    <div className="w-full max-w-[640px] mx-auto space-y-10">
      {/* Heading */}
      <section className="text-center space-y-2">
        <h3 className="font-headline text-[32px] font-bold text-[#F1F5F9] tracking-tight">Analyze a Legal Document</h3>
        <p className="font-body text-on-surface-variant/50 text-sm">Upload any Indian bill, act, or policy PDF</p>
      </section>

      {/* File info card */}
      <section className="bg-[#0D1117] border border-outline-variant/10 rounded-xl p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <div>
            <h4 className="font-body font-medium text-[#F1F5F9] text-[15px] truncate max-w-[300px]">{file.name}</h4>
            <p className="font-mono text-[10px] text-on-surface-variant/40 tracking-wider">{fileSizeMB} MB</p>
          </div>
        </div>
        <button onClick={onClear} className="w-8 h-8 flex items-center justify-center text-on-surface-variant/40 hover:text-error transition-colors">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </section>

      {/* Language selector */}
      <section className="space-y-4">
        <label className="font-label text-xs text-on-surface-variant/40 uppercase tracking-[0.1em] px-1">Summary Language</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                language === code
                  ? 'bg-primary/10 border border-primary/40 text-on-surface'
                  : 'bg-transparent border border-outline-variant/10 text-on-surface-variant/60 hover:border-outline-variant/40'
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Analyze button */}
      <section className="pt-4 flex flex-col items-center gap-4">
        <button
          onClick={() => onAnalyze(file, language)}
          className="w-full h-[48px] bg-primary/10 border border-primary text-primary font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-primary/20 active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="shimmer absolute inset-0" />
          <span className="relative z-10 text-sm tracking-wide">Analyze Document →</span>
        </button>
        <div className="flex flex-col items-center gap-1 opacity-60">
          <p className="font-mono text-[10px] text-on-surface-variant/60">Powered by ScaleDown Token Compression × Groq</p>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-secondary">verified_user</span>
              <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">Sovereign Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-secondary">bolt</span>
              <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">Low Latency Analysis</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl px-6 min-h-[70vh]">
      {/* Subtle brand watermark */}
      <div className="fixed top-12 left-[280px] opacity-5 pointer-events-none">
        <h1 className="font-headline italic text-4xl text-on-surface">NyayaSetu</h1>
      </div>

      {/* Orbital Engine */}
      <div className="relative flex items-center justify-center mb-24" style={{ height: 300, width: 300 }}>
        <div className="orbital-ring animate-orbit-slow border-2" style={{ width: 260, height: 260 }}>
          <div className="absolute top-0 transform -translate-y-1/2 text-2xl">✨</div>
        </div>
        <div className="orbital-ring animate-orbit-mid border-2" style={{ width: 180, height: 180 }}>
          <div className="absolute right-0 transform translate-x-1/2 text-xl">📄</div>
        </div>
        <div className="orbital-ring animate-orbit-fast border-[1.5px]" style={{ width: 110, height: 110 }}>
          <div className="absolute bottom-0 transform translate-y-1/2 text-lg">⚖️</div>
        </div>
        <div className="flex items-center justify-center bg-surface-container-lowest rounded-full w-20 h-20 shadow-[0_0_40px_rgba(255,107,0,0.15)] z-20 border border-outline-variant/10">
          <span className="font-headline text-[22px] font-bold text-primary tracking-tight">AI</span>
        </div>
      </div>

      {/* Status messaging */}
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-base text-slate-300 tracking-wide flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            Compressing with ScaleDown...
          </h2>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container/80 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container/80 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container/80 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          <div className="flex items-center gap-2 text-secondary/70">
            <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-label text-xs uppercase tracking-widest">Extract</span>
          </div>
          <div className="h-[1px] w-4 bg-outline-variant/20" />
          <div className="flex items-center gap-2 text-primary glow-saffron status-pulse">
            <span className="material-symbols-outlined text-sm">hourglass_empty</span>
            <span className="font-label text-xs uppercase tracking-widest font-bold">Compress</span>
          </div>
          <div className="h-[1px] w-4 bg-outline-variant/20" />
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full border border-slate-700" />
            <span className="font-label text-xs uppercase tracking-widest">Analyze</span>
          </div>
          <div className="h-[1px] w-4 bg-outline-variant/20" />
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full border border-slate-700" />
            <span className="font-label text-xs uppercase tracking-widest">Summarize</span>
          </div>
        </div>

        <p className="font-mono text-xs text-slate-600 italic mt-8 bg-surface-container-low/30 px-4 py-2 rounded-full inline-block border border-outline-variant/5">
          Hint: Large documents may take 20–40 seconds
        </p>
      </div>

      {/* Background decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none opacity-40" />
    </div>
  )
}

function Analyze() {
  const navigate = useNavigate()
  const [appState, setAppState] = useState("idle")
  const [selectedFile, setSelectedFile] = useState(null)
  const [language, setLanguage] = useState("english")

  const handleFileSelected = (file) => {
    setSelectedFile(file)
    setAppState("fileSelected")
  }

  const handleClear = () => {
    setSelectedFile(null)
    setAppState("idle")
  }

  const handleAnalyze = async (file, lang) => {
    setAppState("loading")
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || null
      const resultData = await analyzeDocument(file, lang, userId)
      navigate(`/analyze/${resultData.id || 'result'}`, { state: { result: resultData } })
    } catch (requestError) {
      const errorMessage = requestError?.response?.data?.detail || "Analysis failed"
      setAppState("fileSelected")
      toast.error(errorMessage)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-6 min-h-[calc(100vh-80px)]">
      {appState === "idle" && (
        <IdleState onFileSelected={handleFileSelected} />
      )}

      {appState === "fileSelected" && selectedFile && (
        <FileSelectedState
          file={selectedFile}
          onClear={handleClear}
          onAnalyze={handleAnalyze}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {appState === "loading" && <ProcessingState />}

      {/* Ambient glow */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none translate-x-1/2 translate-y-1/2" />
    </div>
  )
}

export default Analyze
