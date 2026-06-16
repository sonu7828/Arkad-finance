import React, { useMemo, useState } from 'react';
import {
  CheckCircle2, Clock3, Receipt, Search, Database, TrendingUp, Activity, History,
  ShieldAlert, AlertCircle, ChevronRight, Filter, Download, Zap, CreditCard,
  UserCheck, AlertTriangle
} from 'lucide-react';
import { PageTitle, StatusBadge, StatCard, Btn, Input, ProTable, Modal, Divider, FormField } from '../../components/UI';
import { formatDateDDMMYYYY, getDueDateCounter } from '../../utils/dateUtils';
import { calculateLoanDetails } from '../../utils/loanCalculator';
import { useLoans } from '../../context/LoanContext';

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper to compute amount due for a loan
function computeAmountDue(loan) {
  const outstandingPrincipal = loan.remainingPrincipal !== undefined ? loan.remainingPrincipal : loan.principalAmount;
  const isOverdue = loan.dueDate ? getDueDateCounter(loan.dueDate).includes('overdue') : false;
  const delinquentRate = loan.delinquentRate || 12;
  const delinquentPenalty = isOverdue ? (outstandingPrincipal * (delinquentRate / 100)) : 0;
  const interestDue = (outstandingPrincipal * (loan.interestRate || 5) / 100);
  const carriedForward = parseFloat(loan.carriedForwardDue) || 0;
  const amountDue = interestDue + delinquentPenalty + carriedForward;
  return { outstandingPrincipal, isOverdue, delinquentRate, delinquentPenalty, interestDue, carriedForward, amountDue };
}

