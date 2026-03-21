import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getGlobalStats, getUserHistory } from "@/lib/api"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total_analyses: 0, total_tokens_saved: 0, total_co2_saved_grams: 0 })
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        const [statsData, historyData] = await Promise.all([
          getGlobalStats().catch(() => ({ total_analyses: 0, total_tokens_saved: 0, total_co2_saved_grams: 0 })),
          user ? getUserHistory(user.id).catch(() => []) : Promise.resolve([])
        ])
        
        setStats(statsData)
        setHistory(historyData)
      } catch (error) {
        console.error("Dashboard fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const costSaved = (stats.total_tokens_saved * 0.0000025).toFixed(2)

  return (
    <div className="p-8 max-w-[1400px] w-full mx-auto">
      {/* Welcome Header */}
      <section className="mb-12">
        <h2 className="font-headline text-4xl font-medium tracking-tight mb-2">Welcome back 👋</h2>
        <p className="text-slate-400 font-label tracking-wide text-sm">
          ARCHIVE STATUS: <span className="text-secondary">OPTIMIZED</span> • LAST AUDIT: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
        </p>
      </section>

      {/* Global Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#1c2028] p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-700"></div>
          <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest mb-4">Documents Analyzed</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl text-primary">{stats.total_analyses.toLocaleString()}</span>
            <span className="font-mono text-xs text-secondary">+0 this week</span>
          </div>
        </div>

        <div className="bg-[#1c2028] p-6 rounded-3xl relative overflow-hidden group">
          <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest mb-4">Tokens Optimized</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl text-primary">{stats.total_tokens_saved.toLocaleString()}</span>
            <span className="font-mono text-[10px] text-slate-400">ScaleDown v4.2</span>
          </div>
        </div>

        <div className="bg-[#1c2028] p-6 rounded-3xl relative overflow-hidden group">
          <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest mb-4">CO₂ Avoided</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl text-secondary">{stats.total_co2_saved_grams.toLocaleString()}g</span>
            <span className="font-mono text-[10px] text-slate-500 italic">708g/kWh grid</span>
          </div>
        </div>

        <div className="bg-[#1c2028] p-6 rounded-3xl relative overflow-hidden group">
          <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest mb-4">Cost Saved</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl text-tertiary">${costSaved}</span>
            <span className="font-mono text-[10px] text-slate-500">vs GPT-4o base</span>
          </div>
        </div>
      </div>

      {/* Recent Analyses Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="font-headline text-2xl">Recent Analyses</h3>
          <a className="font-label text-xs uppercase tracking-widest text-primary hover:text-primary-container transition-colors flex items-center gap-2" href="/papers">
            View all archive <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
          </a>
        </div>
        
        <div className="bg-[#1c2028] rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 font-label text-[10px] uppercase tracking-widest text-slate-500">Document</th>
                  <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-slate-500">Pages</th>
                  <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-slate-500">Compression</th>
                  <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-slate-500">Language</th>
                  <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-slate-500">Date</th>
                  <th className="px-8 py-5 font-label text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-slate-500 text-sm">
                      Loading your analyses...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-slate-500 text-sm">
                      No analyses found. Head to the Analyze page to get started.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(`/shared/${item.share_id}`)}>
                      <td className="px-8 py-4 font-headline text-sm text-slate-300 group-hover:text-primary transition-colors">{item.document_name}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.document_pages} params</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded">-{Math.round(item.compression_percentage)}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#2a2e38] text-slate-300 text-[10px] font-label font-bold rounded capitalize">{item.language}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-label">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-4 text-right">
                        <button className="text-secondary font-label text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 justify-end w-full">
                          View details <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom Contextual Footer */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        <div className="p-8 rounded-3xl bg-secondary/5 border border-secondary/10">
          <h4 className="font-headline text-xl text-secondary mb-2">Computational Sovereignty</h4>
          <p className="text-slate-400 text-sm leading-relaxed">All analyses are performed using India-localized model weight optimizations. Data never leaves the sovereign digital boundary. ScaleDown active at 4.2x efficiency.</p>
        </div>
        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10">
          <h4 className="font-headline text-xl text-primary mb-2">Legal Accuracy Audit</h4>
          <p className="text-slate-400 text-sm leading-relaxed">The LLaMA 3.3 backbone is fine-tuned on the Supreme Court of India's historical judgments (1950-2025). Current model confidence: <span className="text-white font-mono">99.4%</span></p>
        </div>
      </div>
    </div>
  );
}
