import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/analyze/')) return null; // results page shows the doc name
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/analyze': return 'Analyze Document';
      case '/papers': return 'My Papers';
      case '/profile': return 'Profile';
      default: return '';
    }
  };

  const title = getPageTitle();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#10131c]/80 backdrop-blur-xl border-b border-[#F1F5F9]/10 flex justify-between items-center h-20 px-10">
      <div className="flex items-center gap-4">
        {title && (
          <h2 className="font-headline text-xl font-bold text-[#F1F5F9]">{title}</h2>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">search</span>
          <input
            className="bg-surface-container-highest/70 border-none rounded-full py-2 pl-10 pr-4 text-sm w-56 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/30 text-on-surface outline-none"
            placeholder="Search archive..."
            type="text"
          />
        </div>

        {/* Notification */}
        <button className="text-[#F1F5F9]/60 hover:text-[#FFB693] transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 bg-gradient-to-br from-[#ffb693] to-[#ff6b00] rounded-full flex items-center justify-center text-[#572000] font-headline font-bold text-sm shadow-sm shadow-primary/20">
          P
        </div>
      </div>
    </header>
  );
}