export default function AdminPayments() {
  const { loans, updateLoan, generateDummyPaymentsData } = useLoans();
  const [search, setSearch] = useState('');
  const [recordedSessions, setRecordedSessions] = useState({});
  const [smsSentText, setSmsSentText] = useState(null);

  // Modal states
  const [activeExactModal, setActiveExactModal] = useState(null);
  const [activePartialModal, setActivePartialModal] = useState(null);
  const [activeOverpaymentModal, setActiveOverpaymentModal] = useState(null);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  // Filter for Active/Late loans
  const activeLoans = useMemo(() => {
    return loans.filter(l => l.status?.toLowerCase() === 'active' || l.status === 'APPROVED' || l.status === 'late');
  }, [loans]);

  // Display list: Show due loans or recently recorded sessions
  const displayedLoans = useMemo(() => {
    const list = loans.filter(l => {
      if (recordedSessions[l.id]) return true;

      const isActiveOrLate = l.status?.toLowerCase() === 'active' || l.status?.toLowerCase() === 'late';
      if (!isActiveOrLate || !l.dueDate) return false;

      const due = new Date(l.dueDate);
      due.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Due from yesterday onwards (dueDate is today or earlier)
      return due <= today;
    });

    return list.filter(l =>
      (l.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.id || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [loans, recordedSessions, search]);

  const handleOpenExact = (loan) => {
    setConfirmCheckbox(false);
    setActiveExactModal(loan);
  };

  const handleCustomSubmit = (loan, value) => {
    const amt = parseFloat(value);
    if (isNaN(amt) || amt <= 0) return;

    const { amountDue, outstandingPrincipal } = computeAmountDue(loan);

    if (amt < amountDue) {
      // Partial payment
      setActivePartialModal({
        loan,
        due: amountDue,
        collected: amt,
        remaining: amountDue - amt
      });
    } else if (amt > amountDue) {
      // Overpayment
      const overpayment = amt - amountDue;
      const newPrincipal = Math.max(0, outstandingPrincipal - overpayment);
      setActiveOverpaymentModal({
        loan,
        due: amountDue,
        collected: amt,
        overpayment,
        newPrincipal,
        nextPayment: newPrincipal * ((loan.interestRate || 5) / 100)
      });
    } else {
      // Exact payment
      handleOpenExact(loan);
    }
  };

  const confirmExactPayment = () => {
    if (!activeExactModal) return;
    const loan = activeExactModal;
    const { amountDue } = computeAmountDue(loan);
    const commissionRate = (loan.agentCommission || 10) / 100;
    const agentComm = Math.round(amountDue * commissionRate * 100) / 100;

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setMonth(newDueDate.getMonth() + 1);

    updateLoan(loan.id, {
      dueDate: newDueDate.toISOString().split('T')[0],
      status: 'active',
      carriedForwardDue: 0,
      agentCommissionUnlocked: (loan.agentCommissionUnlocked || 0) + agentComm,
      payments: [...(loan.payments || []), {
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'interest',
        baseAmount: amountDue,
        totalCollected: amountDue,
        penaltyAmount: 0,
        principalPaid: 0,
        agentCommission: agentComm
      }]
    });

    setRecordedSessions(prev => ({ ...prev, [loan.id]: { collected: amountDue, principalApplied: 0, remaining: 0 } }));
    setSmsSentText(`Payment of ${formatMoney(amountDue)} recorded for ${loan.user?.name || 'client'}. Next due: ${formatDateDDMMYYYY(newDueDate.toISOString().split('T')[0])}`);
    setActiveExactModal(null);
    setConfirmCheckbox(false);
  };

  const confirmPartialPayment = () => {
    if (!activePartialModal) return;
    const { loan, collected, remaining } = activePartialModal;
    const commissionRate = (loan.agentCommission || 10) / 100;
    const agentComm = Math.round(collected * commissionRate * 100) / 100; // Commission ONLY on paid amount

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setMonth(newDueDate.getMonth() + 1);

    updateLoan(loan.id, {
      dueDate: newDueDate.toISOString().split('T')[0],
      carriedForwardDue: remaining, // Only the new remaining carries forward (replaces old carried amount since it was included in amountDue)
      agentCommissionUnlocked: (loan.agentCommissionUnlocked || 0) + agentComm,
      payments: [...(loan.payments || []), {
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'interest',
        baseAmount: collected,
        totalCollected: collected,
        penaltyAmount: 0,
        principalPaid: 0,
        agentCommission: agentComm,
        note: `Partial payment. Remaining: ${formatMoney(remaining)}`
      }]
    });

    setRecordedSessions(prev => ({ ...prev, [loan.id]: { collected, principalApplied: 0, remaining } }));
    setSmsSentText(`Partial payment of ${formatMoney(collected)} recorded. Remaining: ${formatMoney(remaining)}`);
    setActivePartialModal(null);
  };

  const confirmOverpayment = () => {
    if (!activeOverpaymentModal) return;
    const { loan, collected, due, overpayment, newPrincipal } = activeOverpaymentModal;
    const commissionRate = (loan.agentCommission || 10) / 100;
    const agentComm = Math.round(due * commissionRate * 100) / 100; // Commission ONLY on interest portion, NOT on principal reduction

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setMonth(newDueDate.getMonth() + 1);

    updateLoan(loan.id, {
      dueDate: newDueDate.toISOString().split('T')[0],
      remainingPrincipal: newPrincipal,
      carriedForwardDue: 0,
      status: newPrincipal <= 0 ? 'completed' : 'active',
      agentCommissionUnlocked: (loan.agentCommissionUnlocked || 0) + agentComm,
      payments: [...(loan.payments || []), {
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'interest',
        baseAmount: due,
        totalCollected: collected,
        penaltyAmount: 0,
        principalPaid: overpayment,
        agentCommission: agentComm,
        note: `Overpayment. ${formatMoney(overpayment)} applied to principal.`
      }]
    });

    setRecordedSessions(prev => ({ ...prev, [loan.id]: { collected, principalApplied: overpayment, remaining: 0 } }));
    setSmsSentText(`Payment of ${formatMoney(collected)} received! Your outstanding balance reduced by ${formatMoney(overpayment)}.`);
    setActiveOverpaymentModal(null);
  };

  const handleUndo = (loanId) => {
    setRecordedSessions(prev => {
      const next = { ...prev };
      delete next[loanId];
      return next;
    });
  };

  // Auto-generate trial data on mount if nothing is due
  React.useEffect(() => {
    const hasDue = loans.some(l => {
      const isActive = l.status?.toLowerCase() === 'active' || l.status?.toLowerCase() === 'late';
      if (!isActive || !l.dueDate) return false;
      const due = new Date(l.dueDate);
      due.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due <= today;
    });
    if (!hasDue) {
      generateDummyPaymentsData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute amountDue for the exact modal
  const exactModalData = activeExactModal ? computeAmountDue(activeExactModal) : null;

  // Compute summary stats inline
  const dueCount = displayedLoans.filter(l => !recordedSessions[l.id]).length;
  const totalDueAmount = displayedLoans.reduce((sum, l) => {
    if (recordedSessions[l.id]) return sum;
    const { amountDue } = computeAmountDue(l);
    return sum + amountDue;
  }, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* COMPACT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Due Payments & Collections</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage loans due today or overdue and receive payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={generateDummyPaymentsData} className="flex items-center gap-1.5">
            <Database size={12} /> Refresh Trial Data
          </Btn>
        </div>
      </div>

      {/* SMS BANNER */}
      {smsSentText && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wide">
              📲 SMS Sent: "{smsSentText}"
            </p>
          </div>
          <button onClick={() => setSmsSentText(null)} className="text-[9px] font-black text-emerald-600 hover:underline uppercase tracking-wider">
            ✕
          </button>
        </div>
      )}

      {/* COMPACT STATS ROW */}
      <div className="grid grid-cols-3 gap-3">
        <div className="pro-card p-3 flex items-center gap-3 bg-rose-50/50 border-rose-100">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
            <ShieldAlert size={14} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending</p>
            <p className="text-lg font-black text-slate-900 leading-none">{dueCount}</p>
          </div>
        </div>
        <div className="pro-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <CreditCard size={14} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Due</p>
            <p className="text-lg font-black text-slate-900 leading-none">{formatMoney(totalDueAmount)}</p>
          </div>
        </div>
        <div className="pro-card p-3 flex items-center gap-3 bg-slate-50">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Database size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
            <p className="text-lg font-black text-slate-900 leading-none">{activeLoans.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="w-full md:w-72 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
        <input
          className="premium-input pl-10 h-9 text-xs"
          placeholder="Search by name or reference..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      {displayedLoans.length === 0 ? (
        <div className="pro-card p-8 text-center flex flex-col items-center justify-center space-y-3 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Database size={20} className="text-slate-300" />
          <p className="text-slate-600 font-bold text-xs">No loans are currently due or overdue</p>
          <Btn onClick={generateDummyPaymentsData} size="sm" className="flex items-center gap-1.5">
            <Zap size={12} /> Generate Trial Data
          </Btn>
        </div>
      ) : (
        <ProTable headers={[
          { label: 'Borrower' },
          { label: 'Due Date' },
          { label: 'Amount Due' },
          { label: 'Actions', className: 'text-right' }
        ]}>
          {displayedLoans.map((l) => {
            const { outstandingPrincipal, isOverdue, delinquentRate, carriedForward, amountDue } = computeAmountDue(l);
            const counter = getDueDateCounter(l.dueDate);
            const session = recordedSessions[l.id];

            if (session) {
              return (
                <tr key={l.id} className="bg-emerald-50/30 border-l-4 border-emerald-500">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px]">✓</div>
                      <div>
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-black uppercase tracking-widest">RECORDED</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{l.user?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td colSpan="2" className="px-4 py-3">
                    <p className="text-[10px] font-bold text-slate-500">
                      Collected: <span className="text-slate-900">{formatMoney(session.collected)}</span> • Principal: <span className="text-emerald-600">{formatMoney(session.principalApplied)}</span> • Remaining: <span className="text-rose-500">{formatMoney(session.remaining)}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Btn size="sm" variant="danger" className="!py-1 !px-2 text-[9px]" onClick={() => handleUndo(l.id)}>Undo</Btn>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={l.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">
                      {(l.user?.name || 'U')[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">{l.user?.name || 'Unknown'}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{l.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-900">{formatDateDDMMYYYY(l.dueDate)}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isOverdue ? 'text-rose-500' : 'text-amber-500'}`}>
                    {counter}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-black text-slate-900">{formatMoney(amountDue)}</p>
                  {carriedForward > 0 && (
                    <p className="text-[8px] font-bold text-amber-500">+{formatMoney(carriedForward)} carried</p>
                  )}
                  {isOverdue && (
                    <p className="text-[8px] font-medium text-rose-400 italic">+{delinquentRate}% penalty</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Btn size="sm" variant="success" className="!py-1.5 !px-2.5 text-[9px]" onClick={() => handleOpenExact(l)}>
                      ✓ Exact
                    </Btn>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="$Custom"
                        className="premium-input !py-1 !px-2 !w-20 text-[10px] font-bold text-slate-800 h-7"
                        id={`custom-amt-${l.id}`}
                      />
                      <Btn
                        size="sm"
                        variant="primary"
                        className="!py-1.5 !px-2.5 h-7 text-[9px]"
                        onClick={() => {
                          const val = document.getElementById(`custom-amt-${l.id}`).value;
                          handleCustomSubmit(l, val);
                        }}
                      >
                        Go
                      </Btn>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </ProTable>
      )}


      {/* SCENARIO A MODAL — EXACT PAYMENT */}
      <Modal isOpen={!!activeExactModal} onClose={() => setActiveExactModal(null)} title="Confirm Exact Payment">
        {activeExactModal && exactModalData && (
          <div className="space-y-6 pt-2">
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-2">
              <p className="text-xs font-bold text-slate-600">Borrower: <span className="text-slate-900">{activeExactModal.user?.name || 'Unknown'}</span></p>
              <p className="text-xs font-bold text-slate-600">Loan ID: <span className="text-slate-900">{activeExactModal.id}</span></p>
              <p className="text-xs font-bold text-slate-600">Amount Due: <span className="text-slate-900 font-extrabold">{formatMoney(exactModalData.amountDue)}</span></p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-xl">
              <input
                type="checkbox"
                id="confirmCheckboxExact"
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer shrink-0"
              />
              <label htmlFor="confirmCheckboxExact" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                I confirm that {formatMoney(exactModalData.amountDue)} has been collected
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Btn variant="outline" className="flex-1" onClick={() => setActiveExactModal(null)}>Cancel</Btn>
              <Btn
                className="flex-[2] h-12 shadow-lg shadow-emerald-500/20"
                variant="success"
                onClick={confirmExactPayment}
                disabled={!confirmCheckbox}
              >
                Confirm & Record
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* SCENARIO B MODAL — PARTIAL PAYMENT */}
      <Modal isOpen={!!activePartialModal} onClose={() => setActivePartialModal(null)} title="PARTIAL PAYMENT WARNING">
        {activePartialModal && (
          <div className="space-y-6 pt-2 text-left">
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-extrabold uppercase">PARTIAL PAYMENT DETAILS</h4>
                <p className="text-xs font-semibold text-amber-700 mt-1">The borrower is paying less than the amount due.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 font-bold text-slate-700">
              <div className="flex justify-between">
                <span>Amount Due:</span>
                <span>{formatMoney(activePartialModal.due)}</span>
              </div>
              <div className="flex justify-between text-slate-900">
                <span>Amount Collected:</span>
                <span>{formatMoney(activePartialModal.collected)}</span>
              </div>
              <Divider className="my-1 opacity-50" />
              <div className="flex justify-between text-rose-600">
                <span>Remaining Shortfall:</span>
                <span>{formatMoney(activePartialModal.remaining)}</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <p className="text-xs font-bold text-amber-800">
                → Status will be set to: <span className="bg-amber-100 px-2 py-0.5 rounded text-[10px] font-black uppercase">PARTIAL</span>
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase">
                → {formatMoney(activePartialModal.remaining)} carries over to next payment cycle
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Btn variant="outline" className="flex-1 h-12" onClick={() => setActivePartialModal(null)}>Cancel</Btn>
              <Btn
                className="flex-[2] h-12 shadow-lg shadow-amber-500/20"
                variant="primary"
                onClick={confirmPartialPayment}
              >
                Record Payment
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* SCENARIO C MODAL — OVERPAYMENT */}
      <Modal isOpen={!!activeOverpaymentModal} onClose={() => setActiveOverpaymentModal(null)} title="OVERPAYMENT CALIBRATION">
        {activeOverpaymentModal && (
          <div className="space-y-6 pt-2 text-left">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-extrabold uppercase">✓ OVERPAYMENT ACCOUNTING</h4>
                <p className="text-xs font-semibold text-emerald-700 mt-1">The borrower is paying more than the amount due.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 font-bold text-slate-700">
              <div className="flex justify-between">
                <span>Amount Due:</span>
                <span>{formatMoney(activeOverpaymentModal.due)}</span>
              </div>
              <div className="flex justify-between text-slate-900">
                <span>Amount Collected:</span>
                <span>{formatMoney(activeOverpaymentModal.collected)}</span>
              </div>
              <Divider className="my-1 opacity-50" />
              <div className="flex justify-between text-emerald-600">
                <span>Surplus (Overpayment):</span>
                <span>{formatMoney(activeOverpaymentModal.overpayment)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-xs pl-4">
                <span>• Interest Payment Applied:</span>
                <span>{formatMoney(activeOverpaymentModal.due)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 text-xs pl-4 font-extrabold">
                <span>• Principal Reduction Applied:</span>
                <span>{formatMoney(activeOverpaymentModal.overpayment)} ↓</span>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2 text-xs font-bold text-slate-700">
              <div className="flex justify-between">
                <span>Outstanding Principal Balance:</span>
                <span className="text-slate-900 font-extrabold">
                  {formatMoney(activeOverpaymentModal.loan.remainingPrincipal || activeOverpaymentModal.loan.principalAmount)} - {formatMoney(activeOverpaymentModal.overpayment)} = {formatMoney(activeOverpaymentModal.newPrincipal)}
                </span>
              </div>
              <div className="flex justify-between text-primary font-extrabold pt-2 border-t border-primary/10">
                <span>Next Month Payment ({activeOverpaymentModal.loan.interestRate || 5}% of {formatMoney(activeOverpaymentModal.newPrincipal)}):</span>
                <span className="text-sm">{formatMoney(activeOverpaymentModal.nextPayment)}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Btn variant="outline" className="flex-1 h-12" onClick={() => setActiveOverpaymentModal(null)}>Cancel</Btn>
              <Btn
                className="flex-[2] h-12 shadow-lg shadow-emerald-500/20"
                variant="success"
                onClick={confirmOverpayment}
              >
                Record Payment
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
