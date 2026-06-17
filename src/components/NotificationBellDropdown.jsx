import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, MessageSquare, AlertCircle, Info, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: 'New Application', desc: 'Borrower Sarah Williams submitted request for MXN $8,500.', time: '5m ago', unread: true, type: 'info' },
  { id: 2, title: 'Payment Received', desc: 'Repayment of MXN $2,300 processed successfully.', time: '1h ago', unread: true, type: 'success' },
  { id: 3, title: 'KYC Cleared', desc: 'Identity verification cleared for client José Garcia.', time: '3h ago', unread: false, type: 'success' },
  { id: 4, title: 'System Ping', desc: 'Delinquency rate threshold check complete.', time: '1d ago', unread: false, type: 'warning' }
];

export default function NotificationBellDropdown({ role }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(`notifications_${role}`);
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem(`notifications_${role}`, JSON.stringify(notifications));
  }, [notifications, role]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shrink-0"><Check size={14} /></div>;
      case 'warning':
        return <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shrink-0"><AlertCircle size={14} /></div>;
      default:
        return <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/10 shrink-0"><Info size={14} /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 transition-all relative cursor-pointer active:scale-95 ${isOpen ? 'text-primary border-primary/25 bg-slate-50' : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] overflow-hidden animate-fade-in origin-top-right">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-3 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                <button 
                  onClick={markAllAsRead}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
                <button 
                  onClick={clearAll}
                  className="hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={10} /> Clear
                </button>
              </div>
            )}
          </div>

          {/* List content */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                  <Bell size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">All caught up!</p>
                <p className="text-[10px] text-slate-400 leading-normal">You have no active alerts or communication logs.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer relative ${notif.unread ? 'bg-primary/[0.01]' : ''}`}
                >
                  {notif.unread && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className={`text-xs uppercase tracking-tight truncate ${notif.unread ? 'font-black text-slate-800' : 'font-bold text-slate-500'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[8px] font-medium text-slate-400 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal mt-0.5 line-clamp-2 italic">
                      "{notif.desc}"
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer View All link */}
          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
            <Link 
              to={`/${role}/notifications`} 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover inline-flex items-center gap-1"
            >
              View All Communication Logs →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
