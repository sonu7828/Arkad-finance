import React, { useState, useMemo } from 'react';
import { 
  Bell, Search, Clock, CheckCircle2, AlertCircle, MessageSquare, Send, 
  History, Radio, RefreshCw, User, RotateCcw, Zap, Mail, Smartphone, Info, Layers, 
  ChevronRight
} from 'lucide-react';
import { StatusBadge, PageTitle, StatCard, Btn, ProTable, Modal, Divider } from '../../components/UI';

const DUMMY_NOTIFS = [
  { id: 'NTF-001', title: 'Payment Reminder', message: 'Your monthly installment of $150 is due tomorrow.', user: { name: 'Alice Wilson', phone: '+1 555-0101' }, type: 'SMS', status: 'SENT', createdAt: new Date().toISOString() },
  { id: 'NTF-002', title: 'Login Alert', message: 'New login detected from a Chrome browser on Windows.', user: { name: 'Bob Thompson', phone: '+1 555-0102' }, type: 'EMAIL', status: 'SENT', createdAt: new Date().toISOString() },
  { id: 'NTF-003', title: 'Collateral Verified', message: 'Your asset "Deed of Commercial Property" has been successfully verified.', user: { name: 'Alice Wilson', phone: '+1 555-0101' }, type: 'SYSTEM', status: 'SENT', createdAt: new Date().toISOString() },
  { id: 'NTF-004', title: 'Urgent: Overdue', message: 'Your payment for loan ref #LN-499 is now 3 days overdue.', user: { name: 'Edward Norton', phone: '+1 555-0105' }, type: 'SMS', status: 'FAILED', createdAt: new Date().toISOString() },
];

export default function AdminNotifications() {
  const [notifications] = useState(DUMMY_NOTIFS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewModal, setViewModal] = useState(null);

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const matchSearch = n.user.name.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'ALL' || n.type === activeTab;
      return matchSearch && matchTab;
    });
  }, [notifications, search, activeTab]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Communication Hub" 
        subtitle="Monitor and track automated notifications across all institutional channels" 
        action={
          <Btn variant="outline" size="md">
             <RotateCcw size={16} className="mr-2" /> Refresh Registry
          </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Transmitted" value={notifications.length} icon={MessageSquare} color="text-primary" />
        <StatCard label="Delivered Node" value={notifications.filter(n => n.status === 'SENT').length} icon={CheckCircle2} color="text-emerald-500" />
        <StatCard label="Dropped Signal" value={notifications.filter(n => n.status === 'FAILED').length} icon={AlertCircle} color="text-rose-500" />
      </section>

      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
           <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Omni Stream', icon: Radio },
                { id: 'SMS', label: 'SMS Nodes', icon: Smartphone },
                { id: 'EMAIL', label: 'Email Nodes', icon: Mail },
                { id: 'SYSTEM', label: 'System Pings', icon: Info },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="relative flex-1 xl:max-w-xs w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                className="premium-input pl-12 h-12"
                placeholder="Search recipient or message..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
        </div>

        <ProTable headers={[
          { label: 'Recipient Entity' },
          { label: 'Signal Payload' },
          { label: 'Channel' },
          { label: 'Registry Date' },
          { label: 'Status' },
          { label: 'Action', className: 'text-right' }
        ]}>
          {filtered.map((n) => (
            <tr key={n.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                       {n.user.name[0]}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-slate-800 transition-colors group-hover:text-primary">{n.user.name}</p>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{n.user.phone}</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[13px] font-bold text-slate-600 line-clamp-1 italic">"{n.message}"</p>
                 <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 block">{n.title}</span>
              </td>
              <td className="px-6 py-5">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <Radio size={10} className="text-primary" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{n.type}</span>
                 </div>
              </td>
              <td className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase">
                 {new Date(n.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-5">
                 <StatusBadge status={n.status} />
              </td>
              <td className="px-6 py-5 text-right">
                 <Btn size="sm" variant="outline" onClick={() => setViewModal(n)}>Analyze Signal</Btn>
              </td>
            </tr>
          ))}
        </ProTable>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Signal Telemetry Analysis">
         {viewModal && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-50" />
                 <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-primary border border-slate-100">
                    <Bell size={24} />
                 </div>
                 <h4 className="text-xl font-bold text-slate-900 tracking-tight">{viewModal.user.name}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Communication Log</p>
                 <div className="mt-6 flex justify-center gap-3">
                    <StatusBadge status={viewModal.status} />
                    <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {viewModal.type} Node
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Signal Payload</h5>
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic font-medium text-slate-800 leading-relaxed text-sm">
                    "{viewModal.message}"
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Protocol ID', value: viewModal.id, icon: Zap, color: 'text-primary' },
                 { label: 'Interaction Date', value: new Date(viewModal.createdAt).toLocaleDateString(), icon: Clock, color: 'text-indigo-500' },
               ].map((item, i) => (
                 <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-2 ${item.color}`}>
                       <item.icon size={18} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-slate-800">{item.value}</p>
                 </div>
               ))}
              </div>

              <Btn className="w-full h-14" onClick={() => setViewModal(null)}>Dismiss Analysis</Btn>
           </div>
         )}
      </Modal>
    </div>
  );
}

