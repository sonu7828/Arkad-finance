import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, Search, ShieldCheck, UserPlus, Trash2, Activity, Plus, Globe, Mail, 
  Phone, Briefcase, CheckCircle2, TrendingUp, Percent, Database, ChevronRight, 
  ShieldAlert, Zap, LayoutGrid, Download, Wallet, UserCheck
} from 'lucide-react';
import { StatusBadge, Btn, PageTitle, StatCard, Input, Select, ProTable, Modal, FormField, Divider } from '../../components/UI';
import { useLoans } from '../../context/LoanContext';

const DUMMY_AGENTS = [
  { id: 'AG-2024-1001', name: 'Carlos', email: 'carlos@agents.com', phone: '+1 333 444 5001', isApproved: true, commissionRate: 10, status: 'active', activeLoans: 12, thisMonthEarned: 320, pendingCommission: 145, totalEarned: 2840, address: 'Mexico City, MX' },
  { id: 'AG-2024-1002', name: 'Juan', email: 'juan@agents.com', phone: '+1 333 444 5002', isApproved: true, commissionRate: 10, status: 'active', activeLoans: 8, thisMonthEarned: 210, pendingCommission: 95, totalEarned: 1680, address: 'Guadalajara, MX' },
  { id: 'AG-2024-1003', name: 'Sofia', email: 'sofia@agents.com', phone: '+1 333 444 5003', isApproved: true, commissionRate: 10, status: 'active', activeLoans: 15, thisMonthEarned: 480, pendingCommission: 220, totalEarned: 3200, address: 'Monterrey, MX' },
];

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminAgents() {
  const { loans } = useLoans();
  const [agents, setAgents] = useState(DUMMY_AGENTS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'commissions'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', commissionRate: 10 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutModal, setPayoutModal] = useState(null);
  const [payoutData, setPayoutData] = useState({ amount: '', method: 'BANK', trxId: '' });
  const [isBulkPayoutModalOpen, setIsBulkPayoutModalOpen] = useState(false);
  const [bulkPayoutData, setBulkPayoutData] = useState({ method: 'BANK', trxId: '' });
  const [toastMsg, setToastMsg] = useState('');

  const [filterType, setFilterType] = useState('ALL');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = useMemo(() => {
    return agents.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
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
      const uniqueCode = `AG-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      const newAgent = { 
        ...form, 
        id: uniqueCode, 
        isApproved: true, 
        status: 'active', 
        activeLoans: 0, 
        thisMonthEarned: 0,
        pendingCommission: 0,
        totalEarned: 0 
      };
      setAgents([newAgent, ...agents]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setForm({ name: '', email: '', phone: '', address: '', commissionRate: 10 });
      showToast(`Agent registered successfully with code ${uniqueCode}`);
    }, 1000);
  };

  const handleToggleAgentStatus = (id) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a;
      const newStatus = a.status === 'suspended' ? 'active' : 'suspended';
      showToast(`Agent ${a.name} has been ${newStatus === 'suspended' ? 'SUSPENDED' : 'ACTIVATED'}.`);
      return { ...a, status: newStatus };
    }));
  };

  const handlePayout = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === payoutModal.id ? {...a, pendingCommission: Math.max(0, Number(a.pendingCommission || 0) - parseFloat(payoutData.amount || 0)), totalEarned: a.totalEarned + parseFloat(payoutData.amount || 0)} : a));
      setIsSubmitting(false);
      setPayoutModal(null);
      showToast('Payout recorded successfully.');
    }, 1000);
  };

  const handleBulkPayout = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const totalPending = agents.reduce((sum, a) => sum + (a.status === 'active' ? Number(a.pendingCommission || 0) : 0), 0);
      
      setAgents(prev => prev.map(a => {
        if (a.status !== 'active') return a;
        const pending = Number(a.pendingCommission || 0);
        return {
          ...a,
          totalEarned: a.totalEarned + pending,
          pendingCommission: 0
        };
      }));
      
      setIsSubmitting(false);
      setIsBulkPayoutModalOpen(false);
      showToast(`Monthly payout of ${formatMoney(totalPending)} processed & recorded PAID.`);
    }, 1200);
  };

  // Get referred loans for details view
  const referredLoansList = useMemo(() => {
    if (!viewModal) return [];
    return loans.filter(l => 
      l.agent === viewModal.id || 
      (l.agent && typeof l.agent === 'object' && l.agent.id === viewModal.id) ||
      (l.agent && typeof l.agent === 'string' && l.agent.toLowerCase().includes(viewModal.name.toLowerCase()))
    );
  }, [viewModal, loans]);

  // Track calculated total earnings dynamically
  const dynamicEarnings = useMemo(() => {
    if (!viewModal) return 0;
    return referredLoansList.reduce((sum, l) => {
      const commRate = l.agentCommission || viewModal.commissionRate || 10;
      return sum + (Number(l.principalAmount || 0) * (Number(commRate) / 100));
    }, 0);
  }, [viewModal, referredLoansList]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Agent Partner Network" 
        subtitle="Manage acquisition agents, commission percentages, referred loans, and payouts" 
        action={
           <div className="flex gap-3">
             {activeTab === 'commissions' && (
               <Btn size="md" className="!bg-emerald-600 hover:!bg-emerald-700 shadow-lg shadow-emerald-600/10" onClick={() => setIsBulkPayoutModalOpen(true)} disabled={agents.reduce((sum, a) => sum + (a.status === 'active' ? Number(a.pendingCommission || 0) : 0), 0) === 0}>
                 <Wallet size={16} className="mr-2" /> Process Monthly Payout
               </Btn>
             )}
             <Btn size="md" onClick={() => setIsModalOpen(true)}>
                <UserPlus size={16} className="mr-2" /> Register New Agent
             </Btn>
           </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-100 pb-1">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'directory' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Agent Directory
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'commissions' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Commission Management
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
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
                    placeholder="Search agent name or code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                 />
              </div>
            </div>

            <ProTable headers={[
              { label: 'Partner Identity' },
              { label: 'Agent Code' },
              { label: 'Commission Rate' },
              { label: 'Status' },
              { label: 'Balance' },
              { label: 'Action & Controls', className: 'text-right' }
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
                           <p className="text-[10px] font-bold text-slate-300 mt-0.5">{a.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{a.id}</span>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[13px] font-extrabold text-slate-900">{a.commissionRate || 10}%</p>
                  </td>
                  <td className="px-6 py-5">
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                       a.status === 'suspended' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                     }`}>
                       {a.status === 'suspended' ? 'Suspended' : 'Active'}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[13px] font-bold text-slate-900">{formatMoney(a.totalEarned)}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Btn variant="outline" size="sm" className="!py-1.5 !px-3 text-[9px]" onClick={() => { setPayoutModal(a); setPayoutData({...payoutData, amount: a.pendingCommission || a.totalEarned}); }}>Payout</Btn>
                      <Btn size="sm" className="!py-1.5 !px-3 text-[9px]" onClick={() => setViewModal(a)}>Profile</Btn>
                      <Btn 
                        variant={a.status === 'suspended' ? 'success' : 'danger'} 
                        size="sm" 
                        className="!py-1.5 !px-3 text-[9px]" 
                        onClick={() => handleToggleAgentStatus(a.id)}
                      >
                        {a.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </ProTable>
          </div>
        </>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pro-card p-6 bg-white">
              <StatCard label="Total Active Partners" value={agents.filter(a => a.status === 'active').length} icon={Users} color="text-primary" />
            </div>
            <div className="pro-card p-6 bg-white">
              <StatCard label="This Month Commission" value={formatMoney(agents.reduce((s, a) => s + (a.thisMonthEarned || 0), 0))} icon={TrendingUp} color="text-indigo-500" />
            </div>
            <div className="pro-card p-6 bg-white ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5">
              <StatCard label="Total Pending Payouts" value={formatMoney(agents.reduce((s, a) => s + (a.status === 'active' ? Number(a.pendingCommission || 0) : 0), 0))} icon={Wallet} color="text-emerald-600" />
            </div>
          </section>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
              <div className="space-y-1">
                 <h3 className="text-xl font-bold text-slate-800 tracking-tight">Commission Ledger</h3>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time yields, pending payouts & all-time totals</p>
              </div>
              <div className="flex items-center gap-3">
                 <Btn 
                   variant="success" 
                   size="md"
                   className="shadow-lg shadow-emerald-600/10 italic font-black uppercase tracking-widest text-[9px] rounded-xl h-12 px-6"
                   onClick={() => setIsBulkPayoutModalOpen(true)}
                   disabled={agents.reduce((sum, a) => sum + (a.status === 'active' ? Number(a.pendingCommission || 0) : 0), 0) === 0}
                 >
                   <Wallet size={14} className="mr-2" /> Process Monthly Payout
                 </Btn>
              </div>
            </div>

            <ProTable headers={[
              { label: 'Agent Partner' },
              { label: 'Referred Clients' },
              { label: 'Commission Rate' },
              { label: 'This Month' },
              { label: 'Pending Payout' },
              { label: 'All-Time Paid' },
              { label: 'Registry Action', className: 'text-right' }
            ]}>
              {agents.map((a) => (
                <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                           {a.name[0]}
                        </div>
                        <div>
                           <p className="text-[13px] font-bold text-slate-800 group-hover:text-primary transition-all">{a.name}</p>
                           <p className="font-mono text-[10px] text-slate-400 mt-0.5">{a.id}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[13px] font-extrabold text-slate-900">{a.activeLoans || 0} clients</p>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[13px] font-extrabold text-slate-900">{a.commissionRate || 10}%</p>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[13px] font-bold text-indigo-600">{formatMoney(a.thisMonthEarned || 0)}</p>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[13px] font-extrabold text-amber-600">{formatMoney(a.pendingCommission || 0)}</p>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[13px] font-bold text-emerald-600">{formatMoney(a.totalEarned || 0)}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <Btn 
                       variant="outline" 
                       size="sm" 
                       className="!py-1.5 !px-3 text-[9px]"
                       disabled={!(a.pendingCommission > 0)}
                       onClick={() => { setPayoutModal(a); setPayoutData({...payoutData, amount: a.pendingCommission}); }}
                     >
                       Disburse
                     </Btn>
                  </td>
                </tr>
              ))}
            </ProTable>
          </div>
        </>
      )}

      {/* AGENT PROFILE & REFERRED LOANS MODAL */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Partner Profile & Earnings">
        {viewModal && (
          <div className="space-y-6 text-left">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
               <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-900 font-bold text-2xl border border-slate-100 uppercase">
                  {viewModal.name[0]}
               </div>
               <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{viewModal.name}</h4>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{viewModal.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 font-bold text-slate-700">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Commission Balance</p>
                   <p className="text-sm font-extrabold text-emerald-600">{formatMoney(viewModal.totalEarned)}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Total Estimated Earnings</p>
                   <p className="text-sm font-extrabold text-indigo-500">{formatMoney(dynamicEarnings || viewModal.totalEarned * 1.2)}</p>
               </div>
            </div>

            {/* REFERRED LOANS LIST */}
            <div className="space-y-3">
              <Divider text="Agent Referred Credit Contracts" />
              
              {referredLoansList.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase">No Referred Loans Registered Under This Agent</p>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-inner max-h-[200px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="p-3">Borrower</th>
                        <th className="p-3">Capital</th>
                        <th className="p-3">Commission Owed</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-700">
                      {referredLoansList.map(loan => {
                        const commRate = loan.agentCommission || viewModal.commissionRate || 10;
                        const commOwed = (loan.principalAmount * commRate) / 100;
                        return (
                          <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 text-slate-950">{loan.user?.name || 'N/A'}</td>
                            <td className="p-3">${loan.principalAmount.toLocaleString()}</td>
                            <td className="p-3 text-emerald-600">${commOwed.toLocaleString()} ({commRate}%)</td>
                            <td className="p-3">
                              <span className="uppercase text-[8px] font-black">{loan.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <Btn variant="outline" className="w-full h-14" onClick={() => setViewModal(null)}>Close Database Entry</Btn>
          </div>
        )}
      </Modal>

      {/* REGISTER NEW AGENT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Partner Agent">
         <form onSubmit={handleAddAgent} className="space-y-6 text-left">
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
            <div className="grid grid-cols-2 gap-4">
               <FormField label="Assigned Territory">
                  <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Operations region" />
               </FormField>
               <FormField label="Commission Rate (%)">
                  <Input type="number" value={form.commissionRate} onChange={e => setForm({...form, commissionRate: parseInt(e.target.value) || 10})} placeholder="10" />
               </FormField>
            </div>
            <div className="pt-2 flex gap-4">
               <Btn type="submit" loading={isSubmitting} className="flex-[2] h-14">Authorize Partner</Btn>
               <Btn variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14">Cancel</Btn>
            </div>
         </form>
      </Modal>

      {/* PAYOUT FUNDS MODAL */}
      <Modal isOpen={!!payoutModal} onClose={() => setPayoutModal(null)} title="Authorize Payout">
        {payoutModal && (
          <form onSubmit={handlePayout} className="space-y-8 animate-in slide-in-from-bottom-4 text-left">
            <div className="p-10 bg-slate-900 rounded-[32px] text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
               <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Net Payout Amount</p>
               <h4 className="text-5xl font-extrabold text-white tracking-tight italic">
                  {formatMoney(payoutData.amount || payoutModal.pendingCommission || 0)}
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

      {/* BULK PAYOUT MODAL */}
      <Modal isOpen={isBulkPayoutModalOpen} onClose={() => setIsBulkPayoutModalOpen(false)} title="Process Monthly Payouts">
        <form onSubmit={handleBulkPayout} className="space-y-8 animate-in slide-in-from-bottom-4 text-left">
          <div className="p-10 bg-slate-900 rounded-[32px] text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
             <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Aggregated Pending Commissions</p>
             <h4 className="text-5xl font-extrabold text-white tracking-tight italic">
                {formatMoney(agents.reduce((sum, a) => sum + (a.status === 'active' ? Number(a.pendingCommission || 0) : 0), 0))}
             </h4>
             <div className="mt-6 flex justify-center">
                <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                   Active Partners to Pay: {agents.filter(a => a.status === 'active' && a.pendingCommission > 0).length}
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <FormField label="Disbursement Method">
                <select value={bulkPayoutData.method} onChange={e => setBulkPayoutData({ ...bulkPayoutData, method: e.target.value })} className="premium-input h-12 appearance-none text-[11px] font-bold uppercase tracking-widest">
                   <option value="BANK">Institutional Bank Wire</option>
                   <option value="MOBILE">Digital Mobile Wallet</option>
                   <option value="CASH">Physical Cash Payout</option>
                </select>
             </FormField>
             <FormField label="Batch Transaction Registry ID">
                <Input value={bulkPayoutData.trxId} onChange={e => setBulkPayoutData({ ...bulkPayoutData, trxId: e.target.value })} placeholder="BATCH-REF-XXXXXX" required />
             </FormField>
          </div>

          <div className="flex gap-4 pt-2">
             <Btn variant="outline" type="button" className="flex-1 h-14" onClick={() => setIsBulkPayoutModalOpen(false)}>Abort</Btn>
             <Btn type="submit" loading={isSubmitting} className="flex-[2] h-14 !bg-emerald-600 hover:!bg-emerald-700">Confirm & Record Paid</Btn>
          </div>
        </form>
      </Modal>

      {/* Modern Toast Notification Portal */}
      {toastMsg && createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100000005] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
            <CheckCircle2 className="text-emerald-400" size={24} />
            <span className="text-sm font-bold tracking-tight">{toastMsg}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
