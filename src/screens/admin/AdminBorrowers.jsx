import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, ShieldCheck, AlertTriangle, Search, User, Trash2, Pencil, Phone, 
  Calendar, MapPin, Activity, Database, Filter, UserPlus, ArrowRight, 
  ChevronRight, Hash, Sparkles, Zap, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { Btn, PageTitle, StatusBadge, StatCard, Input, Select, ProTable, Modal, FormField, Divider } from '../../components/UI';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { useLoans } from '../../context/LoanContext';

// Standard Lucide icons re-import just to ensure safety
import { 
  Phone as PhoneIcon, Calendar as CalendarIcon, MapPin as MapPinIcon, Hash as HashIcon, 
  Zap as ZapIcon, AlertCircle, FileText, CheckCircle2 as CheckIcon
} from 'lucide-react';

const RiskBadge = ({ risk }) => {
  const configs = {
    'GREEN': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Low Risk' },
    'AMBER': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Medium Risk' },
    'RED': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: 'High Risk' },
  };
  const c = configs[risk] || configs['GREEN'];
  return (
    <div className={`px-3 py-1.5 rounded-xl border ${c.bg} ${c.text} ${c.border} text-[9px] font-bold uppercase tracking-widest flex items-center gap-2`}>
      <div className={`w-1 h-1 rounded-full ${c.text.replace('text', 'bg')}`} />
      {c.label}
    </div>
  );
};

const DUMMY_BORROWERS = [
  { id: 'BOR-101', name: 'Alice Wilson', email: 'alice@gmail.com', phone: '+1 555 0101', nrc: 'ID-88271', dob: '1990-05-12', address: 'San Francisco, CA', risk: 'GREEN', isApproved: true, kyc: 'approved', status: 'active', createdAt: '2023-01-15', leadStatus: 'HOT LEAD', lastContact: '2026-05-10', nextFollowUp: '2026-05-12', notes: 'Interested in loan. Documents verified.' },
  { id: 'BOR-102', name: 'Bob Thompson', email: 'bob@gmail.com', phone: '+1 555 0102', nrc: 'ID-88272', dob: '1985-11-20', address: 'Austin, TX', risk: 'AMBER', isApproved: true, kyc: 'pending', status: 'active', createdAt: '2023-02-20', leadStatus: 'CONTACTED', lastContact: '2026-05-08', nextFollowUp: '2026-05-15', notes: 'Pending front page ID signature.' },
  { id: 'BOR-103', name: 'Charlie Davis', email: 'charlie@gmail.com', phone: '+1 555 0103', nrc: 'ID-88273', dob: '1992-03-10', address: 'Chicago, IL', risk: 'RED', isApproved: false, kyc: 'rejected', status: 'suspended', createdAt: '2023-03-05', leadStatus: 'NEW SIGNUP', lastContact: '2026-05-11', nextFollowUp: '2026-05-11', notes: 'KYC rejected due to expired credentials.' },
  { id: 'BOR-104', name: 'Diana Prince', email: 'diana@gmail.com', phone: '+1 555 0104', nrc: 'ID-88274', dob: '1988-07-05', address: 'Seattle, WA', risk: 'GREEN', isApproved: true, kyc: 'pending', status: 'active', createdAt: '2023-04-12', leadStatus: 'COLD', lastContact: '2026-05-01', nextFollowUp: '2026-05-20', notes: 'Awaiting utility statement upload.' },
];

