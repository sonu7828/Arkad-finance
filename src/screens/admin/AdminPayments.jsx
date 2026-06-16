import React, { useMemo, useState } from 'react';
import { 
  CheckCircle2, Clock3, Receipt, Search, Database, TrendingUp, Activity, History, 
  ShieldAlert, AlertCircle, ChevronRight, Filter, Download, Zap, CreditCard,
  UserCheck
} from 'lucide-react';
import { PageTitle, StatusBadge, StatCard, Btn, Input, ProTable, Modal, Divider, FormField } from '../../components/UI';
import { formatDateDDMMYYYY, getDueDateCounter } from '../../utils/dateUtils';
import { calculateLoanDetails } from '../../utils/loanCalculator';
import { useLoans } from '../../context/LoanContext';

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AdminPayments() {
  const { loans, recordPayment, generateDummyPaymentsData } = useLoans();
  const [search, setSearch] = useState('');
  
  // Filter for Active loans
  const activeLoans = useMemo(() => {
    return loans.filter(l => l.status?.toLowerCase() === 'active' || l.status === 'APPROVED' || l.status === 'late');
  }, [loans]);

  // Due or Overdue Loans
  const dueLoans = useMemo(() => {
    return activeLoans.filter(l => {
      if (!l.dueDate) return false;
      const counter = getDueDateCounter(l.dueDate);
      return counter.includes('today') || counter.includes('overdue');
    });
  }, [activeLoans]);

  const filteredLoans = useMemo(() => {
    return dueLoans.filter(l => 
      l.user?.name.toLowerCase().includes(search.toLowerCase()) || 
      l.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [dueLoans, search]);

  const [paymentModal, setPaymentModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dynamic calculation for Payment Modal
  const paymentAnalysis = useMemo(() => {
    if (!paymentModal || !payAmount) return null;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return null;

    const outstandingPrincipal = paymentModal.remainingPrincipal !== undefined ? paymentModal.remainingPrincipal : paymentModal.principalAmount;

    const details = calculateLoanDetails({
      principal: paymentModal.principalAmount,
      remainingPrincipal: outstandingPrincipal,
      duration: paymentModal.duration,
      interestRate: paymentModal.interestRate || 5
    });

    // Assume we calculate against monthly interest
    const interestDue = details.monthlyInterest || (outstandingPrincipal * (paymentModal.interestRate || 5) / 100);
    
    let scenario = '';
    let color = '';
    let principalReduction = 0;
    let carriedOver = 0;

    if (amount === interestDue) {
      scenario = 'EXACT PAYMENT';
      color = 'text-emerald-500';
    } else if (amount < interestDue) {
      scenario = 'PARTIAL PAYMENT';
      color = 'text-amber-500';
      carriedOver = interestDue - amount;
    } else {
      scenario = 'OVERPAYMENT';
      color = 'text-primary';
      principalReduction = amount - interestDue;
    }

    return {
      interestDue,
      scenario,
      color,
      principalReduction,
      carriedOver,
      newPrincipal: Math.max(0, outstandingPrincipal - principalReduction)
    };
  }, [paymentModal, payAmount]);

  const handleRecordPayment = () => {
    if (!paymentAnalysis) return;
    setSubmitting(true);
    setTimeout(() => {
      recordPayment(paymentModal.id, parseFloat(payAmount));
      setSubmitting(false);
      setPaymentModal(null);
      setPayAmount('');
    }, 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Due Payments & Collections" 
        subtitle="Manage loans due today or overdue and receive payments" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pro-card p-6 bg-rose-50 border-rose-100">
          <StatCard label="Loans Due / Overdue" value={dueLoans.length} icon={ShieldAlert} color="text-rose-500" />
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

        {filteredLoans.length === 0 ? (
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
            { label: 'Outstanding Principal' },
            { label: 'Due Date & Status' },
            { label: 'Interest Due' },
            { label: 'Action', className: 'text-right' }
          ]}>
            {filteredLoans.map((l) => {
              const outstandingPrincipal = l.remainingPrincipal !== undefined ? l.remainingPrincipal : l.principalAmount;
              const details = calculateLoanDetails({
                principal: l.principalAmount,
                remainingPrincipal: outstandingPrincipal,
                duration: l.duration,
                interestRate: l.interestRate || 5
              });
              const interestDue = details.monthlyInterest || (outstandingPrincipal * (l.interestRate || 5) / 100);
              const counter = getDueDateCounter(l.dueDate);

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
                    <p className="text-[13px] font-bold text-slate-900">{formatMoney(outstandingPrincipal)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-slate-900">{formatDateDDMMYYYY(l.dueDate)}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${counter.includes('overdue') ? 'text-rose-500' : 'text-amber-500'}`}>{counter}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-slate-900">{formatMoney(interestDue)}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Btn size="sm" onClick={() => setPaymentModal(l)}>Receive Payment</Btn>
                  </td>
                </tr>
              )
            })}
          </ProTable>
        )}
      </div>

      <Modal isOpen={!!paymentModal} onClose={() => setPaymentModal(null)} title="Payment Receiving Modal">
        {paymentModal && (() => {
          const outstandingPrincipal = paymentModal.remainingPrincipal !== undefined ? paymentModal.remainingPrincipal : paymentModal.principalAmount;
          const details = calculateLoanDetails({
            principal: paymentModal.principalAmount,
            remainingPrincipal: outstandingPrincipal,
            duration: paymentModal.duration,
            interestRate: paymentModal.interestRate || 5
          });
          const interestDue = details.monthlyInterest || (outstandingPrincipal * (paymentModal.interestRate || 5) / 100);

          return (
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Borrower</p>
                   <p className="text-sm font-bold text-slate-900">{paymentModal.user.name}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Principal</p>
                   <p className="text-sm font-bold text-slate-900">{formatMoney(outstandingPrincipal)}</p>
                 </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex justify-between items-center">
                 <p className="text-sm font-bold text-primary">Monthly Interest Due</p>
                 <p className="text-xl font-black text-primary">{formatMoney(interestDue)}</p>
              </div>

              <FormField label="Amount Received (MXN)">
                <Input 
                  type="number" 
                  value={payAmount} 
                  onChange={(e) => setPayAmount(e.target.value)} 
                  placeholder="Enter amount given by borrower"
                  className="h-14 text-xl font-bold"
                />
              </FormField>

              {paymentAnalysis && (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Scenario</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 ${paymentAnalysis.color}`}>
                      {paymentAnalysis.scenario}
                    </span>
                  </div>

                  <Divider className="my-2 opacity-50" />

                  {paymentAnalysis.scenario === 'EXACT PAYMENT' && (
                    <p className="text-xs font-bold text-slate-600">
                      Borrower is paying exactly the interest amount. Principal remains at <span className="text-slate-900">{formatMoney(outstandingPrincipal)}</span>.
                    </p>
                  )}

                  {paymentAnalysis.scenario === 'PARTIAL PAYMENT' && (
                    <div className="space-y-2 text-xs font-bold text-slate-600">
                      <p>Borrower is paying less than the interest due.</p>
                      <div className="flex justify-between items-center text-rose-500">
                        <span>Shortfall (Carried Over)</span>
                        <span>{formatMoney(paymentAnalysis.carriedOver)}</span>
                      </div>
                      <p>Principal remains at <span className="text-slate-900">{formatMoney(outstandingPrincipal)}</span>.</p>
                    </div>
                  )}

                  {paymentAnalysis.scenario === 'OVERPAYMENT' && (
                    <div className="space-y-2 text-xs font-bold text-slate-600">
                      <p>Borrower is paying more than the interest due. The surplus will reduce the principal.</p>
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Principal Reduction</span>
                        <span>- {formatMoney(paymentAnalysis.principalReduction)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-900 pt-2 border-t border-slate-100">
                        <span>New Principal Balance</span>
                        <span className="text-lg font-black">{formatMoney(paymentAnalysis.newPrincipal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Btn variant="outline" className="flex-1" onClick={() => setPaymentModal(null)}>Cancel</Btn>
                <Btn 
                  className="flex-[2] shadow-lg shadow-primary/30" 
                  onClick={handleRecordPayment}
                  disabled={!paymentAnalysis || submitting}
                  loading={submitting}
                >
                  Record Payment
                </Btn>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
