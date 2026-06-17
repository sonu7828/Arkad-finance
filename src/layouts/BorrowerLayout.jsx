import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, Bell, User as UserIcon, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSidebarNav from '../components/RoleSidebarNav';
import { useSidebarRoleConfig } from '../hooks/useSidebarRoleConfig';
import NotificationBellDropdown from '../components/NotificationBellDropdown';

export default function BorrowerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { branding } = useSidebarRoleConfig('borrower');

  React.useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTop = 0;
  }, [location.pathname, location.search]);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] z-[60] lg:hidden transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <RoleSidebarNav routeRole="borrower" isCollapsed={false} setIsSidebarCollapsed={setIsSidebarCollapsed} onLinkClick={() => setIsSidebarOpen(false)} onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Desktop Sidebar - Zoho Style Light Sidebar */}
      <aside className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200/60 overflow-hidden transition-all duration-300 ease-in-out z-50 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[230px]'}`}>
        <RoleSidebarNav routeRole="borrower" isCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} onLinkClick={() => {}} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sleek Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">
              <Menu size={18} />
            </button>
            <div className="flex lg:hidden items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Landmark size={18} />
               </div>
               <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">ARKAD <span className="text-primary">FINANCE</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <NotificationBellDropdown role="borrower" />
            </div>

            <Link to={branding.profilePath || '/borrower/profile'} className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-all group border-none">
              <div className="text-right hidden md:block leading-tight">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.name?.split(' ')[0] || 'Borrower'}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-none">Verified Borrower</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white group-hover:bg-primary transition-all">
                <UserIcon size={18} />
              </div>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-8 overflow-y-auto">
          <div className="max-w-[1750px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
