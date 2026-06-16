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
      l.user?.name.toLowerCase().includes(search.toLowerCase()) || 
      l.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [loans, recordedSessions, search]);

  const handleOpenExact = (loan) => {
    setConfirmCheckbox(false);
    setActiveExactModal(loan);
  };

  const handleCustomSubmit = (loan, inputVal) => {
    const collected = parseFloat(inputVal);
    if (isNaN(collected) || collected <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    const outstandingPrincipal = loan.remainingPrincipal !== undefined ? loan.remainingPrincipal : loan.principalAmount;
    const isOverdue = getDueDateCounter(loan.dueDate).includes('overdue');
    const delinquentRate = loan.delinquentRate || 12;
    const delinquentPenalty = isOverdue ? (outstandingPrincipal * (delinquentRate / 100)) : 0;
    const interestDue = (outstandingPrincipal * (loan.interestRate || 5) / 100);
    const amountDue = interestDue + delinquentPenalty;

    if (collected < amountDue) {
      setActivePartialModal({
        loan,
        collected,
        due: amountDue,
        remaining: amountDue - collected
      });
    } else if (collected > amountDue) {
      const surplus = collected - amountDue;
      const newPrincipal = Math.max(0, outstandingPrincipal - surplus);
      const nextPayment = newPrincipal * (loan.interestRate || 5) / 100;
      setActiveOverpaymentModal({
        loan,
        collected,
        due: amountDue,
        overpayment: surplus,
        newPrincipal,
        nextPayment
      });
    } else {
      setConfirmCheckbox(false);
      setActiveExactModal(loan);
    }
  };

  const confirmExactPayment = () => {
    if (!confirmCheckbox) return;
    const loan = activeExactModal;
    const originalLoan = { ...loan };

    const outstandingPrincipal = loan.remainingPrincipal !== undefined ? loan.remainingPrincipal : loan.principalAmount;
    const isOverdue = getDueDateCounter(loan.dueDate).includes('overdue');
    const delinquentRate = loan.delinquentRate || 12;
    const delinquentPenalty = isOverdue ? (outstandingPrincipal * (delinquentRate / 100)) : 0;
    const interestDue = (outstandingPrincipal * (loan.interestRate || 5) / 100);
    const amountDue = interestDue + delinquentPenalty;

    const paymentObj = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: amountDue,
      type: 'EXACT',
      status: 'PAID'
    };

    const nextDueDate = new Date(loan.dueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const updatedLoan = {
      ...loan,
      dueDate: nextDueDate.toISOString().split('T')[0],
      payments: [...(loan.payments || []), paymentObj],
      remainingPrincipal: outstandingPrincipal,
      status: 'active'
    };

    updateLoan(loan.id, updatedLoan);

    setRecordedSessions(prev => ({
      ...prev,
      [loan.id]: {
        collected: amountDue,
        principalApplied: 0,
        remaining: 0,
        originalLoan
      }
    }));

    setActiveExactModal(null);
  };

  const confirmPartialPayment = () => {
    const { loan, collected, due, remaining } = activePartialModal;
    const originalLoan = { ...loan };

    const paymentObj = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: collected,
      type: 'PARTIAL',
      status: 'PARTIAL'
    };

    const nextDueDate = new Date(loan.dueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const updatedLoan = {
      ...loan,
      dueDate: nextDueDate.toISOString().split('T')[0],
      payments: [...(loan.payments || []), paymentObj],
      carriedForwardDue: (loan.carriedForwardDue || 0) + remaining,
      status: 'active'
    };

    updateLoan(loan.id, updatedLoan);

    setRecordedSessions(prev => ({
      ...prev,
      [loan.id]: {
        collected,
        principalApplied: 0,
        remaining,
        originalLoan
      }
    }));

    setActivePartialModal(null);
  };

  const confirmOverpayment = () => {
    const { loan, collected, due, overpayment, newPrincipal, nextPayment } = activeOverpaymentModal;
    const originalLoan = { ...loan };

    const paymentObj = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: collected,
      type: 'OVERPAYMENT',
      status: 'PAID'
    };

    const nextDueDate = new Date(loan.dueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const updatedLoan = {
      ...loan,
      dueDate: nextDueDate.toISOString().split('T')[0],
      payments: [...(loan.payments || []), paymentObj],
      remainingPrincipal: newPrincipal,
      status: newPrincipal <= 0 ? 'COMPLETED' : 'active'
    };

    updateLoan(loan.id, updatedLoan);

    setRecordedSessions(prev => ({
      ...prev,
      [loan.id]: {
        collected,
        principalApplied: overpayment,
        remaining: 0,
        originalLoan
      }
    }));

    setSmsSentText(`Payment of $${collected.toFixed(2)} recorded! Principal reduced by $${overpayment.toFixed(2)}`);
    setActiveOverpaymentModal(null);
  };

  const handleUndo = (loanId) => {
    const session = recordedSessions[loanId];
    if (session) {
      updateLoan(loanId, session.originalLoan);
      setRecordedSessions(prev => {
        const copy = { ...prev };
        delete copy[loanId];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Due Payments & Collections" 
        subtitle="Manage loans due today or overdue and receive payments" 
      />

      {smsSentText && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
            <p className="text-xs font-bold uppercase tracking-wide">
              📲 SMS Sent to client: "{smsSentText}"
            </p>
          </div>
          <button onClick={() => setSmsSentText(null)} className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-wider">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pro-card p-6 bg-rose-50 border-rose-100">
          <StatCard label="Loans Due / Overdue" value={activeLoans.filter(l => {
            if (!l.dueDate) return false;
            const due = new Date(l.dueDate);
            due.setHours(0,0,0,0);
            return due <= new Date();
          }).length} icon={ShieldAlert} color="text-rose-500" />
        </div>
        <div className="pro-card p-6 bg-slate-50">
          <StatCard label="Total Active Loans" value={activeLoans.length} icon={Database} color="text-slate-600" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="w-full md:w-80 relative group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
             <input 
                className="premium-input pl-12 h-12"
                placeholder="Search by name or reference..."
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
          </div>
          <div>
            <Btn 
              variant="outline" 
              onClick={generateDummyPaymentsData}
              className="flex items-center gap-2"
            >
              <Database size={14} /> Generate Trial Data
            </Btn>
          </div>
        </div>

        {displayedLoans.length === 0 ? (
          <div className="pro-card p-10 text-center flex flex-col items-center justify-center space-y-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-450">
              <Database size={24} />
            </div>
            <div>
              <p className="text-slate-700 font-bold text-sm">No loans are currently due or overdue!</p>
              <p className="text-slate-400 text-xs mt-1">To trial/test the payments flow, generate sample trial data.</p>
            </div>
            <Btn 
              onClick={generateDummyPaymentsData}
              className="mt-2 flex items-center gap-2 shadow-lg shadow-primary/20"
              size="sm"
            >
              <Zap size={14} /> Populate Trial Data
            </Btn>
          </div>
        ) : (
          <ProTable headers={[
            { label: 'Borrower' },
            { label: 'Due Date & Overdue' },
            { label: 'Amount Due' },
            { label: 'Action & Recording', className: 'text-right' }
          ]}>
            {displayedLoans.map((l) => {
              const outstandingPrincipal = l.remainingPrincipal !== undefined ? l.remainingPrincipal : l.principalAmount;
              const isOverdue = getDueDateCounter(l.dueDate).includes('overdue');
              const delinquentRate = l.delinquentRate || 12;
              const delinquentPenalty = isOverdue ? (outstandingPrincipal * (delinquentRate / 100)) : 0;
              const interestDue = (outstandingPrincipal * (l.interestRate || 5) / 100);
              const amountDue = interestDue + delinquentPenalty;
              const counter = getDueDateCounter(l.dueDate);

              const session = recordedSessions[l.id];

              if (session) {
                return (
                  <tr key={l.id} className="bg-emerald-50/30 border-l-4 border-emerald-500 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                          ✓
                        </div>
                        <div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase tracking-widest">RECORDED ✓</span>
                          <p className="text-[13px] font-bold text-slate-800 mt-1">{l.user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">ID: {l.id}</p>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2" className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-600">
                        Collected: <span className="text-slate-900">{formatMoney(session.collected)}</span> | Principal Applied: <span className="text-emerald-600">{formatMoney(session.principalApplied)}</span> | Remaining: <span className="text-rose-500">{formatMoney(session.remaining)}</span>
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Btn size="sm" variant="danger" onClick={() => handleUndo(l.id)}>
                        Undo
                      </Btn>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={l.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                          {l.user.name[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-800 transition-colors group-hover:text-primary">{l.user.name}</p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">ID: {l.id}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-slate-900">{formatDateDDMMYYYY(l.dueDate)}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`}>
                      {counter}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-slate-900">{formatMoney(amountDue)}</p>
                    {isOverdue && (
                      <p className="text-[9px] font-medium text-rose-400 italic">includes {delinquentRate}% delinquent interest</p>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                      <Btn size="sm" variant="success" className="!py-2 !px-3 text-[9px]" onClick={() => handleOpenExact(l)}>
                        ✓ Confirm
                      </Btn>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Custom Amount"
                          className="premium-input !py-1.5 !px-2.5 !w-24 text-[10px] font-bold text-slate-800 h-8"
                          id={`custom-amt-${l.id}`}
                        />
                        <Btn
                          size="sm"
                          variant="primary"
                          className="!py-2 !px-3 h-8 text-[9px]"
                          onClick={() => {
                            const val = document.getElementById(`custom-amt-${l.id}`).value;
                            handleCustomSubmit(l, val);
                          }}
                        >
                          Submit
                        </Btn>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </ProTable>
        )}
      </div>

      {/* SCENARIO A MODAL */}
      <Modal isOpen={!!activeExactModal} onClose={() => setActiveExactModal(null)} title="Confirm Exact Payment">
        {activeExactModal && (() => {
          const outstandingPrincipal = activeExactModal.remainingPrincipal !== undefined ? activeExactModal.remainingPrincipal : activeExactModal.principalAmount;
          const isOverdue = getDueDateCounter(activeExactModal.dueDate).includes('overdue');
          const delinquentRate = activeExactModal.delinquentRate || 12;
          const delinquentPenalty = isOverdue ? (outstandingPrincipal * (delinquentRate / 100)) : 0;
          const interestDue = (outstandingPrincipal * (activeExactModal.interestRate || 5) / 100);
          const amountDue = interestDue + delinquentPenalty;

          return (
            <div className="space-y-6 pt-2">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-2">
                <p className="text-xs font-bold text-slate-600">Borrower: <span className="text-slate-900">{activeExactModal.user.name}</span></p>
                <p className="text-xs font-bold text-slate-600">Loan ID: <span className="text-slate-900">{activeExactModal.id}</span></p>
                <p className="text-xs font-bold text-slate-600">Amount Due: <span className="text-slate-900 font-extrabold">{formatMoney(amountDue)}</span></p>
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
                  I confirm that {formatMoney(amountDue)} has been collected
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Btn variant="outline" className="flex-1 h-12" onClick={() => setActiveExactModal(null)}>Cancel</Btn>
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
          );
        })()}
      </Modal>

      {/* SCENARIO B MODAL */}
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

      {/* SCENARIO C MODAL */}
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
                <span>Next Month Payment (5% of Principal):</span>
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
