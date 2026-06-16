import React, { useState } from 'react';
import { Bell, Search, MessageSquare, ChevronRight, ShieldCheck, Zap, Activity, Clock } from 'lucide-react';
import { PageTitle, StatCard, Input, Btn, Modal, EmptyState, StatusBadge } from '../../components/UI';

const DUMMY_NOTIFICATIONS = [
  { id: 1, title: 'Referral Bonus Earned', message: 'Your referral of Michael Johnson has generated a commission of $250. Payout will be processed on the 1st.', isRead: false, createdAt: '2024-10-14T09:00:00Z' },
  { id: 2, title: 'Loan Approval Alert', message: 'A loan application for your client Sarah Williams has been approved by the admin.', isRead: true, createdAt: '2024-10-13T11:30:00Z' },
  { id: 3, title: 'Monthly Summary Ready', message: 'Your performance summary for September 2024 is now available. Total yield: $850.', isRead: true, createdAt: '2024-10-01T08:00:00Z' },
  { id: 4, title: 'System Maintenance', message: 'Scheduled maintenance on Oct 20, 2024 from 12:00 AM - 2:00 AM. Services will be temporarily unavailable.', isRead: false, createdAt: '2024-10-10T07:00:00Z' },
];

export default function AgentNotifications() {
  const [notifications] = useState(DUMMY_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL');

  const filtered = notifications.filter((n) => {
    const matchesSearch =
      (n.message || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.title || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'UNREAD') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <PageTitle 
        title="Signal Terminal" 
        subtitle="System-generated updates, referral milestones, and operational signal alerts" 
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Critical Signals" value={unreadCount} icon={Zap} color="#2563eb" trend="Unread" trendUp={false} />
        <StatCard label="Total Broadcasts" value={notifications.length} icon={Activity} color="#10b981" trend="All Time" />
        <StatCard label="Encryption Active" value="SECURE" icon={ShieldCheck} color="#f59e0b" trend="End-to-End" />
      </section>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
          {[
            { key: 'ALL', label: 'All Signals' },
            { key: 'UNREAD', label: `Unread (${unreadCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterMode(key)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === key ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search signals by keyword or directive..."
            className="pl-12"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Bell}
            title="Silence Observed"
            description="No active signals detected in the specified frequency. Please verify your filter parameters or sync with the grid."
            action={
              <Btn onClick={fetchNotifications}>
                 <RefreshCw size={16} className="mr-2" /> Sync Signal
              </Btn>
            }
          />
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => setViewModal(n)}
              className="premium-card p-6 bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform ${!n.isRead ? 'bg-primary text-white shadow-primary/30' : 'bg-slate-900 text-primary shadow-black/10'}`}>
                    <Bell size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight flex items-center gap-3">
                      {n.title}
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-xl shadow-primary/50" />}
                    </h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70 line-clamp-1 italic italic italic">"{n.message}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 pl-14 md:pl-0">
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-900 uppercase tracking-tight">
                       <Clock size={12} strokeWidth={3} className="text-slate-400" />
                       {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-slate-100">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Signal Alert Protocol">
        {viewModal && (
          <div className="space-y-10">
            <div className="premium-card bg-slate-900 p-10 relative overflow-hidden text-white border-none shadow-2xl text-center">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 backdrop-blur-md flex items-center justify-center text-primary mb-8 animate-in zoom-in duration-500 shadow-2xl">
                    <Bell size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-3 italic text-white">{viewModal.title}</h3>
                  <div className="flex items-center gap-3 px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active System Signal</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payload Directive</label>
               <div className="p-8 premium-card bg-slate-50 border border-slate-100 text-sm font-black text-slate-900 leading-relaxed italic relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  "{viewModal.message}"
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Network Node</p>
                  <p className="text-sm font-black text-slate-900 uppercase">SYS_LOG_{viewModal.id}</p>
               </div>
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Temporal Stamp</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate">{new Date(viewModal.createdAt).toLocaleString()}</p>
               </div>
            </div>

            <Btn variant="outline" onClick={() => setViewModal(null)} className="w-full !h-14 uppercase tracking-widest text-[10px] font-black !rounded-2xl">
               Acknowledge & Close
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
