import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  History, 
  Activity, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  LayoutGrid, 
  ChevronRight,
  Download,
  Percent,
  Calendar,
  Zap,
  Info,
  Trash2,
  FileText
} from 'lucide-react';
import { 
  PageTitle, 
  StatusBadge, 
  Btn, 
  Input, 
  StatCard, 
  ProTable, 
  Modal, 
  FormField,
  Divider
} from '../../components/UI';
import { getLoanSettings } from '../../utils/loanConfig';
import { exportToExcel } from '../../utils/exportUtils.js';
import { calculateLoanDetails, calculateLoanStatus } from '../../utils/loanCalculator';
import { formatDateDDMMYYYY, getDueDateCounter } from '../../utils/dateUtils';
import { useLoans } from '../../context/LoanContext';

const DUMMY_LOANS = [
  { 
    id: 'ARK-7701', user: { name: 'James Wilson' }, principalAmount: 25000, remainingPrincipal: 25000, 
    duration: 12, createdAt: '2024-10-14', status: 'pending', interestRate: 10, agentCommission: 5, 
    disbursementDate: null, dueDate: null, unpaidInterest: 0, unpaidFees: 0, 
    payments: [], fees: [] 
  },
  { 
    id: 'ARK-7702', user: { name: 'Sarah Jenkins' }, principalAmount: 12000, remainingPrincipal: 10000, 
    duration: 6, createdAt: '2024-10-13', status: 'active', interestRate: 12, agentCommission: 8, 
    disbursementDate: '2026-04-15', dueDate: '2026-05-15', unpaidInterest: 150, unpaidFees: 0, 
    payments: [
      { id: 'TRX-001', date: '2026-04-20', amount: 500, type: 'interest' },
      { id: 'TRX-002', date: '2026-04-25', amount: 2000, type: 'principal' }
    ], 
    fees: [
       { id: 'FEE-001', date: '2026-04-15', amount: 50, type: 'initiation', status: 'paid' }
    ]
  },
  { 
    id: 'ARK-TEST-70', user: { name: 'Test Penalty' }, principalAmount: 700, remainingPrincipal: 700, 
    duration: 12, createdAt: '2024-10-11', status: 'late', interestRate: 10, agentCommission: 5, 
    disbursementDate: '2026-04-01', dueDate: '2026-04-16', unpaidInterest: 70, unpaidFees: 0, 
    payments: [], 
    fees: []
  },
  { 
    id: 'ARK-7706', user: { name: 'Lisa Ray' }, principalAmount: 3000, remainingPrincipal: 0, 
    duration: 3, createdAt: '2024-10-09', status: 'completed', interestRate: 10, agentCommission: 5, 
    disbursementDate: '2026-03-10', dueDate: '2026-04-10', unpaidInterest: 0, unpaidFees: 0, 
    payments: [{ id: 'TRX-003', date: '2026-04-05', amount: 3000, type: 'principal' }], 
    fees: [] 
  },
];

function formatDate(date) {
  if (!date) return <span className="text-rose-400 italic">Not Delivered Yet</span>;
  return formatDateDDMMYYYY(date);
}

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

import { useSearchParams } from 'react-router-dom';

