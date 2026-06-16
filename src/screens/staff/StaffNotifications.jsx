import React, { useState } from 'react';
import { Bell, Search, MessageSquare, Clock, ChevronRight, ShieldCheck, Smartphone, CheckCircle2, Mail } from 'lucide-react';
import { PageTitle, StatCard } from '../../components/UI';
import Modal from '../../components/Modal';

const DUMMY_NOTIFICATIONS = [
  { id: 1, type: 'SMS', user: { name: 'Michael Johnson', email: 'michael@email.com', phone: '+260971001122' }, message: 'Your loan repayment of $1,200 has been received. Thank you.', createdAt: '2024-10-14T08:30:00Z' },
  { id: 2, type: 'EMAIL', user: { name: 'Sarah Williams', email: 'sarah@email.com', phone: '+260971001133' }, message: 'Loan approval confirmation for LN-8802. Disbursement in progress.', createdAt: '2024-10-15T10:00:00Z' },
  { id: 3, type: 'SYSTEM', user: { name: 'System Auto', email: 'system@loanpro.io', phone: null }, message: 'Daily batch: 3 pending payment verifications require staff review.', createdAt: '2024-10-15T07:00:00Z' },
  { id: 4, type: 'SMS', user: { name: 'Emma Thompson', email: 'emma@email.com', phone: '+260971001155' }, message: 'Reminder: Your payment of $710 is due in 3 days on the 1st.', createdAt: '2024-10-13T09:15:00Z' },
  { id: 5, type: 'EMAIL', user: { name: 'James Wilson', email: 'james@email.com', phone: '+260971001166' }, message: 'Your loan application LN-8805 has been submitted and is under review.', createdAt: '2024-10-16T11:30:00Z' },
  { id: 6, type: 'SYSTEM', user: { name: 'System Auto', email: 'system@loanpro.io', phone: null }, message: 'Risk alert: Borrower David Brown has 13 days overdue. Action required.', createdAt: '2024-10-12T06:00:00Z' },
];

const getIcon = (type) => {
  switch (type) {
    case 'SMS': return <Smartphone size={18} />;
    case 'EMAIL': return <Mail size={18} />;
    default: return <Bell size={18} />;
  }
};

export default function StaffNotifications() {
  const [notifications] = useState(DUMMY_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  const filtered = notifications.filter(n => {
    const searchLow = search.toLowerCase();
    const matchesSearch = !searchLow ||
      (n.user?.name || '').toLowerCase().includes(searchLow) ||
      (n.message || '').toLowerCase().includes(searchLow);
    const matchesTab = activeTab === 'ALL' || (n.type || '').toUpperCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageTitle title="Communication Logs" subtitle="Monitor automated and manual notifications across the platform." />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="SMS Logs" value={notifications.filter(n => n.type === 'SMS').length} icon={Smartphone} color="text-primary" />
        <StatCard label="Email Logs" value={notifications.filter(n => n.type === 'EMAIL').length} icon={Mail} color="text-emerald-500" />
        <StatCard label="System Alerts" value={notifications.filter(n => n.type === 'SYSTEM').length} icon={MessageSquare} color="text-violet-500" />
        <StatCard label="Monitoring" value="Active" icon={ShieldCheck} color="text-slate-900" />
      </section>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex gap-1 w-full md:w-auto">
          {['SMS', 'EMAIL', 'SYSTEM', 'ALL'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
            >{tab}</button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="premium-input pl-12 h-11" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Bell size={32} className="mb-4 text-slate-200" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No notifications found</p>
          </div>
        ) : filtered.map(n => (
          <div key={n.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between group hover:border-primary/20 hover:shadow-md transition-all gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center border border-slate-100 transition-all">
                {getIcon(n.type)}
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{n.user?.name || 'System Auto'}</h4>
                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{n.user?.email}</p>
                <p className="text-xs text-slate-500 font-bold line-clamp-1">{n.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${n.type === 'SMS' ? 'bg-primary/5 text-primary' : n.type === 'EMAIL' ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-violet-600'}`}>
                  {n.type}
                </div>
                <button onClick={(e) => { e.stopPropagation(); setViewModal(n); }} className="bg-transparent border-none cursor-pointer p-0">
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Notification Details">
        {viewModal && (
          <div className="space-y-6 pb-4">
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                {getIcon(viewModal.type)}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{viewModal.user?.name || 'System'}</h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{viewModal.user?.phone || 'Automated Protocol'}</p>
            </div>

            <div className="p-6 bg-white border border-slate-100 rounded-2xl space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">Message Content</h4>
              <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 italic">"{viewModal.message}"</p>
              <div className="flex justify-between items-center px-1">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                  <p className="text-sm font-bold text-slate-800">{viewModal.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reference</p>
                  <p className="text-sm font-bold text-slate-800">ID: #{viewModal.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setViewModal(null)} className="px-6 py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-800 transition-all border-none cursor-pointer bg-transparent">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
