import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserHistory } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function MyPapers() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const data = await getUserHistory(user.id);
          setHistory(data);
        }
      } catch (error) {
        console.error("MyPapers fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const totalTokensSaved = history.reduce((sum, item) => sum + (item.tokens_saved || 0), 0);
  const totalCo2Saved = (totalTokensSaved * 0.000001 * 708).toFixed(2); // Approximate calc

  return (
    <div className="p-8 space-y-8 max-w-[1400px] w-full mx-auto">
      {/* Toolbar Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
            <input 
              className="bg-[#0D1117] border-none rounded-lg py-2.5 pl-10 pr-4 w-full md:w-[280px] text-sm focus:ring-1 ring-primary/20 text-on-surface" 
              placeholder="Search documents..." 
              type="text" 
            />
          </div>
          <div className="relative hidden sm:block">
            <select className="bg-transparent border-none text-xs text-slate-400 font-label appearance-none pr-8 py-2 cursor-pointer hover:text-on-surface transition-colors focus:ring-0">
              <option>Newest first</option>
              <option>Oldest first</option>
              <option>Size descending</option>
            </select>
            <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">expand_more</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/analyze')}
          className="bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold text-xs font-label shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Analyze New Document
        </button>
      </div>

      {/* Stats Mini Row */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-label text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700"></span> {history.length} documents</span>
        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700"></span> {totalTokensSaved.toLocaleString()} tokens saved</span>
        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700"></span> {totalCo2Saved}g CO₂ avoided</span>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Card: Upload Shortcut */}
        <label 
          htmlFor="file-upload" 
          className="relative bg-[#0D1117]/40 rounded-xl p-5 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center h-[220px] cursor-pointer group hover:bg-primary/5 hover:border-primary transition-all"
        >
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            accept=".pdf"
            onChange={() => navigate('/analyze')}
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-2xl">upload_file</span>
          </div>
          <span className="text-[#FFB693] font-bold font-label text-sm">⬆️ Upload New</span>
          <p className="text-[10px] text-slate-600 font-label mt-2">Max 50MB per file</p>
        </label>
        
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-label text-sm">
            Loading your documents...
          </div>
        ) : history.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-label text-sm">
            You haven't analyzed any documents yet. Upload a PDF to begin!
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-[#0D1117] rounded-xl p-5 border border-white/5 flex flex-col group hover:border-white/10 transition-colors cursor-pointer" onClick={() => navigate(`/shared/${item.share_id}`)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1c2028] flex items-center justify-center text-lg shadow-inner">
                  📄
                </div>
                <div>
                  <h4 className="font-headline text-sm text-slate-200 truncate w-[160px] group-hover:text-primary transition-colors">{item.document_name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.document_pages} pages • {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="text-slate-500 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded">-{Math.round(item.compression_percentage)}% tokens</span>
              <span className="px-2 py-0.5 bg-[#2a2e38] text-slate-300 text-[10px] font-label font-bold rounded capitalize">{item.language}</span>
            </div>

            <div className="mt-auto pt-4 border-t border-white/[0.03] flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-slate-500 font-label">Analyzed by ScaleDown</p>
              <span className="material-symbols-outlined text-[16px] text-secondary">arrow_forward</span>
            </div>
          </div>
        )))}
      </div>

      {/* Footer Stats */}
      <div className="pt-12 mt-8 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-label text-slate-600">
        <p>NYAYASETU SOVEREIGN ARCHIVE v2.4.1</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <span>END-TO-END ENCRYPTED</span>
          <span>GDPR COMPLIANT</span>
          <span>MEITY AUDITED</span>
        </div>
      </div>
    </div>
  );
}
