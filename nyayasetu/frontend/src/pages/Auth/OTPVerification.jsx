import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (data.session) {
      toast.success('Successfully logged in!');
      navigate('/');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('New OTP sent!');
      setCountdown(60);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body antialiased overflow-hidden min-h-screen relative">
      <div className="fixed inset-0 z-0 grid grid-cols-12 gap-6 p-8 blur-2xl opacity-40">
        <aside className="col-span-2 bg-surface-container-low h-full rounded-2xl"></aside>
        <main className="col-span-10 flex flex-col gap-6">
          <header className="h-20 bg-surface-container-low rounded-2xl"></header>
          <div className="grid grid-cols-3 gap-6 h-48">
            <div className="bg-surface-container rounded-2xl"></div>
            <div className="bg-surface-container rounded-2xl"></div>
            <div className="bg-surface-container rounded-2xl"></div>
          </div>
          <div className="flex-1 bg-surface-container rounded-2xl"></div>
        </main>
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050810]/80 backdrop-blur-xl px-4">
        <div className="w-full max-w-[400px] bg-[#0D1117] border border-white/5 rounded-[20px] p-8 shadow-2xl relative">
          
          <button 
            onClick={() => navigate('/login')}
            className="absolute top-8 left-8 text-on-surface/40 hover:text-primary transition-colors duration-200"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div className="flex flex-col items-center">
            <h1 className="font-headline font-bold text-[22px] text-on-surface text-center mt-6">
                Check your inbox
            </h1>
            <p className="text-on-surface/50 text-[13px] text-center mt-2">
                We sent a 6-digit code to
            </p>
            <p className="text-primary-container text-[13px] font-medium text-center mb-8">
                {email}
            </p>

            <form className="w-full" onSubmit={handleVerify}>
              <div className="w-full relative group">
                <style dangerouslySetInnerHTML={{__html: `
                  .otp-letter-spacing {
                      letter-spacing: 0.75em;
                      text-indent: 0.75em;
                  }
                `}} />
                <input 
                  className="w-full h-14 bg-[#050810] border border-white/5 rounded-xl text-center text-3xl font-mono otp-letter-spacing text-on-surface placeholder:text-on-surface/10 focus:outline-none focus:border-primary-container/40 focus:ring-1 focus:ring-primary-container/20 transition-all duration-300" 
                  maxLength="6" 
                  placeholder="------" 
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full mt-6 h-11 bg-primary-container/10 border border-primary-container/40 text-primary-container rounded-xl font-body text-sm font-medium hover:bg-primary-container/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
                {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
              </button>
            </form>

            {countdown > 0 ? (
                <p className="text-on-surface/30 text-xs text-center mt-6 font-label tracking-wide">
                    Resend in <span className="font-mono">{countdown}s</span>
                </p>
            ) : (
                <button 
                    onClick={handleResend}
                    disabled={loading}
                    className="text-on-surface-variant/40 hover:text-on-surface-variant/80 font-dmsans text-xs flex items-center gap-1 transition-colors mt-6"
                >
                    Resend Code
                </button>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <span className="font-headline text-sm text-on-surface/20 tracking-widest uppercase">NyayaSetu</span>
          </div>
        </div>
      </div>

      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full z-10 pointer-events-none"></div>
    </div>
  );
}
