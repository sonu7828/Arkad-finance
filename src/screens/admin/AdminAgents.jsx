import React, { useState, useMemo } from 'react';
import { 
  Users, Search, ShieldCheck, UserPlus, Trash2, Activity, Plus, Globe, Mail, 
  Phone, Briefcase, CheckCircle2, TrendingUp, Percent, Database, ChevronRight, 
  ShieldAlert, Zap, LayoutGrid, Download, Wallet, UserCheck
} from 'lucide-react';
import { StatusBadge, Btn, PageTitle, StatCard, Input, Select, ProTable, Modal, FormField, Divider } from '../../components/UI';

const DUMMY_AGENTS = [
  { id: 'AG-101', name: 'John Smith', email: 'john@agents.com', phone: '+1 333 444 5555', isApproved: true, activeLoans: 12, totalEarned: 4500, address: 'New York, USA' },
  { id: 'AG-102', name: 'Sarah Miller', email: 'sarah@agents.com', phone: '+1 333 444 5556', isApproved: true, activeLoans: 8, totalEarned: 2800, address: 'London, UK' },
  { id: 'AG-103', name: 'David Brown', email: 'david@agents.com', phone: '+1 333 444 5557', isApproved: false, activeLoans: 0, totalEarned: 0, address: 'Sydney, AU' },
  { id: 'AG-104', name: 'Emily White', email: 'emily@agents.com', phone: '+1 333 444 5558', isApproved: true, activeLoans: 25, totalEarned: 9200, address: 'Toronto, CA' },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AdminAgents() {
  const [agents, setAgents] = useState(DUMMY_AGENTS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutModal, setPayoutModal] = useState(null);
  const [payoutData, setPayoutData] = useState({ amount: '', method: 'BANK', trxId: '' });

  const [filterType, setFilterType] = useState('ALL');

  const filtered = useMemo(() => {
    return agents.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = 
        filterType === 'ALL' ? true :
        filterType === 'DIRECT' ? a.activeLoans > 0 :
        filterType === 'EARNED' ? a.totalEarned > 0 : true;
      return matchesSearch && matchesFilter;
    });
  }, [agents, search, filterType]);

  const handleAddAgent = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newAgent = { ...form, id: `AG-${101 + agents.length}`, isApproved: true, activeLoans: 0, totalEarned: 0 };
      setAgents([newAgent, ...agents]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setForm({ name: '', email: '', phone: '', address: '' });
    }, 1000);
  };

  const handlePayout = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === payoutModal.id ? {...a, totalEarned: a.totalEarned - payoutData.amount} : a));
      setIsSubmitting(false);
      setPayoutModal(null);
    }, 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Partner Network" 
        subtitle="Manage acquisition agents and institutional commission payouts" 
        action={
           <Btn size="md" onClick={() => setIsModalOpen(true)}>
              <UserPlus size={16} className="mr-2" /> Register New Agent
           </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setFilterType('ALL')}
          className={`pro-card p-6 text-left transition-all ${filterType === 'ALL' ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-white'}`}
        >
          <StatCard label="Total Partners" value={agents.length} icon={Briefcase} color="text-primary" />
        </button>
        <button 
          onClick={() => setFilterType('DIRECT')}
          className={`pro-card p-6 text-left transition-all ${filterType === 'DIRECT' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5' : 'bg-white'}`}
        >
          <StatCard label="Direct Referrals" value={agents.reduce((s, a) => s + a.activeLoans, 0)} icon={UserCheck} color="text-emerald-500" />
        </button>
        <button 
          onClick={() => setFilterType('EARNED')}
          className={`pro-card p-6 text-left transition-all ${filterType === 'EARNED' ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/5' : 'bg-white'}`}
        >
          <StatCard label="Settled Commissions" value={formatMoney(agents.reduce((s, a) => s + a.totalEarned, 0))} icon={TrendingUp} color="text-indigo-400" />
        </button>
      </section>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
             <h3 className="text-xl font-bold text-slate-800 tracking-tight">Agent Registry</h3>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified partner nodes in the network</p>
          </div>
          <div className="w-full md:w-80 relative group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
             <input 
                className="premium-input pl-12 h-12"
                placeholder="Search agent name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
          </div>
        </div>

        <ProTable headers={[
          { label: 'Partner Identity' },
          { label: 'Performance' },
          { label: 'Balance' },
          { label: 'Status' },
          { label: 'Action', className: 'text-right' }
        ]}>
          {filtered.map((a) => (
            <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                       {a.name[0]}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-slate-800 transition-colors group-hover:text-primary">{a.name}</p>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{a.email}</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5">{a.activeLoans} Active Contracts</p>
                 <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(a.activeLoans * 5, 100)}%` }} />
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[13px] font-bold text-slate-900">{formatMoney(a.totalEarned)}</p>
              </td>
              <td className="px-6 py-5">
                 <StatusBadge status={a.isApproved ? 'verified' : 'pending'} />
              </td>
              <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                 <Btn variant="outline" size="sm" onClick={() => { setPayoutModal(a); setPayoutData({...payoutData, amount: a.totalEarned}); }}>Payout</Btn>
                 <Btn size="sm" onClick={() => setViewModal(a)}>Record</Btn>
              </td>
            </tr>
          ))}
        </ProTable>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Partner Profile">
        {viewModal && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-50" />
               <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-900 font-bold text-2xl border border-slate-100 uppercase">
                  {viewModal.name[0]}
               </div>
               <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{viewModal.name}</h4>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{viewModal.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Net Performance</p>
                   <p className="text-xs font-bold text-slate-800">{viewModal.activeLoans} Refers</p>
               </div>
               <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Commission Dues</p>
                   <p className="text-xs font-bold text-emerald-600">{formatMoney(viewModal.totalEarned)}</p>
               </div>
            </div>

            <Divider text="Contact Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <Phone size={18} />
                  </div>
                  <div className="overflow-hidden">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                     <p className="text-xs font-bold text-slate-800 truncate">{viewModal.phone}</p>
                  </div>
               </div>
               <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <Globe size={18} />
                  </div>
                  <div className="overflow-hidden">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office</p>
                     <p className="text-xs font-bold text-slate-800 truncate">{viewModal.address}</p>
                  </div>
               </div>
            </div>

            <Btn variant="outline" className="w-full h-14" onClick={() => setViewModal(null)}>Close Database Entry</Btn>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Partner Agent">
         <form onSubmit={handleAddAgent} className="space-y-6">
            <FormField label="Full Name">
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Agent Legal Name" required />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
               <FormField label="Email Registry">
                 <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="agent@network.com" required />
               </FormField>
               <FormField label="Contact Phone">
                 <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+..." required />
               </FormField>
            </div>
            <FormField label="Assigned Territory">
               <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Operations region" />
            </FormField>
            <div className="pt-2 flex gap-4">
               <Btn type="submit" loading={isSubmitting} className="flex-[2] h-14">Authorize Partner</Btn>
               <Btn variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14">Cancel</Btn>
            </div>
         </form>
      </Modal>

      <Modal isOpen={!!payoutModal} onClose={() => setPayoutModal(null)} title="Authorize Payout">
        {payoutModal && (
          <form onSubmit={handlePayout} className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="p-10 bg-slate-900 rounded-[32px] text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
               <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Net Payout Amount</p>
               <h4 className="text-5xl font-extrabold text-white tracking-tight italic">
                  {formatMoney(payoutModal.totalEarned)}
               </h4>
               <div className="mt-6 flex justify-center">
                  <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                     Payable to: {payoutModal.name}
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <FormField label="Disbursement Method">
                  <select value={payoutData.method} onChange={e => setPayoutData({ ...payoutData, method: e.target.value })} className="premium-input h-12 appearance-none text-[11px] font-bold uppercase tracking-widest">
                     <option value="BANK">Institutional Bank Wire</option>
                     <option value="MOBILE">Digital Mobile Wallet</option>
                     <option value="CASH">Physical Cash Payout</option>
                  </select>
               </FormField>
               <FormField label="Transaction Registry ID">
                  <Input value={payoutData.trxId} onChange={e => setPayoutData({ ...payoutData, trxId: e.target.value })} placeholder="REF-NET-XXXXXX" required />
               </FormField>
            </div>

            <div className="flex gap-4 pt-2">
               <Btn variant="outline" type="button" className="flex-1 h-14" onClick={() => setPayoutModal(null)}>Abort</Btn>
               <Btn type="submit" loading={isSubmitting} className="flex-[2] h-14 !bg-emerald-600 hover:!bg-emerald-700">Release Funds</Btn>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}


