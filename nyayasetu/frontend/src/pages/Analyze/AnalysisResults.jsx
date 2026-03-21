import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AnalysisResults() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state?.result;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState(null);

  if (!data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#050810] text-slate-300 font-label px-4 text-center">
        <span className="material-symbols-outlined text-4xl text-primary-container mb-4">gavel</span>
        <h2 className="text-xl font-headline mb-2 text-white">No Analysis Data Found</h2>
        <p className="max-w-md text-sm mb-6">Analyze a document first to view results.</p>
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
      // api baseURL is already http://localhost:8000/api, so path is just /qa
      const response = await api.post('/qa', {
        question,
        compressed_context: data.compressed_text,
        language: data.language || 'english',
      });
      setAnswer(response.data.answer);
    } catch (err) {
      setAskError(err.response?.data?.detail || err.message || 'Failed to get an answer.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyShare = () => {
    if (!data.share_id) return;
    const url = `${window.location.origin}/shared/${data.share_id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Share link copied!'));
  };

  const compressionPct = Math.round(data.metrics?.compression_percentage || 0);

  const SUGGESTED_QUESTIONS = [
    'What are the key penalties?',
    'How does this affect citizens?',
    'What is the effective date?',
    'Who does this apply to?',
  ];

  return (
    <div className="p-6 bg-[#050810] min-h-full">

      {/* ROW 1: Pipeline Visualization */}
      <section className="w-full bg-[#0D1117] rounded-2xl px-8 py-6 mb-6 flex items-center justify-between overflow-x-auto">
        {/* Node 1 — PDF */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-[#050810] border border-outline-variant/30 flex items-center justify-center text-2xl">📄</div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">PDF Document</p>
            <p className="text-xs text-primary font-mono font-bold">
              {data.metrics?.original_tokens?.toLocaleString() ?? '—'} tokens
            </p>
          </div>
        </div>
        <div className="flex-1 h-[2px] mx-4 relative overflow-hidden min-w-[40px]">
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute inset-0 beam-saffron" />
        </div>
        {/* Node 2 — ScaleDown */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-2xl">⚙️</div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">ScaleDown</p>
            <p className="text-xs text-primary font-mono font-bold">-{compressionPct}%</p>
          </div>
        </div>
        <div className="flex-1 h-[2px] mx-4 relative overflow-hidden min-w-[40px]">
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute inset-0 beam-saffron" />
        </div>
        {/* Node 3 — Groq */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-2xl">🤖</div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Groq LLaMA</p>
            <p className="text-xs text-primary font-mono font-bold">
              {data.metrics?.compressed_tokens?.toLocaleString() ?? '—'} tokens
            </p>
          </div>
        </div>
        <div className="flex-1 h-[2px] mx-4 relative overflow-hidden min-w-[40px]">
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute inset-0 beam-emerald" />
        </div>
        {/* Node 4 — Summary */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-surface-container border border-secondary/40 flex items-center justify-center text-2xl">📋</div>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Summary</p>
            <p className="text-xs text-secondary font-bold">Ready</p>
          </div>
        </div>
      </section>

      {/* ROW 2: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Summary Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#0D1117] rounded-2xl p-6 border border-white/5 flex flex-col">
          {/* Title + actions */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-headline italic text-lg text-white leading-tight mb-2 truncate max-w-[340px]" title={data.document_name}>
                {data.document_name}
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider">AI Summarized</span>
                <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded uppercase tracking-wider">Citizen-Ready</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {data.share_id && (
                <button
                  onClick={handleCopyShare}
                  title="Copy share link"
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">link</span>
                </button>
              )}
            </div>
          </div>

          {/* Language */}
          <div className="mb-5">
            <p className="text-[10px] text-slate-500 font-label mb-2">Summary Language:</p>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-primary text-on-primary-container text-xs font-bold rounded-full capitalize">{data.language} ✓</button>
            </div>
          </div>

          <div className="w-full h-px bg-white/5 mb-5" />

          {/* Summary text */}
          <div className="relative flex-1 overflow-hidden">
            <div className="text-sm text-slate-300 leading-relaxed font-body max-h-[440px] overflow-y-auto pr-4 pb-12 whitespace-pre-wrap">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📋</span>
                <span className="font-headline text-lg italic text-white">SUMMARY</span>
              </div>
              {data.summary || 'No summary available.'}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none" />
          </div>

          <div className="mt-auto pt-5 border-t border-white/5">
            <button
              onClick={() => navigate('/analyze')}
              className="flex items-center gap-2 text-primary font-label text-sm font-bold hover:gap-3 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Analyze Another Document
            </button>
          </div>
        </div>

        {/* Right: Metrics (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 auto-rows-min">

          {/* Tokens Eliminated (spans 2) */}
          <div className="col-span-2 bg-[#0D1117] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-label">Tokens Eliminated</p>
                <h3 className="font-headline text-6xl text-primary -ml-1">
                  {data.metrics?.tokens_saved?.toLocaleString() ?? '—'}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">bolt</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex h-2 rounded-full overflow-hidden bg-surface-container-highest">
                <div className="saffron-gradient" style={{ width: `${100 - compressionPct}%` }} />
                <div className="bg-secondary" style={{ width: `${compressionPct}%` }} />
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-slate-400 font-mono">Kept: {data.metrics?.compressed_tokens?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-[10px] text-slate-400 font-mono">Eliminated: {data.metrics?.tokens_saved?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-6 right-16">
              <span className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded">{compressionPct}% Compression</span>
            </div>
          </div>

          {/* Energy */}
          <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </div>
            <p className="text-[10px] text-slate-500 font-label mb-1">Energy Saved</p>
            <h4 className="font-headline text-2xl text-secondary">
              {(data.metrics?.energy_saved_kwh || 0).toFixed(4)} <span className="text-sm">kWh</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-2">Sustainable Compute</p>
          </div>

          {/* Cost */}
          <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary mb-4">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <p className="text-[10px] text-slate-500 font-label mb-1">Cost Saved</p>
            <h4 className="font-headline text-2xl text-tertiary">
              ${(data.metrics?.cost_saved_usd || 0).toFixed(4)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-2">vs GPT-4o baseline</p>
          </div>

          {/* Density */}
          <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-500 font-label mb-1">Density</p>
                <h4 className="font-headline text-2xl text-primary">{data.metrics?.information_density ?? '—'}</h4>
              </div>
              <span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[8px] font-bold rounded">Medium</span>
            </div>
            <div className="w-full h-1 bg-surface-container mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min((data.metrics?.information_density || 0) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Speed */}
          <div className="bg-[#0D1117] rounded-2xl p-5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mb-4">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <p className="text-[10px] text-slate-500 font-label mb-1">Speed</p>
            <h4 className="font-headline text-2xl text-white">{data.metrics?.scaledown_latency_ms ?? 0} ms</h4>
            <p className="text-[10px] text-slate-400 mt-2">{data.document_pages} pages processed</p>
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

        {/* Suggested questions */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setQuestion(q)}
              className="px-3 py-2 bg-surface-container hover:bg-surface-bright text-xs text-slate-300 rounded-lg transition-colors border border-white/5"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              className="w-full h-12 bg-[#050810] border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-slate-600 outline-none"
              placeholder="Type your question here (e.g., Is this applicable in Maharashtra?)..."
              type="text"
            />
          </div>
          <button
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            className="h-12 px-8 saffron-gradient text-on-primary-container font-label font-bold rounded-xl flex items-center justify-center gap-2 hover:gap-3 transition-all shrink-0 disabled:opacity-50"
          >
            {isAsking ? 'Thinking...' : 'Ask'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Answer */}
        {(answer || askError) && (
          <div className={`mt-6 p-5 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap ${
            askError
              ? 'bg-error/10 border-error/20 text-error'
              : 'bg-primary/5 border-primary/20 text-slate-200'
          }`}>
            {askError || answer}
          </div>
        )}
      </section>
    </div>
  );
}
