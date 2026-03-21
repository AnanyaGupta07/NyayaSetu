import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSharedAnalysis } from '@/lib/api';

export default function SharedAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const result = await getSharedAnalysis(id);
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to fetch analysis');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#050810] text-primary font-label">Loading Analysis...</div>;
  }

  if (error || !data) {
    return <div className="flex h-screen items-center justify-center bg-[#050810] text-red-400 font-label">{error || "Analysis not found"}</div>;
  }

  return (
    <div className="font-body text-on-surface antialiased overflow-x-hidden bg-[#050810] min-h-screen">
      {/* Minimal Header */}
      <header className="w-full h-[52px] bg-[#050810] border-b border-primary-fixed-dim/10 flex items-center justify-between px-8 fixed top-0 z-[100]">
        <div className="flex items-center">
          <span className="font-playfair font-bold text-[18px] text-white tracking-tight">⚖️ NyayaSetu</span>
          <span className="font-dmsans text-[12px] text-on-surface-variant/40 ml-4 border-l border-on-surface-variant/20 pl-4 uppercase tracking-widest">Shared Analysis</span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/analyze')}
            className="font-dmsans text-sm font-medium text-primary-container border border-primary-container/40 px-4 h-9 rounded-[10px] hover:bg-primary-container/10 transition-all flex items-center gap-2"
          >
            Analyze Your Own <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Shared Banner */}
      <div className="w-full bg-primary-container/5 border-b border-primary-container/10 py-2.5 px-6 mt-[52px]">
        <div className="flex flex-wrap items-center gap-2 font-dmsans text-[12px] text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[16px] text-primary-container">description</span>
          <span>Read-Only Shared Analysis</span>
          <span className="text-on-surface-variant/20 hidden sm:inline">•</span>
          <span>Shared securely via NyayaSetu</span>
          <span className="text-on-surface-variant/20 hidden sm:inline">•</span>
          <span>Analyzed: {new Date(data.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-8 pb-32">
        {/* Pipeline Visualization */}
        <section className="mb-12 relative overflow-x-auto pb-4">
          <div className="flex items-center justify-between min-w-[760px] relative px-4">
            {/* Line background */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10"></div>
            
            {/* Node 1 */}
            <div className="flex flex-col items-center bg-[#181c24] p-4 rounded-xl border border-white/5 min-w-[160px]">
              <span className="material-symbols-outlined text-primary mb-2">picture_as_pdf</span>
              <span className="font-label text-[11px] uppercase tracking-tighter text-slate-400">Source PDF</span>
              <span className="font-headline text-lg font-bold text-white">6,493 <span className="text-[10px] font-normal text-slate-500">TKN</span></span>
            </div>
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent flex-1 mx-4 opacity-30"></div>
            
            {/* Node 2 */}
            <div className="flex flex-col items-center bg-[#181c24] p-4 rounded-xl border border-white/5 min-w-[160px]">
              <span className="material-symbols-outlined text-emerald-400 mb-2">compress</span>
              <span className="font-label text-[11px] uppercase tracking-tighter text-slate-400">ScaleDown</span>
              <span className="font-headline text-lg font-bold text-emerald-400">-56% <span className="text-[10px] font-normal text-emerald-400/60">Reduced</span></span>
            </div>
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent flex-1 mx-4 opacity-30"></div>
            
            {/* Node 3 */}
            <div className="flex flex-col items-center bg-[#181c24] p-4 rounded-xl border border-white/5 min-w-[160px]">
              <span className="material-symbols-outlined text-amber-400 mb-2">neurology</span>
              <span className="font-label text-[11px] uppercase tracking-tighter text-slate-400">Groq LLaMA</span>
              <span className="font-headline text-lg font-bold text-white">2,825 <span className="text-[10px] font-normal text-slate-500">TKN</span></span>
            </div>
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent flex-1 mx-4 opacity-30"></div>
            
            {/* Node 4 */}
            <div className="flex flex-col items-center bg-primary-container/10 p-4 rounded-xl border border-primary-container/30 min-w-[160px]">
              <span className="material-symbols-outlined text-primary-container mb-2">verified</span>
              <span className="font-label text-[11px] uppercase tracking-tighter text-primary-container">Status</span>
              <span className="font-headline text-lg font-bold text-white">Summary Ready</span>
            </div>
          </div>
        </section>

        {/* Grid 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT: Summary Panel */}
          <div className="md:col-span-5 bg-[#0D1117] rounded-xl p-6 border border-white/5 shadow-2xl">
            {/* Action Row */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex gap-1 overflow-x-auto">
                <span className="px-3 py-1 bg-primary text-[#572000] text-[10px] font-bold rounded capitalize">{data.language} ✓</span>
              </div>
              <div className="flex flex-col mb-4">
                <h2 className="font-headline italic text-lg text-white leading-tight mb-2 truncate max-w-[300px]" title={data.document_name}>{data.document_name}</h2>
              </div>
            </div>
            {/* Action Row */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex gap-1 overflow-x-auto">
                <span className="px-3 py-1 bg-[#353943] text-slate-300 text-[10px] rounded font-medium opacity-50 cursor-not-allowed">English</span>
                <span className="px-3 py-1 text-slate-500 text-[10px] font-medium">Hindi</span>
                <span className="px-3 py-1 text-slate-500 text-[10px] font-medium">Marathi</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="p-2 hover:bg-[#353943] rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-slate-400">share</span>
                </button>
                <button className="p-2 hover:bg-[#353943] rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-slate-400">file_download</span>
                </button>
              </div>
            </div>

            {/* Summary Content */}
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">assignment</span>
                  <h3 className="font-headline font-bold text-xl text-white tracking-tight">SUMMARY</h3>
                </div>
                <div className="font-body text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {data.summary || "No summary available."}
                </div>
              </section>
            </div>

            {/* Banner in panel */}
            <div className="mt-12 py-3 px-4 bg-[#10131c]/40 rounded-lg border border-white/5">
              <p className="font-dmsans text-[11px] text-slate-400 italic flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Q&A only available when analyzing directly
              </p>
            </div>
          </div>

          {/* RIGHT: Metrics Bento */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
            {/* Card 1 */}
            <div className="bg-[#181c24] rounded-xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/5 rounded-full -mr-12 -mt-12"></div>
              <div className="relative">
                <span className="font-label text-[10px] uppercase tracking-widest text-slate-400 mb-4 block">Tokens Eliminated</span>
                <div className="font-headline text-3xl font-bold text-white mb-1">{data.tokens_saved?.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-label text-sm font-bold">{Math.round(data.compression_percentage || 0)}% Compression</span>
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">trending_down</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#181c24] rounded-xl p-6 border border-white/5">
              <span className="font-label text-[10px] uppercase tracking-widest text-slate-400 mb-4 block">Energy Saved</span>
              <div className="font-headline text-3xl font-bold text-white mb-1">{(data.energy_saved_kwh || 0).toFixed(4)} <span className="text-sm font-normal text-slate-500">kWh</span></div>
              <div className="text-slate-400 text-xs font-dmsans">Sustainable Compute</div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#181c24] rounded-xl p-6 border border-white/5">
              <span className="font-label text-[10px] uppercase tracking-widest text-slate-400 mb-4 block">Cost Saved</span>
              <div className="font-headline text-3xl font-bold text-white mb-1">${(data.cost_saved_usd || 0).toFixed(4)}</div>
              <div className="text-emerald-400 text-xs font-dmsans font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">savings</span>
                Efficient Routing Active
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#181c24] rounded-xl p-6 border border-white/5">
              <span className="font-label text-[10px] uppercase tracking-widest text-slate-400 mb-4 block">Information Density</span>
              <div className="font-headline text-3xl font-bold text-white mb-1">{data.information_density || 1.0}</div>
              <div className="text-slate-400 text-xs font-dmsans">Optimized Logic Tree</div>
            </div>

            {/* Processing Speed (Wide Card) */}
            <div className="sm:col-span-2 bg-[#181c24] rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-slate-400 mb-1 block">Processing Speed</span>
                <div className="font-headline text-3xl font-bold text-white">{data.scaledown_latency_ms || 0} <span className="text-sm font-normal text-slate-500">ms</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM Section */}
        <section className="mt-24">
          <div className="bg-[#0D1117] rounded-xl py-12 px-6 text-center border border-white/5">
            <div className="mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h4 className="font-dmsans text-lg font-medium text-white mb-2">Q&A is only available for analyses you perform directly</h4>
            <p className="font-dmsans text-sm text-slate-400 max-w-md mx-auto">
              To interact with this document, ask questions, or extract specific clauses, please upload the document to your private workspace.
            </p>
          </div>
          <div className="text-center mt-12">
            <p className="font-dmsans text-sm text-slate-500">Want to ask questions about this document?</p>
            <button 
              onClick={() => navigate('/analyze')}
              className="mt-2 text-primary-container font-medium font-dmsans hover:underline flex items-center justify-center gap-1 mx-auto group"
            >
              Analyze it yourself 
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-12 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#080D1A] border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <span className="text-sm font-bold text-[#FFB693]">NyayaSetu</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 text-center">© 2024 NyayaSetu Sovereign Archive. Restricted Read-Only Access.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#FFB693] transition-opacity" href="#">Terms of Service</a>
          <a className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#FFB693] transition-opacity" href="#">Privacy Policy</a>
          <a className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#FFB693] transition-opacity" href="#">Upgrade Workspace</a>
        </div>
      </footer>
    </div>
  );
}
