import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';

export default function AnalysisResults() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state?.result;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState(null);

  if (!data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#050810] text-slate-300 font-label px-4 text-center">
        <span className="material-symbols-outlined text-4xl text-primary-container mb-4">gavel</span>
        <h2 className="text-xl font-headline mb-2 text-white">No Analysis Data Found</h2>
        <p className="max-w-md text-sm mb-6">You must analyze a document first to view this page. The analysis data is kept securely in your browser session for Q&A.</p>
        <button 
          onClick={() => navigate('/analyze')}
          className="px-6 py-2 rounded-lg bg-primary text-[#572000] font-bold"
        >
          Go to Analyze
        </button>
      </div>
    );
  }

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;
    setIsAsking(true);
    setAskError(null);
    setAnswer(null);

    try {
      const response = await api.post("/api/qa", {
        question: question,
        compressed_context: data.compressed_text,
        language: data.language || "english"
      });
      setAnswer(response.data.answer);
    } catch (err) {
      setAskError(err.response?.data?.detail || err.message || "Failed to get an answer.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="p-6 bg-[#050810] min-h-full">
      {/* ROW 1: Pipeline Visualization */}
      <section className="w-full bg-[#0D1117] rounded-2xl px-8 py-6 mb-6 flex items-center justify-between overflow-x-auto">
        {/* Node 1 */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-[#050810] border border-white/10 flex items-center justify-center text-2xl shadow-inner">
            📄
          </div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">PDF Document</p>
            <p className="text-xs text-primary font-mono font-bold">6,493 tokens</p>
          </div>
        </div>

        {/* Beam 1 */}
        <div className="flex-1 h-[2px] mx-4 relative overflow-hidden min-w-[50px]">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent w-full"></div>
        </div>

        {/* Node 2 */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-[#1c2028] flex items-center justify-center text-2xl">
            ⚙️
          </div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">ScaleDown</p>
            <p className="text-xs text-primary font-mono font-bold">-56%</p>
          </div>
        </div>

        {/* Beam 2 */}
        <div className="flex-1 h-[2px] mx-4 relative overflow-hidden min-w-[50px]">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent w-full"></div>
        </div>

        {/* Node 3 */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-[#1c2028] flex items-center justify-center text-2xl">
            🤖
          </div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Groq LLaMA</p>
            <p className="text-xs text-primary font-mono font-bold">2,825 tokens</p>
          </div>
        </div>

        {/* Beam 3 */}
        <div className="flex-1 h-[2px] mx-4 relative overflow-hidden min-w-[50px]">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4edea3] to-transparent w-full"></div>
        </div>

        {/* Node 4 */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-[#1c2028] border border-emerald-400/40 flex items-center justify-center text-2xl">
            📋
          </div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Summary</p>
            <p className="text-xs text-emerald-400 font-bold">Ready</p>
          </div>
        </div>
      </section>

      {/* ROW 2: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Summary Panel */}
        <div className="lg:col-span-7 bg-[#0D1117] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <div className="flex flex-col mb-4">
                <h2 className="font-headline italic text-lg text-white leading-tight mb-2 truncate max-w-[300px]" title={data.document_name}>{data.document_name}</h2>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] text-slate-500 font-label mb-2">Summary Language:</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-primary text-[#572000] text-xs font-bold rounded-full capitalize">{data.language} ✓</button>
              </div>
            </div>

            <div className="w-full h-px bg-white/5 mb-6"></div>

            <div className="relative flex-1 overflow-hidden">
              <div className="text-sm text-slate-300 leading-relaxed font-body max-h-[400px] overflow-y-auto pr-4 pb-12 whitespace-pre-wrap">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📋</span>
                  <span className="font-headline text-lg italic text-white">SUMMARY</span>
                </div>
                {data.summary || "No summary available."}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔑</span>
                <span className="font-headline text-lg italic text-white">KEY POINTS</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  <span>Is bill mein central government ke liye various ministries and departments ke funds allocate kiye gaye hain.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  <span>Specifically, infrastructure development projects ke liye ₹2.4 Lakh Crores ki badhotari dekhi gayi hai.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  <span>Social welfare schemes like MNREGA and PM-Kisan will receive sustained funding as per last year's revised estimates.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  <span>Agricultural credit targets have been boosted to ₹20 Lakh Crore to assist small-scale farmers.</span>
                </li>
              </ul>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none"></div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-white/5">
            <button 
              onClick={() => navigate('/analyze')}
              className="flex items-center gap-2 text-primary font-label text-sm font-bold hover:gap-3 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Analyze Another Document
            </button>
          </div>
        </div>

        {/* Right: Metrics Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 auto-rows-min">
            {/* Card 1 */}
            <div className="col-span-2 bg-[#0D1117] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-label">Tokens Eliminated</p>
                  <h3 className="font-headline text-6xl text-primary -ml-1">{data.metrics.tokens_saved?.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex h-2 rounded-full overflow-hidden bg-[#31353e]">
                  <div className="w-[43%] bg-gradient-to-r from-[#ffb693] to-[#ff6b00]"></div>
                  <div className="w-[57%] bg-emerald-400"></div>
                </div>
                <div className="flex justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-[10px] text-slate-400 font-mono">Kept: {data.metrics.compressed_tokens?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] text-slate-400 font-mono">Eliminated: {data.metrics.tokens_saved?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-6 right-16">
                <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded">{Math.round(data.metrics.compression_percentage || 0)}% Compression</span>
              </div>
            </div>

            {/* Stat Card: Energy */}
            <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 mb-4">
                <span className="material-symbols-outlined text-[20px]">eco</span>
              </div>
              <p className="text-[10px] text-slate-500 font-label mb-1">Energy Saved</p>
              <h4 className="font-headline text-2xl text-emerald-400">{(data.metrics.energy_saved_kwh || 0).toFixed(4)} <span className="text-sm">kWh</span></h4>
              <p className="text-[10px] text-slate-400 mt-2">Sustainable Compute</p>
            </div>

            {/* Stat Card: Cost */}
            <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 mb-4">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <p className="text-[10px] text-slate-500 font-label mb-1">Cost Saved</p>
              <h4 className="font-headline text-2xl text-amber-400">${(data.metrics.cost_saved_usd || 0).toFixed(4)}</h4>
              <p className="text-[10px] text-slate-400 mt-2">vs API baseline</p>
            </div>

            {/* Stat Card: Density */}
            <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[20px]">bar_chart</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-500 font-label mb-1">Density</p>
                  <h4 className="font-headline text-2xl text-primary">{data.metrics.information_density || 1.0}</h4>
                </div>
                <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-400 text-[8px] font-bold rounded">Optimized</span>
              </div>
            </div>

            {/* Stat Card: Speed */}
            <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mb-4">
                <span className="material-symbols-outlined text-[20px]">timer</span>
              </div>
              <p className="text-[10px] text-slate-500 font-label mb-1">Processing Speed</p>
              <h4 className="font-headline text-2xl text-white">{data.metrics.scaledown_latency_ms || 0} ms</h4>
              <p className="text-[10px] text-slate-400 mt-2">{data.document_pages} pages parsed</p>
            </div>
          </div>
      </div>

      {/* ROW 3: Q&A Panel */}
      <section className="w-full bg-[#0D1117] rounded-2xl p-6 mt-6 border border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">forum</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-white">Ask About This Law</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="px-3 py-2 bg-[#1c2028] hover:bg-[#353943] text-xs text-slate-300 rounded-lg transition-colors border border-white/5">What are the key penalties?</button>
          <button className="px-3 py-2 bg-[#1c2028] hover:bg-[#353943] text-xs text-slate-300 rounded-lg transition-colors border border-white/5">How does this affect citizens?</button>
          <button className="px-3 py-2 bg-[#1c2028] hover:bg-[#353943] text-xs text-slate-300 rounded-lg transition-colors border border-white/5">What is the effective date?</button>
          <button className="px-3 py-2 bg-[#1c2028] hover:bg-[#353943] text-xs text-slate-300 rounded-lg transition-colors border border-white/5">Show me the allocation for health.</button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              className="w-full h-12 bg-[#050810] border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-slate-600" 
              placeholder="Type your question here (e.g., Is this applicable in Maharashtra?)..." 
              type="text" 
            />
          </div>
          <button 
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            className="h-12 px-8 bg-gradient-to-r from-[#ffb693] to-[#ff6b00] text-[#572000] font-label font-bold rounded-xl active:opacity-90 flex items-center justify-center gap-2 hover:gap-3 transition-all shrink-0 disabled:opacity-50"
          >
            {isAsking ? 'Thinking...' : 'Ask'} <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Q&A Result Container */}
        {(answer || askError) && (
          <div className={`mt-6 p-5 rounded-xl border ${askError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-primary/5 border-primary/20 text-slate-200'} text-sm leading-relaxed whitespace-pre-wrap`}>
            {askError || answer}
          </div>
        )}
      </section>
    </div>
  );
}
