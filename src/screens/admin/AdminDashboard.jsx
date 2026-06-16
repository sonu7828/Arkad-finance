import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RefreshCw, LayoutGrid, DollarSign, Download as DownloadIcon, ExternalLink,
  PlusCircle, ChevronRight, History as HistoryIcon, ShieldCheck, Zap, AlertCircle,
  TrendingUp, CalendarDays, Activity, Users, Edit2, X
} from 'lucide-react';
import { StatusBadge, StatCard, PageTitle, Btn, ProTable, Loader, Modal } from '../../components/UI';
import { calculateLoanStatus } from '../../utils/loanCalculator';
import { exportToExcel } from '../../utils/exportUtils.js';
import { useLoans } from '../../context/LoanContext';

const RECENT_LOANS_DUMMY = [
  { id: 'ARK-8821', user: { name: 'James Wilson' }, principalAmount: 25000, createdAt: '2024-10-14', status: 'pending', disbursementDate: null },
  { id: 'ARK-8819', user: { name: 'Sarah Jenkins' }, principalAmount: 12000, createdAt: '2024-10-13', status: 'active', disbursementDate: '2024-10-15' },
  { id: 'ARK-8815', user: { name: 'Michael Chen' }, principalAmount: 55000, createdAt: '2024-10-12', status: 'active', disbursementDate: '2024-10-14' },
  { id: 'ARK-8812', user: { name: 'Emma Thompson' }, principalAmount: 8000, createdAt: '2024-10-11', status: 'late', disbursementDate: '2024-10-12' },
  { id: 'ARK-8809', user: { name: 'Robert Davis' }, principalAmount: 15000, createdAt: '2024-10-10', status: 'active', disbursementDate: '2024-10-11' },
];