export default function AdminLoans() {
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);
  
  const { loans: rawLoans, updateLoan } = useLoans();

  const loans = useMemo(() => {
    return rawLoans.map(l => ({
      ...l,
      status: l.status === 'Pending' || l.status === 'PENDING' ? 'pending' : 
              l.status === 'Active' || l.status === 'APPROVED' ? 'active' : 
              l.status === 'Rejected' || l.status === 'REJECTED' ? 'rejected' : 
              l.status === 'Late' || l.status === 'LATE' ? 'late' : 
              l.status.toLowerCase()
    }));
  }, [rawLoans]);
  
  // Set initial filter from URL if present
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status.toUpperCase());
    }
  }, [searchParams]);

  const [config, setConfig] = useState({
    interestRate: 12,
    delinquentRate: 15,
    agentCommission: 5,
    initiationFee: 3,
    gracePeriod: 3,
    minMonths: 1,
    approvedAmount: ''
  });

  const [error, setError] = useState('');
  const [recordType, setRecordType] = useState(null); 
  const [recordForm, setRecordForm] = useState({ 
    amount: '', 
    date: new Date().toISOString().split('T')[0], 
    type: 'interest', 
    note: '' 
  });

  useEffect(() => {
    const s = getLoanSettings();
    setConfig({
      interestRate: s.interestRate,
      delinquentRate: s.delinquentInterestRate,
      agentCommission: s.agentCommission,
      initiationFee: 3,
      gracePeriod: s.graceDays,
      minMonths: 1,
      approvedAmount: ''
    });
  }, []);

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(recordForm.amount);
    if (isNaN(amt) || amt <= 0) return;

    let updatedLoanObj = null;

    // Rule Enforcement: Min 2 monthly interest payments
    const paymentsCount = viewModal.paymentsMadeCount || 0;
    if (recordType === 'payment' && recordForm.type === 'principal' && paymentsCount < 2) {
       setError("PROTOCOL RESTRICTION: Minimum 2 monthly interest payments required before principal reduction.");
       setTimeout(() => setError(''), 5000);
       return;
    }

    const updatedLoans = loans.map(l => {
      if (l.id !== viewModal.id) return l;
      
      const newLoan = { ...l };
      
      // Calculate current loan details for potential penalties
      const today = new Date();
      const dueDate = new Date(l.dueDate);
      const diffTime = today - dueDate;
      const daysLate = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      const loanDetails = calculateLoanDetails({
        principal: l.principalAmount,
        remainingPrincipal: l.remainingPrincipal,
        duration: l.duration,
        interestRate: l.interestRate,
        isPaid: false,
        daysLate: daysLate
      });

      if (recordType === 'payment') {
        const paymentObj = { 
          id: `TRX-${Date.now()}`, 
          date: recordForm.date, 
          type: recordForm.type,
          note: recordForm.note,
          baseAmount: 0,
          penaltyAmount: 0,
          principalPaid: 0,
          agentCommission: 0,
          totalCollected: 0
        };

        if (recordForm.type === 'principal') {
          paymentObj.principalPaid = amt;
          paymentObj.totalCollected = amt;
          newLoan.remainingPrincipal = Math.max(0, (l.remainingPrincipal || 0) - amt);
        } else if (recordForm.type === 'interest') {
          paymentObj.baseAmount = amt;
          paymentObj.penaltyAmount = l.status === 'late' ? loanDetails.delinquentPenalty : 0;
          paymentObj.agentCommission = Math.round((amt * (l.agentCommission / 100)) * 100) / 100;
          paymentObj.totalCollected = Math.round((paymentObj.baseAmount + paymentObj.penaltyAmount) * 100) / 100;
          
          newLoan.unpaidInterest = Math.max(0, (l.unpaidInterest || 0) - amt);
          newLoan.paymentsMadeCount = (l.paymentsMadeCount || 0) + 1;
        } else if (recordForm.type === 'fee') {
          paymentObj.totalCollected = amt;
          newLoan.unpaidFees = Math.max(0, (l.unpaidFees || 0) - amt);
          newLoan.fees = l.fees.map(f => f.status === 'unpaid' ? { ...f, status: 'paid' } : f);
        }

        newLoan.payments = [...(l.payments || []), paymentObj];
      } else {
        const fee = { id: `FEE-${Date.now()}`, ...recordForm, amount: amt, status: 'unpaid' };
        newLoan.fees = [...(l.fees || []), fee];
        newLoan.unpaidFees = (l.unpaidFees || 0) + amt;
        
        if (recordForm.type === 'delinquent') {
           newLoan.status = 'late';
        }
      }
      updatedLoanObj = newLoan;
      setViewModal(newLoan);
      return newLoan;
    });
    
    if (updatedLoanObj) {
      updateLoan(viewModal.id, updatedLoanObj);
    }
    setRecordType(null);
    setRecordForm({ amount: '', date: new Date().toISOString().split('T')[0], type: 'interest', note: '' });
  };

  const filteredLoans = useMemo(() => {
    const filtered = loans.filter((loan) => {
      const keyword = search.toLowerCase();
      const matchesSearch = loan.user.name.toLowerCase().includes(keyword) || loan.id.toLowerCase().includes(keyword);
      if (statusFilter === 'ALL') return matchesSearch;
      if (statusFilter === 'PENDING') return matchesSearch && (loan.status === 'pending' || loan.status === 'terms_set');
      if (statusFilter === 'TERMS_SET') return matchesSearch && loan.status === 'terms_set';
      if (statusFilter === 'ACTIVE') return matchesSearch && loan.status === 'active';
      if (statusFilter === 'LATE') return matchesSearch && loan.status === 'late';
      return matchesSearch;
    });

    // Sort by disbursementDate (primary) and createdAt (secondary)
    return filtered.sort((a, b) => {
      if (!a.disbursementDate && !b.disbursementDate) return new Date(b.createdAt) - new Date(a.createdAt);
      if (!a.disbursementDate) return 1; // Put non-disbursed at the bottom
      if (!b.disbursementDate) return -1;
      return new Date(b.disbursementDate) - new Date(a.disbursementDate);
    });
  }, [search, statusFilter, loans]);

  const stats = [
    { label: 'Total Portfolio', value: loans.length, icon: LayoutGrid, key: 'ALL', color: 'text-slate-600' },
    { label: 'Pending Offers', value: loans.filter(l => l.status === 'pending').length, icon: Zap, key: 'PENDING', color: 'text-amber-500' },
    { label: 'Sent Offers', value: loans.filter(l => l.status === 'terms_set').length, icon: History, key: 'TERMS_SET', color: 'text-indigo-500' },
    { label: 'Active Contracts', value: loans.filter(l => l.status === 'active').length, icon: ShieldCheck, key: 'ACTIVE', color: 'text-primary' },
    { label: 'Overdue Alerts', value: loans.filter(l => l.status === 'late').length, icon: AlertCircle, key: 'LATE', color: 'text-rose-500' },
  ];

  const handleOpenManage = (loan) => {
    const s = getLoanSettings();
    setViewModal(loan);
    setRecordType(null);
    setConfig({
      interestRate: loan.interestRate || s.interestRate,
      delinquentRate: s.delinquentInterestRate,
      agentCommission: loan.agentCommission || s.agentCommission,
      initiationFee: 3,
      gracePeriod: s.graceDays,
      minMonths: 1,
      approvedAmount: loan.principalAmount || ''
    });
  };

  const handleApprove = () => {
    const today = new Date();
    const offerDeadlineDate = new Date(today);
    offerDeadlineDate.setDate(today.getDate() + 7);
    const offerDeadline = offerDeadlineDate.toISOString().split('T')[0];
    
    // Find agent name if assigned
    const approvedPrincipal = parseFloat(config.approvedAmount) || viewModal.principalAmount;
    const initiationFeeAmount = (approvedPrincipal * (parseFloat(config.initiationFee) || 0)) / 100;

    const approvedFields = {
      status: 'terms_set', 
      disbursementDate: null, 
      dueDate: null,
      offerDeadline,
      remainingPrincipal: approvedPrincipal,
      unpaidInterest: 0,
      unpaidFees: initiationFeeAmount,
      paymentsMadeCount: 0, 
      payments: [],
      fees: [
        { id: `FEE-${Date.now()}`, date: today.toISOString().split('T')[0], amount: initiationFeeAmount, type: 'initiation', status: 'unpaid' }
      ],
      agent: viewModal.agent || null,
      minMonths: config.minMonths,
      principalAmount: approvedPrincipal,
      ...config
    };

    updateLoan(viewModal.id, approvedFields);
    setViewModal(null);
    alert('Offer successfully calibrated and sent to the borrower for signature.');
  };

  const handleDeny = () => {
    if(!window.confirm(`Are you sure you want to DENY this loan request? This action will set the status to REJECTED.`)) return;

    updateLoan(viewModal.id, {
      status: 'Rejected',
      disbursementDate: null,
      dueDate: null
    });
    setViewModal(null);
  };

  // Auto-open review/calibrate modal if query param is set
  useEffect(() => {
    const reviewId = searchParams.get('review');
    if (reviewId && loans.length > 0) {
      const loanToReview = loans.find(l => l.id === reviewId);
      if (loanToReview) {
        handleOpenManage(loanToReview);
      }
    }
  }, [searchParams, loans]);

  const handleExport = () => {
    const exportData = filteredLoans.map(l => {
      let displayStatus = l.status;
      if (l.status === 'pending') displayStatus = 'Pending Admin Review';
      else if (l.status === 'terms_set') displayStatus = 'Pending Client Approval';
      else if (l.status === 'active') displayStatus = 'Active';
      else if (l.status === 'rejected') displayStatus = 'Rejected';
      else if (l.status === 'late') displayStatus = 'Late / Delinquent';
      else if (l.status === 'completed' || l.status === 'closed') displayStatus = 'Closed';

      return {
        'Loan ID': l.id,
        'Client Name': l.user?.name || 'N/A',
        'Capital (MXN)': l.principalAmount || 0,
        'Interest Rate (%)': l.interestRate ? `${l.interestRate}%` : '10%',
        'Duration (Months)': l.duration || 12,
        'Unpaid Fees (MXN)': l.unpaidFees || 0,
        'Unpaid Interest (MXN)': l.unpaidInterest || 0,
        'Agent Name': l.agent?.name || 'Direct',
        'Agent Commission (%)': l.agentCommission ? `${l.agentCommission}%` : 'N/A',
        'Protocol Status': displayStatus,
        'Submission Date': l.createdAt,
        'Disbursement Date': l.disbursementDate || 'N/A',
        'Signature Date': l.signatureDate || 'N/A',
        'Signature Holder Name': l.signatureName || 'N/A'
      };
    });
    exportToExcel(exportData, 'Admin_Loan_Report');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title={
          statusFilter === 'PENDING' ? 'Incoming Applications' : 
          statusFilter === 'ACTIVE' ? 'Live Portfolio' : 
          statusFilter === 'LATE' ? 'Recovery Queue' : 'Global Loan Registry'
        }
        subtitle={
          statusFilter === 'PENDING' ? 'Review and approve new capital requests from the pipeline' : 
          statusFilter === 'ACTIVE' ? 'Monitor performance and repayment cycles of disbursed capital' : 
          statusFilter === 'LATE' ? 'Address delinquent accounts and trigger recovery protocols' : 'Comprehensive overview of all credit contracts and applications'
        } 
        action={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
             <Btn variant="outline" size="md" className="w-full sm:w-auto" onClick={handleExport}>
                <Download size={16} className="mr-2" /> Export CSV
             </Btn>
             <Btn size="md" className="w-full sm:w-auto">
                <History size={16} className="mr-2" /> System Logs
             </Btn>
          </div>
        }
      />

      <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`pro-card p-4 sm:p-6 text-left transition-all duration-300 border bg-white ${
              statusFilter === s.key ? 'border-primary ring-4 ring-primary/5 shadow-lg' : 'border-slate-100 hover:border-slate-200 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${statusFilter === s.key ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
               <s.icon size={18} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{s.value}</p>
          </button>
        ))}
      </section>
 
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
             <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Contract Flow</h3>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional credit pipeline records</p>
          </div>
          <div className="w-full md:w-80 relative group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
             <input 
                className="premium-input pl-12 h-12"
                placeholder="Search by name or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>
 
        <ProTable headers={[
          { label: 'Borrower Identity' },
          { label: 'Capital Amount' },
          { label: 'Disbursement Date', className: 'hidden md:table-cell' },
          { label: 'Duration', className: 'hidden sm:table-cell' },
          { label: 'Protocol Status' },
          { label: 'Action', className: 'text-right' }
        ]}>
           {filteredLoans.map((loan) => (
             <tr key={loan.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-50">
                         {loan.user.name[0]}
                      </div>
                      <div className="max-w-[120px] sm:max-w-none">
                        <p className="text-[13px] font-bold text-slate-800 transition-colors group-hover:text-primary truncate">{loan.user.name}</p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 truncate">#{loan.id}</p>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <p className="text-[13px] font-bold text-slate-900">{formatMoney(loan.principalAmount)}</p>
                </td>
                <td className="px-6 py-5 hidden md:table-cell">
                   <p className="text-[11px] font-bold text-slate-500">{formatDate(loan.disbursementDate)}</p>
                </td>
                <td className="px-6 py-5 hidden sm:table-cell">
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{loan.duration} Months</p>
                </td>
                <td className="px-6 py-5">
                   <StatusBadge status={calculateLoanStatus(loan)} />
                </td>
                <td className="px-6 py-5 text-right">
                   <Btn size="sm" variant={loan.status === 'pending' ? 'primary' : 'outline'} onClick={() => handleOpenManage(loan)}>
                      {loan.status === 'pending' ? 'Make Offer' : 'Details'}
                   </Btn>
                </td>
             </tr>
           ))}
        </ProTable>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Loan Configuration">
        {viewModal && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="p-6 sm:p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
               <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-900 font-extrabold text-xl border border-slate-100">
                  {viewModal.user.name[0]}
               </div>
               <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{viewModal.user.name}</h4>
               <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Requested: {formatMoney(viewModal.principalAmount)}</p>
               
               {/* KYC Documents Display */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-left">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center">
                    <ShieldCheck size={20} className="text-emerald-500 mb-2" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">ID Type</span>
                    <span className="text-xs font-bold text-slate-900">National ID</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors">
                    <FileText size={20} className="text-primary mb-2" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">ID Front</span>
                    <span className="text-[10px] font-bold text-primary mt-1">View Doc</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors">
                    <FileText size={20} className="text-primary mb-2" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">ID Back</span>
                    <span className="text-[10px] font-bold text-primary mt-1">View Doc</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors">
                    <FileText size={20} className="text-primary mb-2" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">Address</span>
                    <span className="text-[10px] font-bold text-primary mt-1">View Doc</span>
                  </div>
               </div>
            </div>

            {viewModal.status === 'pending' ? (
              <div className="space-y-6">
                <div className="px-1">
                   <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Percent size={14} className="text-primary" /> Calibrate Contract Terms
                   </h5>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Approved Amount (MXN)">
                    <Input type="number" value={config.approvedAmount} onChange={e => setConfig({...config, approvedAmount: e.target.value})} suffix="MXN" />
                  </FormField>
                  <FormField label="Interest Rate (%)">
                    <Input type="number" value={config.interestRate} onChange={e => setConfig({...config, interestRate: e.target.value})} suffix="%" />
                  </FormField>
                  <FormField label="Initiation Fee (%)">
                    <Input type="number" value={config.initiationFee} onChange={e => setConfig({...config, initiationFee: e.target.value})} suffix="%" />
                  </FormField>
                  <FormField label="Grace Days">
                    <Input type="number" value={config.gracePeriod} onChange={e => setConfig({...config, gracePeriod: e.target.value})} placeholder="e.g. 3" />
                  </FormField>
                  <FormField label="Delinquent Penalty (%)">
                    <Input type="number" value={config.delinquentRate} onChange={e => setConfig({...config, delinquentRate: e.target.value})} suffix="%" />
                  </FormField>
                  <FormField label="Min Months">
                    <Input type="number" value={config.minMonths} onChange={e => setConfig({...config, minMonths: e.target.value})} placeholder="e.g. 1" />
                  </FormField>
                  <FormField label="Agent Commission (%)">
                     <select
                       value={config.agentCommission}
                       onChange={e => setConfig({...config, agentCommission: e.target.value})}
                       className="premium-input h-12 appearance-none text-[11px] font-bold uppercase tracking-widest w-full"
                     >
                        <option value="3">3% Basic</option>
                        <option value="5">5% Standard</option>
                        <option value="8">8% Premium</option>
                        <option value="10">10% Expert</option>
                     </select>
                  </FormField>
                </div>

                <div className="bg-primary/5 p-4 sm:p-6 rounded-2xl border border-primary/10">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                     <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                        <Zap size={16} />
                     </div>
                     <div className="flex-1 w-full">
                        <p className="text-xs font-bold text-slate-900 leading-none mb-4 sm:mb-0">Smart Calculation Registry</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 mt-4">
                          {(() => {
                            const details = calculateLoanDetails({
                              principal: viewModal.principalAmount,
                              duration: config.duration || viewModal.duration,
                              interestRate: config.interestRate,
                              hasAgent: !!config.agentId,
                              agentCommissionRate: config.agentCommission,
                              initiationFee: config.initiationFee
                            });
                            return (
                               <>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Monthly Pay</p>
                                    <p className="text-xs font-bold text-slate-900">{formatMoney(details.monthlyInstallment)}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Disbursement</p>
                                    <p className="text-xs font-bold text-emerald-500 italic">{formatMoney(details.disbursementAmount)}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total Owed</p>
                                    <p className="text-xs font-bold text-primary">{formatMoney(details.totalPayable)}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Commission</p>
                                    <p className="text-xs font-bold text-emerald-500">{config.agentId ? formatMoney(details.agentCommission) : 'N/A'}</p>
                                 </div>
                               </>
                            );
                          })()}
                       </div>
                    </div>
                 </div>
              </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                   <Btn variant="outline" className="flex-1 h-14" onClick={() => setViewModal(null)}>Dismiss</Btn>
                   <Btn variant="danger" className="flex-1 h-14" onClick={handleDeny}>Deny Application</Btn>
                   <Btn className="flex-[2] h-14 shadow-xl" onClick={handleApprove}>Authorize Disburse</Btn>
                </div>
              </div>
            ) : viewModal.status === 'terms_set' ? (
               <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="p-4 sm:p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Principal Offered</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900">{formatMoney(viewModal.principalAmount)}</p>
                     </div>
                     <div className="p-4 sm:p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Offered Interest Rate</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900">{viewModal.interestRate}%</p>
                     </div>
                     <div className="p-4 sm:p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Offer Expiration Date</p>
                        <p className="text-base sm:text-lg font-bold text-rose-600">{formatDateDDMMYYYY(viewModal.offerDeadline)}</p>
                     </div>
                  </div>

                  <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Info size={20} />
                     </div>
                     <div>
                        <h5 className="text-xs font-bold uppercase tracking-widest text-amber-800">Pending Borrower Signature</h5>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">
                          This offer has been sent to the borrower. The borrower must log into their portal, review the terms of this contract, and sign it before the loan is fully approved and disbursed.
                        </p>
                     </div>
                  </div>

                  {viewModal.collateral?.length > 0 && (
                     <div className="space-y-4">
                        <Divider text="Collateral Assets" />
                        <div className="grid grid-cols-1 gap-4">
                           {viewModal.collateral.map((item) => (
                              <div key={item.id} className="p-4 border border-slate-100 rounded-2xl bg-white flex justify-between items-center shadow-sm">
                                 <div>
                                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Value: {formatMoney(item.estimatedValue)}</p>
                                 </div>
                                 <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-bold uppercase tracking-wider">{item.status}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            ) : (
               <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Monthly Pay</p>
                        <p className="text-base sm:text-lg font-bold text-primary">
                          {formatMoney(
                            calculateLoanDetails({
                              principal: viewModal.principalAmount,
                              remainingPrincipal: viewModal.remainingPrincipal,
                              interestRate: viewModal.interestRate,
                              duration: viewModal.duration
                            }).monthlyPaymentCurrent
                          )}
                        </p>
                     </div>
                     <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding Principal</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900">{formatMoney(viewModal.remainingPrincipal)}</p>
                     </div>
                     <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2 md:col-span-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unpaid Dues</p>
                        <p className="text-base sm:text-lg font-bold text-rose-500">{formatMoney((viewModal.unpaidInterest || 0) + (viewModal.unpaidFees || 0))}</p>
                     </div>
                     {viewModal.dueDate && (
                       <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 col-span-full">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date Status</p>
                          <div className="flex items-center gap-3">
                             <span className="text-sm font-bold text-slate-900">{formatDateDDMMYYYY(viewModal.dueDate)}</span>
                             <span className={`text-sm font-bold uppercase ${
                                getDueDateCounter(viewModal.dueDate).includes('overdue') ? 'text-rose-600' : 
                                getDueDateCounter(viewModal.dueDate) === 'Due today' ? 'text-amber-600' : 'text-primary'
                             }`}>
                                • {getDueDateCounter(viewModal.dueDate)}
                             </span>
                          </div>
                       </div>
                     )}
                  </div>

                  {(() => {
                    const today = new Date();
                    const dueDate = viewModal.dueDate ? new Date(viewModal.dueDate) : null;
                    let daysLate = 0;
                    if (dueDate && !isNaN(dueDate.getTime()) && today > dueDate) {
                      daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    }
                    const details = calculateLoanDetails({
                      principal: viewModal.principalAmount,
                      remainingPrincipal: viewModal.remainingPrincipal,
                      interestRate: viewModal.interestRate,
                      duration: viewModal.duration,
                      daysLate: daysLate
                    });

                    if (details.delinquentPenalty > 0) {
                      const daysPastGrace = Math.max(0, daysLate - details.graceDays);
                      return (
                        <div className="p-4 sm:p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-rose-600">
                              <AlertCircle size={16} />
                              <h5 className="text-xs font-bold uppercase tracking-widest italic">Overdue Payment Breakdown</h5>
                            </div>
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest italic">Days Late: {daysPastGrace} days</span>
                          </div>
                          <div className="space-y-3 px-1">
                            <div className="flex justify-between items-center text-sm font-bold">
                              <span className="text-slate-500 uppercase text-[10px] tracking-widest">Payment Amount</span>
                              <span className="text-slate-900">{formatMoney(details.monthlyPaymentCurrent)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                              <span className="text-slate-500 uppercase text-[10px] tracking-widest">Extraordinary Interest</span>
                              <span className="text-rose-500">+ {formatMoney(details.delinquentPenalty)}</span>
                            </div>
                            <Divider className="my-1 opacity-50" />
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Total Due</span>
                              <div className="text-right">
                                <span className="text-xl font-black text-rose-600">{formatMoney(details.monthlyPaymentCurrent + details.delinquentPenalty)}</span>
                                <p className="text-[8px] font-bold text-rose-400 uppercase mt-0.5 tracking-tighter">Principal + Delinquent Fee</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex flex-col sm:flex-row gap-4">
                     <Btn 
                        variant={recordType === 'payment' ? 'primary' : 'outline'} 
                        className="w-full sm:flex-1 h-12 text-[10px] uppercase tracking-widest font-black italic"
                        onClick={() => {
                          setRecordType(recordType === 'payment' ? null : 'payment');
                          setRecordForm({ ...recordForm, type: 'interest' });
                        }}
                     >
                        Post Payment
                     </Btn>
                     <Btn 
                        variant={recordType === 'fee' ? 'primary' : 'outline'} 
                        className="w-full sm:flex-1 h-12 text-[10px] uppercase tracking-widest font-black italic"
                        onClick={() => {
                          setRecordType(recordType === 'fee' ? null : 'fee');
                          setRecordForm({ ...recordForm, type: 'interest' });
                        }}
                     >
                        Assess Fee
                     </Btn>
                  </div>

                  {recordType && (
                    <form onSubmit={handleRecordSubmit} className="p-5 sm:p-8 bg-slate-900 rounded-[2rem] space-y-6 animate-in zoom-in-95 duration-500">
                       <div className="flex items-center justify-between">
                          <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Record {recordType}</h6>
                          <button type="button" onClick={() => setRecordType(null)} className="text-slate-500 hover:text-white transition-colors"><Zap size={14} /></button>
                       </div>

                       {error && (
                         <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-pulse">
                            <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-relaxed">{error}</p>
                         </div>
                       )}

                       {recordType === 'payment' && (viewModal.paymentsMadeCount || 0) < 2 && (
                         <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest leading-relaxed">
                               Protocol Notice: Borrower has completed {viewModal.paymentsMadeCount || 0}/2 required interest cycles. Principal reduction is currently locked.
                            </p>
                         </div>
                       )}

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Date</label>
                             <input type="date" value={recordForm.date} onChange={e => setRecordForm({...recordForm, date: e.target.value})} className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Category</label>
                             <select value={recordForm.type} onChange={e => setRecordForm({...recordForm, type: e.target.value})} className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-primary/20 uppercase tracking-widest">
                                {recordType === 'payment' ? (
                                   <>
                                      <option value="interest">Interest Payment</option>
                                      <option value="principal" disabled={(viewModal.paymentsMadeCount || 0) < 2}>
                                        Principal Reduction {(viewModal.paymentsMadeCount || 0) < 2 ? '(LOCKED)' : ''}
                                      </option>
                                      <option value="fee">Fee Payment</option>
                                   </>
                                ) : (
                                   <>
                                      <option value="interest">Accrued Interest</option>
                                      <option value="delinquent">Late penalty on overdue monthly payment</option>
                                      <option value="processing">Processing Fee</option>
                                      <option value="other">Other Charge</option>
                                   </>
                                )}
                             </select>
                          </div>
                          <div className="col-span-1 sm:col-span-2 space-y-1">
                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Amount (MXN)</label>
                             <input type="number" step="0.01" value={recordForm.amount} onChange={e => setRecordForm({...recordForm, amount: e.target.value})} className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-primary/20" placeholder="0.00" required />
                          </div>
                          <div className="col-span-1 sm:col-span-2 space-y-1">
                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Note / Description</label>
                             <textarea value={recordForm.note} onChange={e => setRecordForm({...recordForm, note: e.target.value})} className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]" placeholder="Optional description..." />
                          </div>
                       </div>
                       <Btn type="submit" className="w-full h-12 text-[10px] uppercase tracking-widest font-black italic shadow-2xl">Confirm Record Entry</Btn>
                    </form>
                  )}

                  <div className="space-y-4">
                     <Divider text="Ledger History" />
                     
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">Interest & Principal Payments</h6>
                           <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                              <table className="w-full min-w-[600px] text-left">
                                 <thead className="bg-slate-50 border-b border-slate-100">
                                     <tr>
                                        <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Date</th>
                                        <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Type</th>
                                        <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Base</th>
                                        <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Penalty</th>
                                        <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Principal</th>
                                        <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Total</th>
                                        <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Comm.</th>
                                     </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                     {viewModal.payments?.length > 0 ? viewModal.payments.map((p, i) => (
                                        <tr key={i} className="text-[10px] font-bold text-slate-700 hover:bg-slate-50/50 transition-colors">
                                           <td className="px-4 py-3">{formatDateDDMMYYYY(p.date)}</td>
                                           <td className="px-4 py-3">
                                              <span className="uppercase text-[8px] text-primary block">{p.type}</span>
                                              {p.note && <span className="text-[8px] font-normal text-slate-400 line-clamp-1">{p.note}</span>}
                                           </td>
                                           <td className="px-4 py-3 text-right">{formatMoney(p.baseAmount)}</td>
                                           <td className="px-4 py-3 text-right text-rose-500">{p.penaltyAmount > 0 ? formatMoney(p.penaltyAmount) : '-'}</td>
                                           <td className="px-4 py-3 text-right text-emerald-600">{p.principalPaid > 0 ? formatMoney(p.principalPaid) : '-'}</td>
                                           <td className="px-4 py-3 text-right text-slate-900 font-extrabold">{formatMoney(p.totalCollected)}</td>
                                           <td className="px-4 py-3 text-right text-indigo-500">{p.agentCommission > 0 ? formatMoney(p.agentCommission) : '-'}</td>
                                        </tr>
                                     )) : (
                                        <tr><td colSpan="7" className="px-4 py-8 text-center text-[10px] font-bold text-slate-300 uppercase">No payment records</td></tr>
                                     )}
                                  </tbody>
                              </table>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">Administrative Fees</h6>
                           <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                              <table className="w-full min-w-[500px] text-left">
                                 <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                       <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Date</th>
                                       <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Fee Type</th>
                                       <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Amount</th>
                                       <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Status</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {viewModal.fees?.length > 0 ? viewModal.fees.map((f, i) => (
                                       <tr key={i} className="text-[11px] font-bold text-slate-700">
                                          <td className="px-4 py-3">{formatDateDDMMYYYY(f.date)}</td>
                                          <td className="px-4 py-3 uppercase text-[9px] text-amber-500">{f.type}</td>
                                          <td className="px-4 py-3 text-right">{formatMoney(f.amount)}</td>
                                          <td className={`px-4 py-3 text-right uppercase text-[9px] ${f.status === 'paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{f.status}</td>
                                       </tr>
                                    )) : (
                                       <tr><td colSpan="4" className="px-4 py-8 text-center text-[10px] font-bold text-slate-300 uppercase">No fee records</td></tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <Divider text="Collateral Management" />
                           <div className="grid grid-cols-1 gap-4">
                              {viewModal.collateral?.length > 0 ? viewModal.collateral.map((item) => (
                                 <div key={item.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 relative group">
                                    <button 
                                       onClick={() => {
                                          if (!confirm('Are you sure you want to remove this collateral?')) return;
                                          const newCollateral = (viewModal.collateral || []).filter(c => c.id !== item.id);
                                          const updated = { ...viewModal, collateral: newCollateral };
                                          setViewModal(updated);
                                          updateLoan(viewModal.id, { collateral: newCollateral });
                                       }}
                                       className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                       <Trash2 size={16} />
                                    </button>

                                    <div className="flex flex-col sm:flex-row items-start gap-5">
                                       <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                          {item.fileType.includes('image') ? (
                                             <img src={item.fileUrl} className="w-full h-full object-cover" alt="Collateral" />
                                          ) : (
                                             <FileText size={32} className="text-slate-400" />
                                          )}
                                       </div>
                                       <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-3">
                                             <h6 className="text-[13px] font-extrabold text-slate-800">{item.fileName}</h6>
                                             <StatusBadge status={item.status} />
                                          </div>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{item.description}</p>
                                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Uploaded: {formatDateDDMMYYYY(item.uploadedAt)}</p>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100/50">
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Admin Verdict</label>
                                          <div className="flex flex-wrap gap-2">
                                             {['pending', 'verified', 'released'].map(s => (
                                                <button
                                                   key={s}
                                                   onClick={() => {
                                                      const newCollateral = (viewModal.collateral || []).map(c => c.id === item.id ? { ...c, status: s } : c);
                                                      const updated = { ...viewModal, collateral: newCollateral };
                                                      setViewModal(updated);
                                                      updateLoan(viewModal.id, { collateral: newCollateral });
                                                   }}
                                                   className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${item.status === s ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                                                >
                                                   {s}
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Internal Notes</label>
                                          <input 
                                             type="text"
                                             placeholder="Internal admin reference..."
                                             value={item.adminNotes || ''}
                                             onChange={(e) => {
                                                 const newCollateral = (viewModal.collateral || []).map(c => c.id === item.id ? { ...c, adminNotes: e.target.value } : c);
                                                 const updated = { ...viewModal, collateral: newCollateral };
                                                 setViewModal(updated);
                                                 updateLoan(viewModal.id, { collateral: newCollateral });
                                              }}
                                             className="w-full h-10 px-4 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/5 shadow-inner"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              )) : (
                                 <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center bg-slate-50/50">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No collateral documents submitted</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <Btn variant="outline" className="w-full h-14" onClick={() => setViewModal(null)}>Close Dossier</Btn>
                  </div>
               </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
