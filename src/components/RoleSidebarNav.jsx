import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ChevronLeft, ChevronRight, Landmark, X } from 'lucide-react';
import { useAuth, normalizeRole } from '../context/AuthContext';
import { getSidebarConfigForRole } from '../config/sidebarMenus';
import { pathStringToTo, isSidebarItemActive } from '../utils/navActive';

export default function RoleSidebarNav({
  routeRole,
  isCollapsed,
  setIsSidebarCollapsed,
  onLinkClick,
  onClose,
}) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const effectiveRole = useMemo(() => {
    const fromAuth = normalizeRole(user?.role);
    const fromLs = normalizeRole(localStorage.getItem('role'));
    const fromRoute = normalizeRole(routeRole);
    return fromAuth || fromLs || fromRoute;
  }, [user?.role, routeRole]);

  const config = useMemo(() => {
    return getSidebarConfigForRole(effectiveRole) || getSidebarConfigForRole(routeRole);
  }, [effectiveRole, routeRole]);

  const nav = useMemo(() => config?.nav || [], [config]);
  const branding = config?.branding || {};
  const allPaths = useMemo(() => nav.map((item) => item.path), [nav]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/60 relative z-10">
      {/* Branding Area */}
      <div className={`px-5 py-4 flex items-center gap-3 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
           <Landmark size={20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-black text-slate-900 tracking-tighter leading-none uppercase italic">ARKAD<span className="text-primary">FINANCE</span></h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{branding.subtitle || 'Management'}</p>
          </div>
        )}
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto px-3.5 py-3 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!isCollapsed && (
          <p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">
            Navigation Menu
          </p>
        )}
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isSidebarItemActive(location, item.path, allPaths);
          return (
            <Link
              key={item.key}
              to={pathStringToTo(item.path)}
              onClick={onLinkClick}
              title={isCollapsed ? item.label : ''}
              className={`sidebar-link group ${
                isCollapsed ? 'w-12 h-12 justify-center' : ''
              } ${
                active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
              }`}
            >
              <div className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary'}`}>
                <Icon size={isCollapsed ? 20 : 17} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {active && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Control */}
      <div className={`p-4 space-y-2 border-t border-slate-100`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 rounded-lg font-bold text-[13px] text-rose-500 hover:bg-rose-50 transition-all ${
            isCollapsed ? 'w-10 h-10 justify-center' : 'px-3.5 py-2'
          }`}
        >
          <LogOut size={isCollapsed ? 20 : 17} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {!isCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 w-full rounded-lg text-slate-400 hover:text-slate-600 transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            <ChevronLeft size={14} />
            <span>Collapse</span>
          </button>
        )}
        
        {isCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-primary transition-all"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
