import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, Clock, Search, DollarSign, ArrowRight, Activity,
  TrendingUp, Receipt, RotateCcw, ShieldCheck, X, Plus, FileUp, Calendar
} from 'lucide-react';
import { PageTitle, StatCard, ProTable, Modal, Btn, StatusBadge, FormField, Input } from '../../components/UI';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { calculateLoanDetails } from '../../utils/loanCalculator';
import { useAuth } from '../../context/AuthContext';
import { useLoans } from '../../context/LoanContext';

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BorrowerPayments() {
  const { user } = useAuth();
  const { loans: globalLoans, generateDummyPaymentsData } = useLoans();

  // ── Get current borrower's loans from real context ──────────────────────
  const myLoans = useMemo(() => {
    if (!user) return [];
    const uName = String(user.name || '').toLowerCase().trim();
    const uEmail = String(user.email || '').toLowerCase().trim();
    return globalLoans.filter(l => {
      const lName = String(l.user?.name || '').toLowerCase().trim();
      const lEmail = String(l.user?.email || '').toLowerCase().trim();
      return (uName && lName === uName) || (uEmail && lEmail === uEmail);
    });
  }, [globalLoans, user]);

  const activeLoans = myLoans.filter(l =>
    ['active', 'approved', 'APPROVED', 'Active'].includes(l.status)
  );

  // ── Live Debt Breakdown from real loan data ──────────────────────────────
  const debtBreakdown = useMemo(() => {
    return activeLoans.map(l => {
      const details = calculateLoanDetails({
        principal: l.principalAmount,
        remainingPrincipal: l.remainingPrincipal,
        duration: l.duration,
        interestRate: l.interestRate,
        hasAgent: !!l.agentId,
      });
      const principal = Number(l.principalAmount) || 0;
      const totalInterest = details.totalInterest || 0;
      const fees = details.initiationFee || 0;
      const paid = Number(l.principalPaid || 0);
      const totalOutstanding = Math.max(0, (principal - paid) + totalInterest + fees);

      return {
        id: l.id,
        type: 'Active Loan Contract',
        principal,
        interest: totalInterest,
        fees,
        paid,
        total: totalOutstanding,
        monthlyInstallment: details.monthlyInstallment || details.monthlyPaymentCurrent || 0,
        duration: l.duration,
        interestRate: l.interestRate,
      };
    });
  }, [activeLoans]);

  const totalDebtBalance = debtBreakdown.reduce((s, d) => s + d.total, 0);

  // ── Real payment history from loan.payments[] ────────────────────────────
  const allPayments = useMemo(() => {
    const result = [];
    myLoans.forEach(l => {
      if (Array.isArray(l.payments)) {
        l.payments.forEach(p => result.push({ ...p, loanId: l.id }));
      }
    });
    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [myLoans]);

  const [localPayments, setLocalPayments] = useState([]);
  const allDisplayPayments = [...localPayments, ...allPayments];

  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const defaultLoanId = activeLoans[0]?.id || '';
  const [payForm, setPayForm] = useState({
    loanId: defaultLoanId,
    amount: '',
    method: 'Bank Transfer',
    receipt: null,
    preview: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPayForm({ ...payForm, receipt: file, preview: ev.target.result });
      reader.readAsDataURL(file);
    } else {
      setPayForm({ ...payForm, receipt: file, preview: null });
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!payForm.amount) return alert('Please enter amount');
    setIsSubmitting(true);
    setTimeout(() => {
      const newPayment = {
        id: Date.now(),
        loanId: payForm.loanId,
        trxId: 'TXN-' + Math.floor(Math.random() * 90000 + 10000),
        totalCollected: parseFloat(payForm.amount),
        method: payForm.method,
        status: 'pending',
        createdAt: new Date().toISOString(),
        receiptPreview: payForm.preview,
      };
      setLocalPayments(prev => [newPayment, ...prev]);
      setIsSubmitting(false);
      setShowPayModal(false);
      setPayForm({ loanId: defaultLoanId, amount: '', method: 'Bank Transfer', receipt: null, preview: null });
      alert('Payment submission successful! It is now pending verification.');
    }, 1200);
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return allDisplayPayments.filter(p =>
      String(p.loanId).toLowerCase().includes(term) ||
      String(p.trxId || '').toLowerCase().includes(term)
    );
  }, [allDisplayPayments, search]);

  const totalVerifiedPaid = allDisplayPayments
    .filter(p => p.status === 'verified')
    .reduce((s, p) => s + (p.totalCollected || 0), 0);

  const pendingCount = allDisplayPayments.filter(p => p.status === 'pending').length;

  const stats = [
    { label: 'Total Paid', value: formatMoney(totalVerifiedPaid), icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Pending Verification', value: pendingCount, icon: Clock, color: 'text-amber-500' },
    { label: 'Outstanding Debt', value: formatMoney(totalDebtBalance), icon: DollarSign, color: 'text-rose-500' },
  ];

  const columns = [
    {
      header: 'Due Date',
      render: (p) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <Calendar size={16} />
          </div>
          <span className="text-sm font-bold text-slate-900 uppercase">{formatDateDDMMYYYY(p.dueDate || p.date || p.createdAt)}</span>
        </div>
      )
    },
    {
      header: 'Paid Date',
      render: (p) => (
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-slate-50 rounded-lg">
          {formatDateDDMMYYYY(p.date || p.createdAt)}
        </span>
      )
    },
    {
      header: 'Amount',
      render: (p) => (
        <span className="text-sm font-bold text-slate-900">{formatMoney(p.amount || p.totalCollected)}</span>
      )
    },
    {
      header: 'Status',
      align: 'center',
      render: (p) => {
        let st = (p.status || 'PENDING').toUpperCase();
        if (p.type === 'EXACT' || p.type === 'OVERPAYMENT') st = 'PAID';
        if (p.type === 'PARTIAL') st = 'PARTIAL';
        if (p.status === 'verified') st = 'PAID';
        return <StatusBadge status={st} />;
      }
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <PageTitle
        title="Repayment Hub"
        subtitle="Manage your active liabilities and track historical transaction receipts."
        action={
          <div className="flex items-center gap-3">
            <Btn variant="outline" onClick={generateDummyPaymentsData} className="italic font-black uppercase tracking-widest text-[9px] rounded-xl !h-12 px-6">
              Generate Trial Data
            </Btn>
            <Btn onClick={() => setShowPayModal(true)} className="shadow-xl shadow-primary/20 italic font-black uppercase tracking-widest text-[9px] rounded-xl !h-12 px-6">
              <Plus size={16} className="mr-2" /> Make Payment
            </Btn>
          </div>
        }
      />

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </section>

      {/* LIVE DEBT EXPOSURE — from real loan data */}
      <div className="space-y-6">
        <div className="px-2 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-end">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Live Debt Exposure</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              Your total debt of <span className="font-bold text-slate-900">{formatMoney(totalDebtBalance)}</span> is from{' '}
              <span className="font-bold text-primary">{debtBreakdown.length} active loan contract{debtBreakdown.length !== 1 ? 's' : ''}</span>.
            </p>
          </div>
          {debtBreakdown.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 text-xs font-bold overflow-x-auto w-full xl:w-auto">
              <div className="text-slate-500 flex flex-col"><span className="text-[9px] uppercase tracking-widest mb-0.5">Principal</span><span className="text-slate-900">{formatMoney(debtBreakdown.reduce((s,d)=>s+d.principal,0))}</span></div>
              <div className="text-slate-300">+</div>
              <div className="text-slate-500 flex flex-col"><span className="text-[9px] uppercase tracking-widest mb-0.5">Interest</span><span className="text-slate-900">{formatMoney(debtBreakdown.reduce((s,d)=>s+d.interest,0))}</span></div>
              <div className="text-slate-300">+</div>
              <div className="text-slate-500 flex flex-col"><span className="text-[9px] uppercase tracking-widest mb-0.5">Fees</span><span className="text-rose-500">{formatMoney(debtBreakdown.reduce((s,d)=>s+d.fees,0))}</span></div>
              <div className="text-slate-300">-</div>
              <div className="text-emerald-500 flex flex-col"><span className="text-[9px] uppercase tracking-widest mb-0.5">Paid</span><span>{formatMoney(debtBreakdown.reduce((s,d)=>s+d.paid,0))}</span></div>
              <div className="text-primary text-base ml-2 flex flex-col"><span className="text-[9px] uppercase tracking-widest mb-0.5">Total Debt</span>{formatMoney(totalDebtBalance)}</div>
            </div>
          )}
        </div>

        {debtBreakdown.length === 0 ? (
          <div className="pro-card p-10 text-center flex flex-col items-center justify-center space-y-4 border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-slate-700 font-bold text-sm">No active loan contracts found.</p>
              <p className="text-slate-400 text-xs mt-1">To trial/test making payments and viewing receipt history, generate trial data.</p>
            </div>
            <Btn 
              onClick={generateDummyPaymentsData}
              className="mt-2 flex items-center gap-2 shadow-lg shadow-primary/20 rounded-xl"
              size="sm"
            >
              <Plus size={14} /> Populate Trial Repayment Data
            </Btn>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4 px-2 no-scrollbar snap-x snap-mandatory">
            {debtBreakdown.map((debt) => (
              <div key={debt.id} className="min-w-[320px] md:min-w-[420px] snap-start pro-card p-6 bg-white border border-slate-100 hover:border-primary/20 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{debt.type}</p>
                      <h4 className="text-lg font-extrabold text-slate-900">Contract #{debt.id}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{debt.duration} months @ {debt.interestRate}% monthly interest</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <Activity size={18} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Principal</p>
                      <p className="text-sm font-bold text-slate-700">{formatMoney(debt.principal)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Total Interest</p>
                      <p className="text-sm font-bold text-slate-700">{formatMoney(debt.interest)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Init. Fee</p>
                      <p className="text-sm font-bold text-rose-500">{formatMoney(debt.fees)}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 mb-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Already Paid</span>
                    <span className="text-sm font-black text-emerald-600">{formatMoney(debt.paid)}</span>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 mb-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Monthly Installment (EMI)</span>
                    <span className="text-sm font-black text-amber-600">{formatMoney(debt.monthlyInstallment)}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Outstanding</span>
                      <span className="text-base font-black text-primary">{formatMoney(debt.total)}</span>
                    </div>
                    <Btn size="sm" className="!h-9 !rounded-lg" onClick={() => { setPayForm(prev => ({ ...prev, loanId: debt.id })); setShowPayModal(true); }}>
                      Pay Now
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Transaction History</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-widest italic">Official record of all financial contributions</p>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or loan..."
              className="w-full h-11 pl-12 pr-4 bg-white border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-200 focus:border-primary/30 outline-none transition-all"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="pro-card p-10 text-center text-slate-400 text-sm font-bold">
            No payment records found.
          </div>
        ) : (
          <ProTable columns={columns} data={filtered} onRowClick={(row) => setViewModal(row)} />
        )}
      </div>

      {/* MAKE PAYMENT MODAL */}
      <Modal isOpen={showPayModal} onClose={() => !isSubmitting && setShowPayModal(false)} title="Submit Repayment">
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          {activeLoans.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-sm font-bold">
              You have no active loans to make a payment for.
            </div>
          ) : (
            <>
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Select Loan Contract</p>
                <select
                  className="w-full h-12 px-4 bg-white border border-primary/20 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10"
                  value={payForm.loanId}
                  onChange={e => setPayForm({ ...payForm, loanId: e.target.value })}
                >
                  {activeLoans.map(l => (
                    <option key={l.id} value={l.id}>
                      Contract #{l.id} — {formatMoney(l.principalAmount)}
                    </option>
                  ))}
                </select>
                {(() => {
                  const sel = debtBreakdown.find(d => String(d.id) === String(payForm.loanId));
                  return sel ? (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Monthly EMI: <span className="font-black text-slate-800">{formatMoney(sel.monthlyInstallment)}</span>
                      &nbsp;|&nbsp; Outstanding: <span className="font-black text-rose-600">{formatMoney(sel.total)}</span>
                    </p>
                  ) : null;
                })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Amount to Pay (MXN)">
                  <Input
                    type="number"
                    placeholder="e.g. 4583"
                    required
                    className="h-12 font-bold"
                    value={payForm.amount}
                    onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                  />
                </FormField>
                <FormField label="Payment Method">
                  <select
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10"
                    value={payForm.method}
                    onChange={e => setPayForm({ ...payForm, method: e.target.value })}
                  >
                    <option>Bank Transfer</option>
                    <option>Mobile Money</option>
                    <option>Cash Deposit</option>
                    <option>Bank Wire</option>
                  </select>
                </FormField>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Payment Proof (Receipt)</label>
                <div
                  className="border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center hover:border-primary/30 transition-all cursor-pointer bg-slate-50/50 group overflow-hidden relative"
                  onClick={() => document.getElementById('receipt-upload').click()}
                >
                  <input type="file" id="receipt-upload" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                  {payForm.preview ? (
                    <div className="absolute inset-0 bg-white z-20 flex items-center justify-center p-2">
                      <img src={payForm.preview} className="max-h-full max-w-full object-contain rounded-lg" alt="Preview" />
                      <div className="absolute top-2 right-2 bg-slate-900/50 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest backdrop-blur-sm">Click to Change</div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <FileUp className="text-primary" size={20} />
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight truncate px-4">
                        {payForm.receipt ? payForm.receipt.name : 'Click to select or drag receipt here'}
                      </p>
                      <p className="text-[9px] text-slate-300 uppercase mt-1">PNG, JPG or PDF (Max 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Btn variant="outline" className="flex-1 h-12" type="button" onClick={() => setShowPayModal(false)} disabled={isSubmitting}>Cancel</Btn>
                <Btn className="flex-[2] h-12 shadow-lg shadow-primary/20" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading Proof...' : 'Submit Payment Proof'}
                </Btn>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* VIEW RECEIPT MODAL */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Payment Receipt">
        {viewModal && (
          <div className="space-y-8">
            <div className="p-12 bg-slate-50 border border-slate-100 text-center rounded-3xl relative overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Amount</p>
              <h4 className="text-5xl font-bold text-slate-800 tracking-tight">{formatMoney(viewModal.totalCollected)}</h4>
              <div className="mt-5 flex justify-center"><StatusBadge status={viewModal.status} /></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Payment Method', value: viewModal.method?.toUpperCase() || 'Bank' },
                { label: 'Loan Contract', value: `#${viewModal.loanId}` },
                { label: 'Network REF', value: viewModal.trxId },
                { label: 'Timestamp', value: formatDateDDMMYYYY(viewModal.createdAt) },
              ].map((d, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.label}</span>
                  <span className="text-sm font-bold text-slate-800 uppercase">{d.value}</span>
                </div>
              ))}
            </div>

            {viewModal.receiptPreview && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted Proof</p>
                <div className="p-2 border border-slate-100 rounded-2xl bg-white shadow-sm">
                  <img src={viewModal.receiptPreview} className="w-full rounded-xl" alt="Receipt Proof" />
                </div>
              </div>
            )}

            <Btn onClick={() => setViewModal(null)} className="w-full h-12 shadow-lg">Close Receipt</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
