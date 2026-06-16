import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
   FileText, Search, CheckCircle2, X, Download as DownloadIcon, ArrowRight, User, Clock,
   Banknote, Briefcase, FileSignature, ShieldCheck, Activity, Trash2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageTitle, StatusBadge, Btn, StatCard, Divider, ProTable, EmptyState } from '../../components/UI';
import { getLoanSettings } from '../../utils/loanConfig';
import { calculateLoanDetails, calculateLoanStatus } from '../../utils/loanCalculator';
import { exportToExcel } from '../../utils/exportUtils.js';
import { useLoans } from '../../context/LoanContext';

function formatMoney(value) {
   return `MXN $${Number(value || 0).toLocaleString()}`;
}

const DUMMY_LOANS = [
   { id: 'LN-8801', user: { name: 'Michael Johnson' }, principalAmount: 5000, duration: 12, status: 'PENDING', interestRate: 10, dueDay: 5, agent: null, disbursementMethod: 'cash', deliveryAddress: '14 Oak Avenue', whatsapp: '+260972001122', monthlyPayment: 458, disbursementDate: null },
   { id: 'LN-8802', user: { name: 'Sarah Williams' }, principalAmount: 8500, duration: 6, status: 'PENDING', interestRate: 10, dueDay: 10, agent: { name: 'James Banda' }, disbursementMethod: 'wire', bankName: 'Zanaco Bank', accountNumber: '0021991028', monthlyPayment: 1491, disbursementDate: null },
   { id: 'LN-8803', user: { name: 'David Brown' }, principalAmount: 3200, duration: 9, status: 'APPROVED', interestRate: 12, dueDay: 15, agent: null, disbursementMethod: 'cash', monthlyPayment: 373, disbursementDate: '2024-10-12' },
   { id: 'LN-8804', user: { name: 'Emma Thompson' }, principalAmount: 12000, duration: 18, status: 'APPROVED', interestRate: 10, dueDay: 1, agent: { name: 'Clara Phiri' }, disbursementMethod: 'wire', monthlyPayment: 710, disbursementDate: '2024-10-10' },
   { id: 'LN-8805', user: { name: 'James Wilson' }, principalAmount: 2500, duration: 6, status: 'PENDING', interestRate: 8, dueDay: 20, agent: null, monthlyPayment: 435, disbursementDate: null },
];

const DUMMY_AGENTS = [
   { id: 1, name: 'James Banda' },
   { id: 2, name: 'Clara Phiri' },
   { id: 3, name: 'Victor Mwale' },
];

