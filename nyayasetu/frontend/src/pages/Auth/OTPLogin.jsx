import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OTPLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('OTP sent to your email!');
      // Navigate to verification and pass the email string via state
      navigate('/verify', { state: { email } });
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen overflow-hidden relative">
      <main aria-hidden="true" className="fixed inset-0 p-8 grid grid-cols-12 gap-6 opacity-30 blur-md pointer-events-none">
        <aside className="col-span-2 bg-[#080D1A] rounded-2xl h-full"></aside>
        <div className="col-span-10 flex flex-col gap-6">
          <header className="h-20 bg-surface-container-low rounded-2xl w-full"></header>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-48 bg-surface-container rounded-2xl"></div>
            <div className="h-48 bg-surface-container rounded-2xl"></div>
            <div className="h-48 bg-surface-container rounded-2xl"></div>
          </div>
          <div className="h-full bg-surface-container-low rounded-2xl w-full"></div>
        </div>
      </main>

      {/* Authentication Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050810]/80 backdrop-blur-xl px-4">
        <div className="w-full max-w-[400px] bg-[#0D1117] border border-white/5 rounded-[20px] p-8 shadow-2xl transition-all duration-300">
          <div className="flex flex-col items-center">
            <div aria-label="Scales of Justice" className="text-[36px] leading-none mb-4" role="img">⚖️</div>
            <h1 className="font-playfair text-[22px] font-bold text-on-surface tracking-tight text-center">
                Welcome to NyayaSetu
            </h1>
            <p className="font-dmsans text-[13px] text-on-surface-variant/60 text-center mt-2 mb-8 leading-relaxed max-w-[280px]">
                Sign in to save your analyses and access history
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div className="relative group">
              <input 
                className="w-full h-11 bg-[#050810] border border-white/5 rounded-xl px-4 text-on-surface font-dmsans text-sm placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200" 
                placeholder="your@email.com" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              className="w-full h-11 bg-primary/10 border border-primary/40 text-primary-container rounded-xl font-dmsans text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/20 hover:border-primary/60 active:scale-[0.98] transition-all duration-200 disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
                {loading ? 'Sending...' : 'Send OTP'}
                {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <button 
              type="button"
              onClick={() => {
                localStorage.setItem('guestMode', 'true');
                navigate('/');
              }}
              className="text-on-surface-variant/40 hover:text-on-surface-variant/80 font-dmsans text-xs flex items-center gap-1 transition-colors group"
            >
                Continue as guest 
                <span className="material-symbols-outlined text-[14px] opacity-40 group-hover:opacity-100 transition-opacity">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Background Decoration Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
}