export default function AdminBorrowers() {
  const { loans } = useLoans();
  const [borrowers, setBorrowers] = useState(DUMMY_BORROWERS);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [kycFilter, setKycFilter] = useState('ALL');
  
  const [viewModal, setViewModal] = useState(null);
  const [selectedKycBorrower, setSelectedKycBorrower] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [kycModal, setKycModal] = useState(false);
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', nrc: '', dob: '', address: '', password: 'Password123!', risk: 'GREEN', kyc: 'pending', status: 'active' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = useMemo(() => {
    return borrowers.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.nrc.includes(search);
      const matchRisk   = riskFilter === 'ALL' || b.risk === riskFilter;
      const matchKyc    = kycFilter === 'ALL' || b.kyc === kycFilter;
      return matchSearch && matchRisk && matchKyc;
    });
  }, [borrowers, search, riskFilter, kycFilter]);

  const handleAddBorrower = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newBorrower = { 
        ...form, 
        id: `BOR-${101 + borrowers.length}`, 
        isApproved: true, 
        createdAt: new Date().toISOString() 
      };
      setBorrowers([newBorrower, ...borrowers]);
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setForm({ name: '', email: '', phone: '', nrc: '', dob: '', address: '', password: 'Password123!', risk: 'GREEN', kyc: 'pending', status: 'active' });
      showToast('New Borrower Onboarded Successfully.');
    }, 1000);
  };

  const handleToggleSuspend = (id) => {
    setBorrowers(prev => prev.map(b => {
      if (b.id !== id) return b;
      const newStatus = b.status === 'suspended' ? 'active' : 'suspended';
      showToast(`Account ${b.name} has been ${newStatus === 'suspended' ? 'SUSPENDED' : 'REACTIVATED'}.`);
      return { ...b, status: newStatus };
    }));
  };

  const handleOpenKycReview = (borrower) => {
    setSelectedKycBorrower(borrower);
    setKycModal(true);
  };

  const handleKycVerdict = (verdict) => {
    if (!selectedKycBorrower) return;
    setBorrowers(prev => prev.map(b => {
      if (b.id !== selectedKycBorrower.id) return b;
      return { ...b, kyc: verdict };
    }));
    setKycModal(false);
    showToast(`KYC status for ${selectedKycBorrower.name} marked as ${verdict.toUpperCase()}.`);
    setSelectedKycBorrower(null);
  };

  // Get loan history for dossier view
  const userLoanHistory = useMemo(() => {
    if (!viewModal) return [];
    return loans.filter(l => 
      l.user?.name?.toLowerCase().includes(viewModal.name.toLowerCase()) || 
      l.user?.email?.toLowerCase().includes(viewModal.email.toLowerCase())
    );
  }, [viewModal, loans]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Borrowers & User Management" 
        subtitle="Manage borrower identities, KYC verifications, suspension states, and review loan histories" 
        action={
           <Btn size="md" onClick={() => setIsAddModalOpen(true)}>
              <UserPlus size={16} className="mr-2" /> Onboard Borrower
           </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button 
          onClick={() => setKycFilter('ALL')}
          className={`pro-card p-6 text-left transition-all ${kycFilter === 'ALL' ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-white'}`}
        >
          <StatCard label="All Registered Users" value={borrowers.length} icon={Users} color="text-primary" />
        </button>
        <button 
          onClick={() => setKycFilter('pending')}
          className={`pro-card p-6 text-left transition-all ${kycFilter === 'pending' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/5' : 'bg-white'}`}
        >
          <StatCard label="Pending KYC" value={borrowers.filter(b => b.kyc === 'pending').length} icon={Clock3} color="text-amber-500" />
        </button>
        <button 
          onClick={() => setKycFilter('approved')}
          className={`pro-card p-6 text-left transition-all ${kycFilter === 'approved' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5' : 'bg-white'}`}
        >
          <StatCard label="Approved KYC" value={borrowers.filter(b => b.kyc === 'approved').length} icon={ShieldCheck} color="text-emerald-500" />
        </button>
        <button 
          onClick={() => setKycFilter('rejected')}
          className={`pro-card p-6 text-left transition-all ${kycFilter === 'rejected' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-500/5' : 'bg-white'}`}
        >
          <StatCard label="Rejected KYC" value={borrowers.filter(b => b.kyc === 'rejected').length} icon={AlertTriangle} color="text-rose-500" />
        </button>
      </section>

      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 xl:max-w-3xl">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                className="premium-input pl-12 h-12"
                placeholder="Search by name or NRC ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            {/* KYC Filters */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 sm:w-auto w-full">
              {[['ALL','All KYC'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setKycFilter(val)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    kycFilter === val ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ProTable headers={[
          { label: 'Borrower Name / Email' },
          { label: 'NRC ID' },
          { label: 'Status' },
          { label: 'KYC Status' },
          { label: 'Risk Rating' },
          { label: 'Action & Controls', className: 'text-right' }
        ]}>
          {filtered.map((b) => (
            <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                       {b.name[0]}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-slate-800 transition-colors group-hover:text-primary">{b.name}</p>
                       <p className="text-[10px] font-bold text-slate-300 mt-0.5">{b.email}</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[12px] font-bold text-slate-600">{b.nrc}</p>
              </td>
              <td className="px-6 py-5">
                 <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                   b.status === 'suspended' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                 }`}>
                   {b.status === 'suspended' ? 'Suspended' : 'Active'}
                 </span>
              </td>
              <td className="px-6 py-5">
                 <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                   b.kyc === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                   b.kyc === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                   'bg-rose-50 text-rose-600 border border-rose-100'
                 }`}>
                   {b.kyc}
                 </span>
              </td>
              <td className="px-6 py-5">
                 <RiskBadge risk={b.risk} />
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  {(b.kyc === 'pending' || b.kyc === 'rejected') && (
                     <Btn size="sm" variant="primary" className="!py-1.5 !px-3 text-[9px]" onClick={() => handleOpenKycReview(b)}>
                       Review KYC
                     </Btn>
                  )}
                  <Btn variant="outline" size="sm" className="!py-1.5 !px-3 text-[9px]" onClick={() => setViewModal(b)}>
                    Dossier
                  </Btn>
                  <Btn 
                    variant={b.status === 'suspended' ? 'success' : 'danger'} 
                    size="sm" 
                    className="!py-1.5 !px-3 text-[9px]" 
                    onClick={() => handleToggleSuspend(b.id)}
                  >
                    {b.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                  </Btn>
                </div>
              </td>
            </tr>
          ))}
        </ProTable>
      </div>

      {/* CLIENT DOSSIER & LOAN HISTORY MODAL */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Client Dossier Overview">
        {viewModal && (
          <div className="space-y-6 text-left">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
               <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-900 font-bold text-2xl border border-slate-100 uppercase">
                  {viewModal.name[0]}
               </div>
               <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">{viewModal.name}</h4>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{viewModal.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">WhatsApp / Contact</p>
                  <p className="text-slate-800 mt-1">{viewModal.phone}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">NRC Registry ID</p>
                  <p className="text-slate-800 mt-1">{viewModal.nrc}</p>
               </div>
            </div>

            {/* USER LOAN HISTORY SECTION */}
            <div className="space-y-4">
              <Divider text="Loan History Tracker" />
              
              {userLoanHistory.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase">No Loan Contracts Registered Under This User</p>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-inner max-h-[200px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="p-3">Contract ID</th>
                        <th className="p-3">Principal</th>
                        <th className="p-3">Remaining</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-700">
                      {userLoanHistory.map(loan => (
                        <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-slate-950">{loan.id}</td>
                          <td className="p-3">${loan.principalAmount.toLocaleString()}</td>
                          <td className="p-3 text-slate-500">${(loan.remainingPrincipal || 0).toLocaleString()}</td>
                          <td className="p-3">
                            <span className="uppercase text-[8px] font-black">{loan.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Btn variant="outline" className="w-full h-12" onClick={() => setViewModal(null)}>Close Dossier</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* MANUAL KYC REVIEW MODAL */}
      <Modal isOpen={kycModal} onClose={() => setKycModal(false)} title="KYC Verification Review">
        {selectedKycBorrower && (
          <div className="space-y-6 text-left">
            <div className="p-5 bg-amber-50/60 border border-amber-100 text-amber-900 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-extrabold uppercase">Manual Document Review</h4>
                <p className="text-[11px] text-amber-700 mt-1">
                  Reviewing files submitted by <strong>{selectedKycBorrower.name}</strong> (NRC: {selectedKycBorrower.nrc}).
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                 <p className="text-[9px] font-bold text-slate-400 uppercase">ID Front</p>
                 <div className="h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1633265486064-086b219458ce?auto=format&fit=crop&q=80&w=400&h=250" alt="ID Front" className="w-full h-full object-cover" />
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-bold text-slate-400 uppercase">ID Back</p>
                 <div className="h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1633265486064-086b219458ce?auto=format&fit=crop&q=80&w=400&h=250" alt="ID Back" className="w-full h-full object-cover" />
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Address Proof</p>
                 <div className="h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
                    <FileText className="text-slate-450" size={24} />
                 </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
               <Btn variant="danger" className="flex-1" onClick={() => handleKycVerdict('rejected')}>Reject KYC</Btn>
               <Btn variant="success" className="flex-[2]" onClick={() => handleKycVerdict('approved')}>Approve KYC</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Borrower">
         <form onSubmit={handleAddBorrower} className="space-y-6 text-left">
            <div className="grid grid-cols-2 gap-4">
               <FormField label="Full Name">
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Owner name" required />
               </FormField>
               <FormField label="NRC Identifier">
                  <Input value={form.nrc} onChange={e => setForm({...form, nrc: e.target.value})} placeholder="ID Number" required />
               </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormField label="Email Registry">
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="client@mail.com" required />
               </FormField>
               <FormField label="Mobile Node">
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+..." required />
               </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormField label="Birth Registry">
                  <Input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} required />
               </FormField>
               <FormField label="Initial Risk Rating">
                  <select value={form.risk} onChange={e => setForm({...form, risk: e.target.value})} className="premium-input h-12 appearance-none text-[11px] font-bold uppercase tracking-widest">
                     <option value="GREEN">Stable (Low)</option>
                     <option value="AMBER">Standard (Med)</option>
                     <option value="RED">High Priority</option>
                  </select>
               </FormField>
            </div>
            <FormField label="Residential Node">
               <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Physical address" />
            </FormField>
            <div className="pt-2 flex gap-4">
               <Btn type="submit" loading={isSubmitting} className="flex-[2] h-14">Authorize Onboarding</Btn>
               <Btn variant="outline" type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-14">Abort</Btn>
            </div>
         </form>
      </Modal>

      {/* Modern Toast */}
      {toastMsg && createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100000005] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
            <CheckIcon className="text-emerald-400" size={24} />
            <span className="text-sm font-bold tracking-tight">{toastMsg}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
