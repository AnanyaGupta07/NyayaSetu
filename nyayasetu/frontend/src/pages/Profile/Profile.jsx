import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Profile() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({ display_name: '', preferred_language: 'english' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch {
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          preferred_language: profile.preferred_language,
          updated_at: new Date()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = (lang) => {
    setProfile({ ...profile, preferred_language: lang });
  };

  if (loading) return null;

  const email = session?.user?.email || '';
  const initial = profile.display_name ? profile.display_name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?');

  return (
    <div className="px-12 py-12 max-w-5xl mx-auto space-y-8 w-full">
      {/* SECTION 1: Identity */}
      <div className="space-y-4">
        <section className="bg-[#0D1117] border border-primary/5 rounded-xl p-8 flex flex-col sm:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative w-24 h-24 min-w-[6rem] rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 rotate-3">
            <span className="font-playfair text-[44px] font-bold text-primary leading-none -rotate-3">{initial}</span>
          </div>
          
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h3 className="font-headline text-3xl font-bold text-white tracking-tight">{profile.display_name || 'User'}</h3>
            <p className="text-sm text-slate-400 font-body flex items-center justify-center sm:justify-start gap-2">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              {email}
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/10 text-[11px] font-label font-semibold text-primary mt-3 uppercase tracking-widest">
              Authorized User
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#0D1117] border border-primary/5 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">settings_suggest</span>
              <h3 className="font-headline text-xl font-semibold text-white">Profile Configuration</h3>
            </div>
            
            <form className="space-y-8" onSubmit={handleUpdate}>
              {/* Field 1 */}
              <div className="space-y-2">
                <label className="block text-[11px] font-label font-bold text-slate-500 uppercase tracking-widest ml-1">Legal Display Name</label>
                <input 
                  type="text" 
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full h-12 bg-[#050810] border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg px-5 text-white font-body text-base transition-all outline-none" 
                />
              </div>

              {/* Field 2 */}
              <div className="space-y-2">
                <label className="block text-[11px] font-label font-bold text-slate-500 uppercase tracking-widest ml-1">Associated Email</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    disabled 
                    className="w-full h-12 bg-white/[0.02] border border-white/5 cursor-not-allowed rounded-lg px-5 text-slate-500 font-body text-base outline-none" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-600">lock</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 italic px-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">info</span> Fixed for verification integrity
                </p>
              </div>

              {/* Field 3 */}
              <div className="space-y-4">
                <label className="block text-[11px] font-label font-bold text-slate-500 uppercase tracking-widest ml-1">Archive Interface Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['english', 'hindi', 'tamil', 'bengali', 'hinglish'].map((lang) => {
                    const isSelected = profile.preferred_language === lang;
                    const labels = {
                      english: { emoji: '🇬🇧', text: 'English' },
                      hindi: { emoji: '🇮🇳', text: 'Hindi' },
                      tamil: { emoji: '🇮🇳', text: 'Tamil' },
                      bengali: { emoji: '🇮🇳', text: 'Bengali' },
                      hinglish: { emoji: '🇮🇳', text: 'Hinglish' },
                    };
                    const langData = labels[lang];

                    return (
                      <button 
                        key={lang}
                        type="button" 
                        onClick={() => setLanguage(lang)}
                        className={isSelected 
                          ? "px-4 py-2.5 rounded-lg text-xs font-label font-bold text-primary bg-primary/10 border-2 border-primary/50 flex items-center justify-center gap-2 shadow-lg shadow-primary/5"
                          : "px-4 py-2.5 rounded-lg text-xs font-label font-semibold text-slate-400 bg-[#050810] border border-white/10 hover:border-primary/40 hover:text-slate-200 transition-all flex items-center justify-center gap-2"
                        }
                      >
                        <span>{langData.emoji}</span> {langData.text}
                        {isSelected && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-on-primary-container font-label font-bold text-base rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">save</span>
                  Commit Changes
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Stats & Danger */}
        <div className="space-y-8">
          {/* Activity Stats */}
          <section className="bg-[#0D1117] border border-primary/5 rounded-xl p-8 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <h3 className="font-headline text-xl font-semibold text-white">Impact Ledger</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="font-playfair text-4xl font-bold text-primary">0</div>
                <div className="text-[10px] font-label text-slate-500 uppercase tracking-[0.2em] mt-2 font-bold">Total Documents</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="font-playfair text-4xl font-bold text-primary">0</div>
                <div className="text-[10px] font-label text-slate-500 uppercase tracking-[0.2em] mt-2 font-bold">Tokens Processed</div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-[#0D1117] border border-error/20 rounded-xl p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-error/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <h3 className="text-[11px] font-label font-bold text-error uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                System Override
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="font-label text-sm text-white font-bold">Terminate Identity</p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">This will purge all archived cases, metadata, and token credits from the sovereign ledger.</p>
                </div>
                <button type="button" className="w-full border border-error/30 text-error hover:bg-error hover:text-background font-label font-bold py-3 rounded-lg text-xs transition-all uppercase tracking-widest">
                  Delete Archive Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