export default function StaffLoans() {
   const [searchParams, searchParamsSearch] = useSearchParams();
   const activeTab = useMemo(() => {
      const t = searchParams.get('tab');
      if (t === 'review') return 'PENDING';
      if (t === 'approved') return 'APPROVED';
      return 'ALL';
   }, [searchParams]);

   const setLoanTab = useCallback((tab) => {
      if (tab === 'ALL') searchParamsSearch({}, { replace: true });
      else if (tab === 'PENDING') searchParamsSearch({ tab: 'review' }, { replace: true });
      else if (tab === 'APPROVED') searchParamsSearch({ tab: 'approved' }, { replace: true });
   }, [searchParamsSearch]);

   const { loans, updateLoan } = useLoans();
   const [search, setSearch] = useState('');
   const [viewModal, setViewModal] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [adminFields, setAdminFields] = useState({
      agentId: '', agentCommissionRate: 5, initiationFeeRate: 0,
      interestRate: 10, latePenaltyRate: 2, graceDays: 3, dueDay: 5
   });

   useEffect(() => {
      const s = getLoanSettings();
      setAdminFields(prev => ({
         ...prev,
         agentCommissionRate: s.agentCommission,
         initiationFeeRate: s.initiationFee,
         interestRate: s.interestRate,
         latePenaltyRate: s.delinquentInterestRate,
         graceDays: s.graceDays
      }));
   }, []);



   const filtered = useMemo(() => {
      return loans.filter(l => {
         const name = l.user?.name || '';
         const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || String(l.id).includes(search);
         const matchesTab = activeTab === 'ALL' ? true : 
                            (activeTab === 'PENDING' && (String(l.status).toUpperCase() === 'PENDING' || String(l.status).toUpperCase() === 'REVIEW')) ||
                            (activeTab === 'APPROVED' && (String(l.status).toUpperCase() === 'APPROVED' || String(l.status).toUpperCase() === 'ACTIVE'));
         return matchesSearch && matchesTab;
      });
   }, [loans, search, activeTab]);

   const handleSetTerms = () => {
      setIsSubmitting(true);
      setTimeout(() => {
         updateLoan(viewModal.id, { status: 'Active', disbursementDate: new Date().toISOString().split('T')[0] });
         setIsSubmitting(false);
         setViewModal(null);
      }, 800);
   };

   const handleDecline = () => {
      setIsSubmitting(true);
      setTimeout(() => {
         updateLoan(viewModal.id, { status: 'Rejected' });
         setIsSubmitting(false);
         setViewModal(null);
      }, 800);
   };

   const handleExport = () => {
      const exportData = filtered.map(l => ({
         ID: l.id,
         Borrower: l.user?.name,
         Principal: l.principalAmount,
         Duration: l.duration,
         Status: l.status,
         Method: l.disbursementMethod
      }));
      exportToExcel(exportData, 'Staff_Loan_Operations');
   };

   return (
      <div className="space-y-8 pb-10">
         {/* HEADER */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Loan Operations</h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verify and manage customer loan lifecycles</p>
            </div>
            <div className="flex items-center gap-3">
               <Btn variant="outline" size="sm" onClick={handleExport}>
                  <DownloadIcon size={14} className="mr-2" /> Export
               </Btn>
            </div>
         </div>

         {/* STATS */}
         <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard label="Review Queue" value={loans.filter(l => String(l.status).toUpperCase() === 'PENDING' || String(l.status).toUpperCase() === 'REVIEW').length} icon={Clock} trend="Action Required" />
            <StatCard label="Disbursements" value={loans.filter(l => String(l.status).toUpperCase() === 'APPROVED' || String(l.status).toUpperCase() === 'ACTIVE').length} icon={CheckCircle2} trend="Active" />
            <StatCard label="System Integrity" value="Stable" icon={ShieldCheck} trend="Verified" />
         </section>

         {/* FILTERS & TABS */}
         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex p-1 bg-white rounded-xl border border-slate-200 gap-1 w-fit">
               {[{ id: 'ALL', label: 'All' }, { id: 'PENDING', label: 'In Review' }, { id: 'APPROVED', label: 'Disbursed' }].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setLoanTab(tab.id)}
                     className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
            <div className="relative w-full xl:w-80 group">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..." className="w-full h-10 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary outline-none transition-all" />
            </div>
         </div>

         {/* TABLE */}
         <ProTable
            headers={[
              'Customer',
              'Principal',
              { label: 'Terms', className: 'hidden md:table-cell' },
              { label: 'Agent', className: 'hidden sm:table-cell' },
              'Status',
              ''
            ]}
         >
            {filtered.map(l => (
               <tr key={l.id} className="group hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewModal(l)}>
                  <td>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all shrink-0">
                           <User size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800">{l.user?.name}</p>
                           <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">#{l.id}</span>
                              <span className="text-[10px] text-slate-300 sm:hidden">•</span>
                              <span className="text-[10px] text-slate-400 sm:hidden uppercase font-bold">{l.agent?.name || 'Direct'}</span>
                           </div>
                        </div>
                     </div>
                  </td>
                  <td>
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{formatMoney(l.principalAmount)}</span>
                        <span className="text-[10px] text-slate-400 md:hidden font-bold">{l.duration} Months • {l.interestRate}% Int</span>
                     </div>
                  </td>
                  <td className="hidden md:table-cell">
                     <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{l.duration} Months</span>
                        <span className="text-[10px] text-emerald-600 font-bold">{l.interestRate}% Interest</span>
                     </div>
                  </td>
                  <td className="hidden sm:table-cell">
                     <div className="flex items-center gap-2">
                        <Briefcase size={12} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-500 uppercase">{l.agent?.name || 'Direct'}</span>
                     </div>
                  </td>
                  <td><StatusBadge status={calculateLoanStatus(l)} /></td>
                  <td className="text-right">
                     <Btn variant="ghost" size="sm">Review</Btn>
                  </td>
               </tr>
            ))}
         </ProTable>

         {filtered.length === 0 && (
            <EmptyState title="Queue Empty" description="No loan applications found matching your criteria." icon={FileText} />
         )}

         {/* REVIEW MODAL */}
         {viewModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={handleDecline} />
               <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl border border-slate-200">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Verification Dossier</h3>
                     <button onClick={handleDecline} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <X size={18} className="text-slate-400" />
                     </button>
                  </div>

                  <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                     <div className="p-8 bg-slate-50 rounded-3xl text-center space-y-2">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Requested Principal</p>
                        <h4 className="text-5xl font-black text-slate-900">{formatMoney(viewModal.principalAmount)}</h4>
                        <div className="flex justify-center gap-4 pt-2">
                           <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase">{viewModal.duration} Months</span>
                           <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-primary uppercase">{viewModal.interestRate}% Interest</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign Agent</label>
                           <select className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none">
                              <option>No Agent (Direct)</option>
                              {DUMMY_AGENTS.map(a => <option key={a.id}>{a.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Day</label>
                           <input type="number" defaultValue={viewModal.dueDay} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none" />
                        </div>
                     </div>

                     <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-[60px] opacity-20" />
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} className="text-primary" /> Projected Repayment
                        </h5>
                        {(() => {
                           const details = calculateLoanDetails({
                              principal: viewModal.principalAmount,
                              duration: viewModal.duration,
                              interestRate: viewModal.interestRate
                           });
                           return (
                              <div className="grid grid-cols-2 gap-y-4">
                                 <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Monthly Installment</p>
                                    <p className="text-lg font-bold text-primary">{formatMoney(details.monthlyInstallment)}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Total Interest</p>
                                    <p className="text-lg font-bold">{formatMoney(details.totalInterest)}</p>
                                 </div>
                              </div>
                           );
                        })()}
                     </div>

                     <div className="flex gap-4 pt-4">
                        <Btn variant="danger" className="flex-1 !h-12" onClick={handleDecline}>
                           <Trash2 size={16} className="mr-2" /> Decline
                        </Btn>
                        <Btn className="flex-[2] !h-12 shadow-lg shadow-primary/20" onClick={handleSetTerms}>
                           <FileSignature size={16} className="mr-2" /> Finalize & Approve
                        </Btn>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

