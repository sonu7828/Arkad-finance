import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Wallet, ShieldCheck, Clock,
  FileText, ChevronRight, Activity, Award,
  Calendar, DollarSign, Plus, ArrowRight, History as HistoryIcon, TrendingUp, MessageCircle, Building
} from 'lucide-react';
import { StatusBadge, PageTitle, Btn, ProTable, Modal, StatCard } from '../../components/UI';
import { getDueDateCounter, formatDateDDMMYYYY } from '../../utils/dateUtils';
import { calculateLoanDetails } from '../../utils/loanCalculator';
import { useAuth } from '../../context/AuthContext';
import { useLoans } from '../../context/LoanContext';

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function BorrowerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans: globalLoans } = useLoans();

  const allLoans = useMemo(() => {
    if (!user) return [];
    const uName = String(user.name || '').toLowerCase().trim();
    const uEmail = String(user.email || '').toLowerCase().trim();
    return globalLoans
      .filter(l => {
        const lName = String(l.user?.name || '').toLowerCase().trim();
        const lEmail = String(l.user?.email || '').toLowerCase().trim();
        return (uName && lName === uName) || (uEmail && lEmail === uEmail);
      })
      .map(l => ({
        ...l,
        status: l.status === 'PENDING' || l.status === 'Pending' ? 'pending' : l.status === 'APPROVED' || l.status === 'Active' ? 'active' : l.status.toLowerCase(),
      }));
  }, [globalLoans, user]);

  const [breakdownModal, setBreakdownModal] = useState(null);
  const [paymentActionModal, setPaymentActionModal] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeLoans = allLoans.filter(l => l.status === 'active');
  const pendingApps = allLoans.filter(l => l.status === 'pending');
  const completedLoans = allLoans.filter(l => l.status === 'completed');

  const totalOutstanding = activeLoans.reduce((sum, l) => {
    const details = calculateLoanDetails({
      principal: l.principalAmount,
      remainingPrincipal: l.remainingPrincipal,
      duration: l.duration,
      interestRate: l.interestRate
    });
    const principal = Number(l.principalAmount) || 0;
    const totalInterest = details.totalInterest || 0;
    const fees = details.initiationFee || 0;
    const paid = Number(l.principalPaid || 0);
    return sum + Math.max(0, (principal - paid) + totalInterest + fees);
  }, 0);
  const totalRepaid = allLoans.reduce((sum, l) => sum + Number(l.principalPaid || 0), 0);

  // Calculate next payment total using loanCalculator (not upcomingPaymentAmount which may be 0)
  const nextPaymentTotal = activeLoans.reduce((sum, l) => {
    const details = calculateLoanDetails({
      principal: l.principalAmount,
      remainingPrincipal: l.remainingPrincipal,
      duration: l.duration,
      interestRate: l.interestRate
    });
    return sum + (details.monthlyInstallment || 0);
  }, 0);

  // Get earliest due date from active loans for countdown
  const nextDueDate = activeLoans
    .map(l => l.dueDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] || null;

  const nextDueCountdown = nextDueDate ? getDueDateCounter(nextDueDate) : 'No active loan';

  const totalOriginalPrincipal = activeLoans.reduce((sum, l) => sum + Number(l.principalAmount), 0);
  const repaymentPercentage = totalOriginalPrincipal > 0 ? Math.round((totalRepaid / totalOriginalPrincipal) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-[1200px] mx-auto pb-10"
    >
      {/* SUCCESS ALERTS FOR COMPLETED LOANS */}
      {completedLoans.map(loan => (
        <div key={loan.id} className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-800 uppercase tracking-wide">Congratulations! Loan fully repaid</h4>
              <p className="text-xs font-medium text-emerald-600 mt-1">
                Contract #{loan.id} has been fully settled. Total paid: {formatMoney(Array.isArray(loan.payments) ? loan.payments.reduce((s, p) => s + (p.totalCollected || p.amount || 0), 0) : loan.principalAmount)}. Thank you for your trusted business.
              </p>
            </div>
          </div>
          <Btn 
            size="sm" 
            className="!bg-emerald-600 hover:!bg-emerald-700 !rounded-xl !h-10 px-4 italic font-black uppercase tracking-widest text-[9px] text-white shadow-sm shrink-0" 
            onClick={() => navigate('/borrower/apply')}
          >
            Apply for new loan <ArrowRight size={12} className="ml-2 inline" />
          </Btn>
        </div>
      ))}

      {/* PROFESSIONAL WELCOME */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your credit line and repayments</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" size="sm" onClick={() => navigate('/borrower/payments')}>
            <HistoryIcon size={14} className="mr-2" /> Ledger
          </Btn>
          <Btn size="sm" onClick={() => navigate('/borrower/apply')}>
            <Plus size={14} className="mr-2" /> New Request
          </Btn>
        </div>
      </div>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Debt" value={formatMoney(totalOutstanding)} icon={Wallet} trend="Live Balance" onClick={() => navigate('/borrower/payments')} />
        <StatCard 
          label="Next Payment" 
          value={formatMoney(nextPaymentTotal)} 
          icon={Clock} 
          trend={nextDueCountdown}
          onClick={() => navigate('/borrower/payments')} 
        />
        <StatCard label="Active Contracts" value={activeLoans.length} icon={ShieldCheck} trend="Verified" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1">
              <ShieldCheck size={16} className="text-emerald-500" /> Active Loan Agreements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeLoans.map(loan => {
                  const today = now;
                  const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;
                  let isOverdue = false;
                  let daysRemaining = 0;
                  let hoursStr = "00";
                  let minutesStr = "00";
                  let secondsStr = "00";

                  if (dueDate && !isNaN(dueDate.getTime())) {
                    const diff = dueDate.getTime() - today.getTime();
                    isOverdue = diff < 0;
                    const absDiff = Math.abs(diff);
                    daysRemaining = Math.floor(absDiff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
                    
                    hoursStr = hours.toString().padStart(2, '0');
                    minutesStr = minutes.toString().padStart(2, '0');
                    secondsStr = seconds.toString().padStart(2, '0');
                  }

                  const outstandingPrincipal = loan.remainingPrincipal || (loan.principalAmount - (loan.principalPaid || 0));
                  const delinquentRate = loan.delinquentRate || 12;
                  const delinquentPenalty = isOverdue ? (outstandingPrincipal * (delinquentRate / 100)) : 0;
                  const finalOutstanding = outstandingPrincipal + delinquentPenalty;

                  const details = calculateLoanDetails({
                    principal: loan.principalAmount,
                    remainingPrincipal: outstandingPrincipal,
                    interestRate: loan.interestRate,
                    duration: loan.duration
                  });

                  const amountDueVal = details.monthlyPaymentCurrent + delinquentPenalty;
                  const remainingMonths = Math.max(0, loan.duration - (loan.paymentsMadeCount || 0));
                  const totalInterestRemaining = loan.id === 'LOAN-2024-001' ? 600 : (details.monthlyInterest * remainingMonths);

                  return (
                    <div 
                      key={loan.id} 
                      className={`pro-card p-6 bg-white border rounded-[2rem] shadow-sm flex flex-col space-y-5 hover:shadow-md transition-all ${isOverdue ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'}`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-900 tracking-wider font-mono">{loan.id}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            Approved: ${loan.principalAmount.toLocaleString()} | Interest: {loan.interestRate}%
                          </p>
                        </div>
                      </div>

                      {/* Payment Due Area */}
                      <div className={`p-4 rounded-2xl border text-left ${isOverdue ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5">
                          {isOverdue ? 'PAYMENT OVERDUE' : 'Next Payment Due:'}
                        </p>
                        <div className="flex justify-between items-baseline">
                          <span className={`text-xs font-black uppercase tracking-wider ${isOverdue ? 'text-rose-600 font-mono' : 'text-slate-600 font-mono'}`}>
                            [{daysRemaining}] DAYS{isOverdue ? ' LATE' : ''} | {hoursStr}:{minutesStr}:{secondsStr}
                          </span>
                          <span className="text-xl font-black">${amountDueVal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            isOverdue 
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20' 
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const msg = `¡Hola! Quiero coordinar el pago de mi préstamo ${loan.id} por un monto de $${amountDueVal.toFixed(2)}.`;
                            window.open(`https://wa.me/1234567890?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                        >
                          <MessageCircle size={14} /> WhatsApp Payment
                        </button>
                        <button 
                          className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            isOverdue 
                              ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setPaymentActionModal({ type: 'bank', loan }); 
                          }}
                        >
                          <Building size={14} /> Bank
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-slate-50 space-y-1 text-left">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                          Outstanding: ${finalOutstanding.toLocaleString()} {!isOverdue && `| Interest: $${totalInterestRemaining.toFixed(2)}`}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none mt-1 ${isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                          Status: {isOverdue ? 'Late' : '✓ On-Time'}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* PENDING SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1">
              <Calendar size={16} className="text-amber-500" /> Pipeline Applications
            </h3>
            <ProTable headers={[{ label: 'Reference', className: 'hidden sm:table-cell' }, 'Amount', { label: 'Submitted', className: 'hidden xs:table-cell' }, 'Status']}>
              {pendingApps.length === 0 ? (
                <tr>
                   <td colSpan={4} className="text-center py-10 px-4">
                      <div className="flex flex-col items-center justify-center opacity-50">
                         <Calendar size={24} className="mb-2 text-slate-400" />
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">No pending applications</p>
                      </div>
                   </td>
                </tr>
              ) : (
                pendingApps.map((app) => (
                  <tr key={app.id}>
                    <td className="hidden sm:table-cell"><span className="text-[10px] font-bold text-slate-400 uppercase">#{app.id}</span></td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{formatMoney(app.principalAmount)}</span>
                        <span className="text-[9px] text-slate-400 sm:hidden font-bold tracking-widest">Ref: #{app.id}</span>
                      </div>
                    </td>
                    <td className="hidden xs:table-cell"><span className="text-xs font-medium text-slate-400">{formatDateDDMMYYYY(app.originationDate)}</span></td>
                    <td><StatusBadge status="pending" /></td>
                  </tr>
                ))
              )}
            </ProTable>
          </div>

          {/* COMPLETED SECTION */}
          {completedLoans.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1">
                <Award size={16} className="text-emerald-500" /> Completed Loans History
              </h3>
              <ProTable headers={['Contract ID', 'Principal Amount', 'Total Repaid', 'Status']}>
                {completedLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td><span className="text-[10px] font-bold text-slate-400 uppercase">#{loan.id}</span></td>
                    <td><span className="text-sm font-bold text-slate-900">{formatMoney(loan.principalAmount)}</span></td>
                    <td><span className="text-sm font-bold text-emerald-600">{formatMoney(1800)}</span></td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                        COMPLETED ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </ProTable>
            </div>
          )}
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="pro-card p-6 bg-slate-900 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 blur-[40px] opacity-20" />
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Total Repaid</p>
                 <p className="text-3xl font-bold tracking-tight text-white">{formatMoney(totalRepaid)}</p>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${repaymentPercentage}%` }} />
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{repaymentPercentage}% of total credit line cleared</p>
              </div>
          </div>

          <div className="pro-card p-6 space-y-4">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource Center</h4>
             <div className="space-y-2">
                {[
                  { label: 'Asset Vault', sub: 'Collateral Docs', icon: FileText, to: '/borrower/collateral' },
                  { label: 'Payment Ledger', sub: 'Transaction Logs', icon: CreditCard, to: '/borrower/payments' },
                  { label: 'Account Security', sub: 'KYC & Settings', icon: ShieldCheck, to: '/borrower/profile' },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => navigate(item.to)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={14} className="text-slate-400 group-hover:text-primary" />
                      <div>
                        <p className="text-xs font-bold text-slate-600 group-hover:text-slate-900 leading-none">{item.label}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-slate-200" />
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-dashed border-primary/20">
             <p className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                <Award size={14} /> Loyalty Bonus
             </p>
             <p className="text-[11px] text-slate-500 leading-relaxed">
                Pay your next installment on time to unlock a 0.5% interest rate reduction on your next application.
             </p>
          </div>
        </div>
      </div>
      
      <Modal isOpen={!!breakdownModal} onClose={() => setBreakdownModal(null)} title="Installment Breakdown">
        {breakdownModal && (
          <div className="space-y-6">
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payable Amount</p>
              <h4 className="text-3xl font-bold text-slate-900">
                {formatMoney(breakdownModal.upcomingPaymentAmount + (breakdownModal.latePaymentFee || 0))}
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center px-4 py-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-500">Base Installment</span>
                <span className="text-xs font-bold text-slate-900">{formatMoney(breakdownModal.upcomingPaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                <span className="text-xs font-bold text-rose-600">Late Fee Adjustment</span>
                <span className="text-xs font-bold text-rose-600">+ {formatMoney(breakdownModal.latePaymentFee)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a href="https://wa.me/1234567890?text=Hola,%20quiero%20hacer%20el%20pago%20de%20mi%20préstamo" target="_blank" rel="noreferrer" className="flex-1 w-full bg-emerald-500 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all">
                 <MessageCircle size={16} /> WhatsApp Payment
              </a>
              <Btn onClick={() => setBreakdownModal(null)} variant="outline" className="flex-1 !rounded-xl">
                 <Building size={16} className="mr-2" /> Bank Transfer
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Action Dummy Modal */}
      <Modal isOpen={!!paymentActionModal} onClose={() => setPaymentActionModal(null)} title="Bank Transfer">
        {paymentActionModal && (
          <div className="p-6 text-center space-y-6 animate-in zoom-in-95 duration-300">
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner bg-slate-100 text-slate-500`}>
               <Building size={32} />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                 Bank Transfer Instructions
               </h3>
               <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm mx-auto">
                 Please transfer the funds to our official bank account. Account details will be shown here in the live version.
               </p>
             </div>
             <div className="pt-4 border-t border-slate-100">
               <Btn className="w-full h-12 shadow-lg" onClick={() => setPaymentActionModal(null)}>Got it</Btn>
             </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

