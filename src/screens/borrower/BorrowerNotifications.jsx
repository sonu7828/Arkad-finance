import React, { useState } from 'react';
import { 
  Bell, Search, ChevronRight, ShieldCheck, Globe, Clock, Smartphone, Mail
} from 'lucide-react';
import { PageTitle, StatCard, Modal, EmptyState, StatusBadge } from '../../components/UI';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

const DUMMY_NOTIFICATIONS = [
  { id: 'n1', type: 'SMS', title: 'Payment Received', message: 'Your loan repayment of $1,200 for LN-8801 has been received. Thank you for your timely payment.', isRead: false, createdAt: '2024-10-14T09:00:00Z' },
  { id: 'n2', type: 'EMAIL', title: 'Loan Approved!', message: 'Congratulations! Your loan application LN-8801 has been approved. Funds will be disbursed within 24 hours.', isRead: true, createdAt: '2024-10-13T14:30:00Z' },
  { id: 'n3', type: 'SMS', title: 'Payment Reminder', message: 'Your loan repayment of $1,200 is due in 3 days on Oct 25, 2024. Please ensure your account is funded.', isRead: true, createdAt: '2024-10-22T08:00:00Z' },
  { id: 'n4', type: 'EMAIL', title: 'Profile Verified', message: 'Your identity documents have been successfully verified. Your account is now fully activated.', isRead: false, createdAt: '2024-10-10T11:00:00Z' },
];

export default function BorrowerNotifications() {
  const [notifications] = useState(DUMMY_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);

  const filtered = notifications.filter((n) =>
    (n.message || '').toLowerCase().includes(search.toLowerCase()) ||
    (n.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Notifications" 
        subtitle="Stay updated with real-time alerts regarding your loan status, payments, and system announcements." 
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Unread" value={unreadCount} icon={Bell} color="text-primary" />
        <StatCard label="Total History" value={notifications.length} icon={Clock} color="text-slate-900" />
        <StatCard label="Connectivity" value="Active" icon={Globe} color="text-emerald-500" />
      </section>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
           <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Notification Feed</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Recent updates and system alerts</p>
           </div>
           <div className="relative w-full md:w-80 group">
             <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
             <input
               className="premium-input pl-12 h-11"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search notifications..."
             />
           </div>
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => setViewModal(n)}
                className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-primary/20 hover:shadow-md transition-all gap-4 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-6 transition-all ${n.type === 'SMS' ? 'bg-slate-900 text-white' : 'bg-primary text-white'}`}>
                    {n.type === 'SMS' ? <Smartphone size={22} /> : <Mail size={22} />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors flex items-center gap-3">
                      {n.title}
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 italic">{n.message}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-5 relative z-10">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 uppercase block">{formatDateDDMMYYYY(n.createdAt)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${n.type === 'SMS' ? 'bg-slate-50 text-slate-500' : 'bg-primary/5 text-primary'}`}>
                    {n.type}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState 
              icon={Bell}
              title="No Notifications Found"
              description="Your notification feed is currently clear. We will notify you when something important happens."
            />
          )}
        </div>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Notification Details">
        {viewModal && (
          <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-3xl relative overflow-hidden text-white text-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-white text-slate-900 flex items-center justify-center mx-auto shadow-xl rotate-3">
                  {viewModal.type === 'SMS' ? <Smartphone size={32} /> : <Mail size={32} />}
                </div>
                <div>
                   <h3 className="text-2xl font-bold uppercase tracking-tight leading-tight text-white">{viewModal.title}</h3>
                   <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-3">{viewModal.type} ALERT</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
               <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</p>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-sm font-bold text-slate-600 leading-relaxed italic">
                    "{viewModal.message}"
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Channel', value: viewModal.type === 'SMS' ? 'Mobile SMS' : 'Email Alert' },
                   { label: 'Reference', value: `#NOT-${viewModal.id}` },
                   { label: 'Date & Time', value: `${formatDateDDMMYYYY(viewModal.createdAt)} ${new Date(viewModal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` },
                   { label: 'Status', value: 'DELIVERED' },
                 ].map((item, i) => (
                   <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                     <p className="text-sm font-bold text-slate-800">{item.value}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setViewModal(null)} className="text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:text-slate-800 transition-colors flex items-center gap-2">
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
