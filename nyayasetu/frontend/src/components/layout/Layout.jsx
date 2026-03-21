import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="font-body selection:bg-primary/30 selection:text-primary bg-[#050810] text-[#e0e2ee] min-h-screen flex text-on-surface">
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