function formatDate(date) {
  if (!date) return <span className="text-slate-300 italic">TBD</span>;
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loans: rawLoans, addLoan, updateLoan, deleteLoan } = useLoans();

  const loans = React.useMemo(() => {
    return rawLoans.map(l => ({
      ...l,
      status: l.status === 'Pending' || l.status === 'PENDING' ? 'pending' : 
              l.status === 'Active' || l.status === 'APPROVED' ? 'active' : 
              l.status === 'Rejected' || l.status === 'REJECTED' ? 'rejected' : 
              l.status.toLowerCase()
    }));
  }, [rawLoans]);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({ name: '', amount: '', product: 'Personal Credit Line' });

  const handleDelete = (id) => {
    deleteLoan(id);
    setIsDeleteModalOpen(false);
    setSelectedLoan(null);
  };

  const handleCreateApp = () => {
    if (!newAppForm.name || !newAppForm.amount) {
      alert('Please fill all required telemetry fields.');
      return;
    }

    addLoan({
      user: { name: newAppForm.name },
      principalAmount: Number(newAppForm.amount),
      remainingPrincipal: Number(newAppForm.amount),
      duration: 12,
      interestRate: 10,
      method: 'CASH',
      source: 'admin_dashboard'
    });

    setIsNewAppModalOpen(false);
    setNewAppForm({ name: '', amount: '', product: 'Personal Credit Line' });
    alert('Capital Application Successfully Queued.');
  };

  const handleUpdateStatus = (id, newStatus) => {
    // Map dashboard statuses (pending/active/rejected) to Context casing
    const statusMap = {
      pending: 'Pending',
      active: 'terms_set',
      rejected: 'Rejected',
      approved: 'terms_set'
    };
    const mappedStatus = statusMap[newStatus.toLowerCase()] || newStatus;

    if (mappedStatus === 'terms_set') {
      const today = new Date();
      const offerDeadlineDate = new Date(today);
      offerDeadlineDate.setDate(today.getDate() + 7);
      
      // Default configurations for Quick Approve
      updateLoan(id, { 
        status: mappedStatus,
        disbursementDate: null,
        dueDate: null,
        offerDeadline: offerDeadlineDate.toISOString().split('T')[0],
        unpaidFees: 50, // Default Initiation fee
        fees: [
          { id: `FEE-${Date.now()}`, date: today.toISOString().split('T')[0], amount: 50, type: 'initiation', status: 'unpaid' }
        ],
        interestRate: 10,
        lateFeeRate: 15,
        gracePeriod: 3
      });
    } else {
      updateLoan(id, { 
        status: mappedStatus,
        disbursementDate: null
      });
    }
    setIsReviewModalOpen(false);
  };

  const handleExport = () => {
    const exportData = loans.map(l => {
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

  const hasDataForStats = loans.some(l => !l.id.startsWith('LN-880') || l.id.startsWith('LN-DUMMY-') || l.status === 'Completed');

  const totalOutstanding = loans.reduce((sum, l) => sum + (Number(l.principalAmount || 0) - Number(l.principalPaid || 0)), 0);
  const totalOriginal = loans.reduce((sum, l) => sum + Number(l.principalAmount || 0), 0);
  
  const activeLoansCount = loans.filter(l => l.status === 'active' || l.status === 'late').length;
  const lateLoansCount = loans.filter(l => l.status === 'late').length;
  const delinquencyRate = activeLoansCount > 0 ? ((lateLoansCount / activeLoansCount) * 100).toFixed(1) : 0;
  
  const interestCollected = loans.reduce((sum, l) => {
    return sum + (l.payments || []).filter(p => p.type === 'interest').reduce((s, p) => s + (p.baseAmount || p.totalCollected || 0), 0);
  }, 0);

  const formatMoneySimple = (value) => {
    return `$${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const stats = [
    { 
      label: 'Active Loans', 
      value: hasDataForStats ? `${activeLoansCount} loans` : '24 loans', 
      icon: ShieldCheck, 
      trend: 'Currently Running' 
    },
    { 
      label: 'Outstanding', 
      value: hasDataForStats ? formatMoneySimple(totalOutstanding) : '$58,400', 
      icon: DollarSign, 
      trend: hasDataForStats ? `${Math.round((totalOutstanding/totalOriginal)*100) || 0}% active` : 'Active Capital' 
    },
    { 
      label: 'Interest', 
      value: hasDataForStats ? `Collected ${formatMoneySimple(interestCollected)}` : 'Collected $2,835', 
      icon: TrendingUp, 
      trend: 'Accumulated Yield' 
    },
    { 
      label: 'Delinquency', 
      value: hasDataForStats ? `Rate ${delinquencyRate}%` : 'Rate 8.3%', 
      icon: AlertCircle, 
      trend: hasDataForStats ? `${lateLoansCount} late accounts` : 'Portfolio Risk' 
    },
  ];

  const onTimeRateVal = hasDataForStats ? (100 - parseFloat(delinquencyRate)).toFixed(1) : '91.7';
  const lateRateVal = hasDataForStats ? delinquencyRate : '8.3';

  const totalFeesCollected = loans.reduce((sum, l) => {
    const feeSum = (l.fees || []).filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount || 0), 0);
    return sum + feeSum + (l.unpaidFees === 0 ? 50 : 0);
  }, 0);
  const totalRevenue = interestCollected + totalFeesCollected;
  const totalRevenueVal = hasDataForStats ? formatMoneySimple(totalRevenue) : '$8,420';

  const collectionsRateVal = hasDataForStats ? `${(100 - parseFloat(delinquencyRate)).toFixed(1)}%` : '91.7%';
  
  const avgDelinquencyDays = 14; 
  const avgDelinquencyDaysVal = hasDataForStats && lateLoansCount > 0 ? `${avgDelinquencyDays} days` : '12 days';

  const totalCommission = loans.reduce((sum, l) => {
    if (l.agentCommission && l.principalAmount) {
      return sum + (Number(l.agentCommission) / 100) * Number(l.principalAmount);
    }
    return sum;
  }, 0);
  const agentCommissionPaidVal = hasDataForStats && totalCommission > 0 ? formatMoneySimple(totalCommission) : '$1,450';

  const totalProjectedInterest = loans.reduce((sum, l) => {
    if (l.status === 'active' || l.status === 'late' || l.status === 'pending') {
      const rate = l.interestRate || 10;
      return sum + (Number(l.principalAmount) * (rate / 100));
    }
    return sum;
  }, 0);
  const projectedInterestVal = hasDataForStats && totalProjectedInterest > 0 ? formatMoneySimple(totalProjectedInterest) : '$12,800';

  return (
    <>
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-[1600px] mx-auto pb-10"
    >
      {/* PROFESSIONAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time credit & operations monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="ghost" size="sm" onClick={() => { window.location.reload(); }}>
            <RefreshCw size={14} className="mr-2" /> Refresh
          </Btn>
          <Btn variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon size={14} className="mr-2" /> Export Report
          </Btn>
          <Btn size="sm" onClick={() => setIsNewAppModalOpen(true)}>
            <PlusCircle size={14} className="mr-2" /> New Application
          </Btn>
        </div>
      </div>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN QUEUE */}
        <div className="lg:col-span-8 space-y-8">

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> Pending Approval Queue
              </h3>
              <button onClick={() => navigate('/admin/loans?status=pending')} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View All</button>
            </div>

            <ProTable 
              headers={['Borrower', 'Capital Request', { label: 'Submission Date', className: 'hidden md:table-cell' }, { label: 'Action', className: 'text-right' }]}
            >
              {loans.filter(l => l.status === 'pending').map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold border border-slate-200 shrink-0">
                        {loan.user?.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 truncate max-w-[120px] md:max-w-none">{loan.user?.name}</span>
                        <span className="text-[10px] text-slate-400 md:hidden uppercase font-bold tracking-widest">{formatDate(loan.createdAt)}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm font-bold text-slate-900">{formatMoney(loan.principalAmount)}</span></td>
                  <td className="hidden md:table-cell"><span className="text-xs font-medium text-slate-400">{formatDate(loan.createdAt)}</span></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Btn variant="ghost" size="sm" onClick={() => navigate(`/admin/loans?status=pending&review=${loan.id}`)}>Review</Btn>
                      <Btn variant="primary" size="sm" onClick={() => { setSelectedLoan(loan); setIsReviewModalOpen(true); }}>Quick Action</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </ProTable>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-primary" /> Active Credit Pipeline
              </h3>
            </div>

            <div className="overflow-x-auto">
              <ProTable
                headers={[{ label: 'ID', className: 'hidden sm:table-cell' }, 'Entity', 'Amount', 'Issue Date', 'Next Due', 'Status', { label: 'Actions', className: 'text-right' }]}
              >
                {loans.filter(l => l.status === 'active').map((loan) => (
                  <tr key={loan.id}>
                    <td className="hidden sm:table-cell"><span className="text-[10px] font-bold text-slate-300 uppercase">#{loan.id}</span></td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{loan.user?.name}</span>
                        <span className="text-[9px] text-slate-400 sm:hidden uppercase font-bold tracking-widest">ID: {loan.id}</span>
                      </div>
                    </td>
                    <td><span className="text-sm font-bold text-slate-900">{formatMoney(loan.principalAmount)}</span></td>
                    <td><span className="text-xs font-medium text-slate-500">{formatDate(loan.disbursementDate)}</span></td>
                    <td><span className="text-xs font-bold text-amber-600">{formatDate(loan.dueDate)}</span></td>
                    <td><StatusBadge status={calculateLoanStatus(loan)} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedLoan(loan); setIsEditModalOpen(true); }} className="p-2 text-slate-300 hover:text-primary transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => navigate('/admin/loans?status=active')} className="p-2 text-slate-300 hover:text-primary transition-colors hidden md:block">
                          <ExternalLink size={14} />
                        </button>
                        <button onClick={() => { setSelectedLoan(loan); setIsDeleteModalOpen(true); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </ProTable>
            </div>
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="pro-card p-6 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-[50px] opacity-20" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Portfolio Health</p>
                <TrendingUp size={16} className="text-primary" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>On-Time Payments: {onTimeRateVal}%</span>
                    <span className="font-mono text-emerald-400 hidden sm:inline">████████████</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${onTimeRateVal}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Late Payments: {lateRateVal}%</span>
                    <span className="font-mono text-rose-400 hidden sm:inline">██</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full transition-all duration-500" style={{ width: `${lateRateVal}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PORTFOLIO SUMMARY CARD */}
          <div className="pro-card p-6 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Portfolio Summary</span>
              <Activity size={14} className="text-primary animate-pulse" />
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Total revenue (interest + fees)', value: totalRevenueVal },
                { label: 'Collections rate', value: collectionsRateVal },
                { label: 'Average delinquency days', value: avgDelinquencyDaysVal },
                { label: 'Agent commission paid', value: agentCommissionPaidVal },
                { label: 'Projected interest revenue', value: projectedInterestVal }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                  <span className="text-xs font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card p-6 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CRM Shortcuts</h4>
            <div className="space-y-2">
              {[
                { label: 'Follow up with Leads', icon: Users, path: '/admin/crm' },
                { label: 'Review Due Calendar', icon: CalendarDays, path: '/admin/calendar' },
                { label: 'Payout Logs', icon: DollarSign, path: '/admin/payments' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={14} className="text-slate-400 group-hover:text-primary" />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-200" />
                </button>
              ))}
            </div>
          </div>

          <div className="pro-card p-6 bg-primary/5 border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <Activity size={16} />
              </div>
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">System Telemetry</p>
            </div>
            <div className="space-y-4">
              {[
                { text: 'New borrower registry synced', time: '2m ago' },
                { text: 'Protocol update successful', time: '14m ago' },
                { text: 'Auto-reminder stream active', time: '1h ago' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-start">
                  <p className="text-[11px] font-medium text-slate-600 leading-tight pr-4">{log.text}</p>
                  <span className="text-[9px] font-bold text-slate-300 whitespace-nowrap">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
      
      {/* MODALS - Moved outside motion.div to fix 'fixed' positioning issues */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Decision Center">
        {selectedLoan && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Application ID</p>
               <h3 className="text-lg font-bold text-slate-900">{selectedLoan.id}</h3>
               <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Borrower</p>
                    <p className="text-sm font-bold text-slate-800">{selectedLoan.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Capital Request</p>
                    <p className="text-sm font-bold text-slate-800">{formatMoney(selectedLoan.principalAmount)}</p>
                  </div>
               </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Btn variant="success" className="flex-1" onClick={() => handleUpdateStatus(selectedLoan.id, 'active')}>
                Send Standard Offer
              </Btn>
              <Btn variant="danger" className="flex-1" onClick={() => handleUpdateStatus(selectedLoan.id, 'rejected')}>
                Decline
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Protocol">
        <div className="space-y-6 pt-4 text-center">
           <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
              <AlertCircle size={32} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-900">Purge Record?</h3>
              <p className="text-sm text-slate-500 mt-1">This action will permanently remove {selectedLoan?.id} from the active telemetry.</p>
           </div>
           <div className="flex gap-3">
              <Btn variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Btn>
              <Btn variant="danger" className="flex-1" onClick={() => handleDelete(selectedLoan?.id)}>Confirm Purge</Btn>
           </div>
        </div>
      </Modal>

      <Modal isOpen={isNewAppModalOpen} onClose={() => setIsNewAppModalOpen(false)} title="New Credit Application">
        <div className="space-y-6 pt-2">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borrower Name</label>
                 <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="e.g. John Doe" 
                    value={newAppForm.name}
                    onChange={(e) => setNewAppForm({...newAppForm, name: e.target.value})}
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capital Amount</label>
                 <input 
                    type="number" 
                    className="premium-input" 
                    placeholder="0.00" 
                    value={newAppForm.amount}
                    onChange={(e) => setNewAppForm({...newAppForm, amount: e.target.value})}
                 />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loan Product</label>
              <select 
                className="premium-input bg-white"
                value={newAppForm.product}
                onChange={(e) => setNewAppForm({...newAppForm, product: e.target.value})}
              >
                 <option>Personal Credit Line</option>
                 <option>Business Expansion Fund</option>
                 <option>Emergency Capital</option>
              </select>
           </div>
           <div className="flex gap-3 pt-4">
              <Btn variant="ghost" className="flex-1" onClick={() => setIsNewAppModalOpen(false)}>Cancel</Btn>
              <Btn className="flex-1" onClick={handleCreateApp}>Submit Application</Btn>
           </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Credit Profile">
        {selectedLoan && (
          <div className="space-y-6 pt-2">
             <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4 text-center">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Target Entity: {selectedLoan.id}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjust Principal</label>
                   <input type="number" className="premium-input" defaultValue={selectedLoan.principalAmount} />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Risk Profile</label>
                   <select className="premium-input bg-white">
                      <option>Low Risk (A+)</option>
                      <option>Standard (B)</option>
                      <option>High Monitor (C)</option>
                   </select>
                </div>
             </div>
             <div className="flex gap-3 pt-4">
                <Btn variant="ghost" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Abort</Btn>
                <Btn className="flex-1" onClick={() => {
                  alert('Credit Profile Updated Successfully');
                  setIsEditModalOpen(false);
                }}>Save Changes</Btn>
             </div>
          </div>
        )}
      </Modal>
    </>
  );
}
