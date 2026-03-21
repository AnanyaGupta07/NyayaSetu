import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('guestMode');
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/login');
    }
  };

  const navItems = [
    { to: '/', end: true, icon: 'dashboard', label: 'Dashboard' },
    { to: '/papers', end: false, icon: 'description', label: 'My Papers' },
    { to: '/analyze', end: false, icon: 'analytics', label: 'Analyze' },
    { to: '/profile', end: false, icon: 'person_outline', label: 'Profile' },
  ];

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-[#080D1A] shadow-[32px_0_32px_-4px_rgba(0,0,0,0.08)] flex flex-col py-8 z-[60]">
      {/* Brand */}
      <div className="px-6 mb-10">
        <h1 className="text-2xl font-headline italic text-[#FFB693] tracking-tight">NyayaSetu</h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F1F5F9]/40 mt-1">Decode Indian Law</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, end, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 rounded-lg text-[#FFB693] font-bold border-r-2 border-[#FF6B00] bg-white/5 transition-all'
                : 'flex items-center gap-3 px-4 py-3 rounded-lg text-[#F1F5F9]/60 hover:text-[#F1F5F9] hover:bg-[#181C24]/50 transition-colors duration-300'
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="font-label text-sm tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="mt-auto px-4 pt-8 border-t border-[#F1F5F9]/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-[#F1F5F9]/50 hover:text-[#F1F5F9]/80 transition-colors w-full"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="font-label text-xs tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
