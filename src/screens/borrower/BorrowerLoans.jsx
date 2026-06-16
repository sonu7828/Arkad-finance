import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Wallet, Clock, Plus, FileText,
  ChevronRight, ShieldCheck, Scale, Activity, Calendar, FileUp, AlertCircle
} from 'lucide-react';
import { PageTitle, StatusBadge, StatCard, Btn, ProTable, Modal, Divider } from '../../components/UI';
import { calculateLoanDetails } from '../../utils/loanCalculator';
import { getDueDateCounter, formatDateDDMMYYYY } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useLoans } from '../../context/LoanContext';

const BASE_LOANS = [
  {
    id: 'LN-8801',
    principalAmount: 50000,
    status: 'active',
    dueDate: 'May 02, 2026',
    upcomingPaymentAmount: 1200,
    originationDate: '2024-10-01',
    principalPaid: 8400,
    latePaymentFee: 0,
    duration: 12,
    interestRate: 10,
    method: 'BANK_TRANSFER'
  },
  {
    id: 'LN-8803',
    principalAmount: 700,
    status: 'active',
    dueDate: '2026-04-16',
    upcomingPaymentAmount: 70,
    originationDate: '2026-04-01',
    principalPaid: 0,
    latePaymentFee: 0,
    duration: 12,
    interestRate: 10,
    method: 'CASH'
  },
  {
    id: 'LN-8804',
    principalAmount: 12000,
    status: 'active',
    dueDate: 'May 10, 2026',
    upcomingPaymentAmount: 400,
    originationDate: '2024-11-01',
    principalPaid: 0,
    latePaymentFee: 0,
    duration: 18,
    interestRate: 8,
    method: 'BANK_TRANSFER'
  },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function BorrowerLoans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans: allLoans, updateLoan } = useLoans();
  
  // Filter loans for the current borrower only
  const loans = useMemo(() => {
    if (!user) return [];
    const uName = String(user.name || '').toLowerCase().trim();
    const uEmail = String(user.email || '').toLowerCase().trim();
    return allLoans.filter(l => {
      const lName = String(l.user?.name || '').toLowerCase().trim();
      const lEmail = String(l.user?.email || '').toLowerCase().trim();
      return (uName && lName === uName) || (uEmail && lEmail === uEmail);
    });
  }, [allLoans, user]);

  const [viewModal, setViewModal] = useState(null);
  const [acceptTermsModal, setAcceptTermsModal] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = () => {
    const signatureName = document.getElementById('digitalSigName')?.value || '';
    const isChecked = document.getElementById('digitalSigAgree')?.checked;

    if (!signatureName.trim()) {
      alert('Please type your full name in the signature box to sign the contract.');
      return;
    }
    if (!isChecked) {
      alert('Please check the agreement box to accept the terms.');
      return;
    }

    setIsAccepting(true);
    setTimeout(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      updateLoan(acceptTermsModal.id, {
        status: 'active',
        disbursementDate: todayStr,
        dueDate: dueDateStr,
        signatureName: signatureName,
        signatureDate: todayStr,
        remainingPrincipal: acceptTermsModal.principalAmount
      });
      
      setIsAccepting(false);
      setAcceptTermsModal(null);
      alert('Congratulations! Your credit agreement has been digitally signed and accepted. Funds are now disbursed.');
    }, 1200);
  };

  const handleDecline = () => {
    if (!confirm('Are you sure you want to DECLINE this offer? The credit application will be rejected.')) return;
    
    updateLoan(acceptTermsModal.id, {
      status: 'rejected'
    });
    setAcceptTermsModal(null);
    alert('You have declined the credit offer. The application has been marked as rejected.');
  };

  const totalOutstanding = useMemo(() => {
    return loans.reduce((sum, l) => {
      const st = (l.status || '').toLowerCase();
      if (['active', 'approved', 'terms_set'].includes(st)) {
        return sum + (Number(l.principalAmount || 0) - Number(l.principalPaid || 0));
      }
      return sum;
    }, 0);
  }, [loans]);

  const columns = [
    {
      header: 'Loan Amount',
      render: (loan) => (
        <div className="flex flex-col max-w-[120px] sm:max-w-none">
          <span className="text-sm font-bold text-slate-900">{formatMoney(loan.principalAmount)}</span>
        </div>
      )
    },
    {
      header: 'Monthly Payment',
      render: (loan) => {
        const details = calculateLoanDetails({
          principal: loan.principalAmount,
          remainingPrincipal: loan.principalAmount - (loan.principalPaid || 0),
          interestRate: loan.interestRate,
          duration: loan.duration
        });
        const dueCounter = getDueDateCounter(loan.dueDate);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">{formatMoney(details.monthlyPaymentCurrent)}</span>
            <div className="flex flex-col mt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{formatDateDDMMYYYY(loan.dueDate)}</span>
              <span className={`text-sm font-bold mt-2 ${dueCounter.includes('overdue') ? 'text-rose-600' :
                  dueCounter === 'Due today' ? 'text-amber-600' : 'text-primary'
                }`}>
                {dueCounter}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Origination Date',
      render: (loan) => (
        <span className="text-sm font-bold text-slate-700">{formatDateDDMMYYYY(loan.originationDate)}</span>
      )
    },
    {
      header: 'Principal Paid',
      render: (loan) => (
        <span className="text-sm font-bold text-emerald-600">{formatMoney(loan.principalPaid)}</span>
      )
    },
    {
      header: 'Late Payment Fee',
      render: (loan) => (
        <span className={`text-sm font-bold ${loan.latePaymentFee > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
          {loan.latePaymentFee > 0 ? `+ ${formatMoney(loan.latePaymentFee)}` : 'MXN $0'}
        </span>
      )
    },
    {
      header: 'Status',
      align: 'center',
      render: (loan) => <StatusBadge status={loan.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (loan) => (
        <Btn
          variant="outline"
          size="sm"
          className="!h-10 !rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            if (loan.status === 'terms_set') setAcceptTermsModal(loan);
            else setViewModal(loan);
          }}
        >
          {loan.status === 'terms_set' ? 'Review Terms' : 'Details'}
        </Btn>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle
        title="My Loans"
        subtitle="Manage your loan history and track your repayment status in real-time."
        action={
          <Btn onClick={() => navigate('/borrower/apply')}>
            <Plus size={16} className="mr-2" /> Apply for Loan
          </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Loans" value={loans.length} icon={FileText} color="text-slate-900" />
        <StatCard label="Active Balance" value={formatMoney(totalOutstanding)} icon={Wallet} color="text-primary" />
        <StatCard label="Next Payment Due" value={formatDateDDMMYYYY(loans.find(l => l.status === 'active')?.dueDate)} icon={Clock} color="text-amber-500" />
      </section>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Loan History</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Complete record of your loan applications</p>
          </div>
        </div>
        <ProTable columns={columns} data={loans} onRowClick={(row) => row.status === 'terms_set' ? setAcceptTermsModal(row) : setViewModal(row)} />
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Loan Details">
        {viewModal && (
          <div className="space-y-8">
            <div className="p-8 sm:p-12 bg-slate-50 border border-slate-100 text-center rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Loan Amount</p>
              <h4 className="text-3xl sm:text-5xl font-bold text-slate-800 tracking-tight">{formatMoney(viewModal.principalAmount)}</h4>
              <div className="mt-5 flex justify-center"><StatusBadge status={viewModal.status} /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const today = new Date();
                const dueDate = viewModal.dueDate ? new Date(viewModal.dueDate) : null;
                let daysLate = 0;
                if (dueDate && !isNaN(dueDate.getTime()) && today > dueDate) {
                  daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                }

                const details = calculateLoanDetails({
                  principal: viewModal.principalAmount,
                  remainingPrincipal: viewModal.remainingPrincipal || (viewModal.principalAmount - (viewModal.principalPaid || 0)),
                  interestRate: viewModal.interestRate,
                  duration: viewModal.duration,
                  daysLate: daysLate
                });
                const dueCounter = getDueDateCounter(viewModal.dueDate);
                return [
                  { label: 'Current Monthly Pay', value: formatMoney(details.monthlyPaymentCurrent), icon: Activity, primary: true },
                  { label: 'Total Term', value: `${viewModal.duration || 0} Months`, icon: Clock },
                  { label: 'Interest Rate', value: `${viewModal.interestRate || 0}% Monthly`, icon: Activity },
                  {
                    label: 'Next Payment Due',
                    value: (
                      <div className="flex flex-col">
                        <span>{formatDateDDMMYYYY(viewModal.dueDate)}</span>
                        {viewModal.dueDate && !['Pending', 'Processing', 'N/A'].includes(viewModal.dueDate) && (
                          <span className={`text-sm font-bold mt-2 ${dueCounter.includes('overdue') ? 'text-rose-600' :
                              dueCounter === 'Due today' ? 'text-amber-600' : 'text-primary'
                            }`}>
                            {dueCounter}
                          </span>
                        )}
                      </div>
                    ),
                    icon: Calendar
                  }
                ].map((d, i) => (
                  <div key={i} className={`bg-white border p-4 sm:p-6 rounded-2xl space-y-2 ${d.primary ? 'border-primary/20 bg-primary/5' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                      <d.icon size={12} className={d.primary ? 'text-primary' : 'text-slate-400'} />
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${d.primary ? 'text-primary/70' : 'text-slate-400'}`}>{d.label}</p>
                    </div>
                    <div className={`text-sm font-bold ${d.primary ? 'text-primary' : 'text-slate-800'}`}>{d.value}</div>
                  </div>
                ));
              })()}
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
                remainingPrincipal: viewModal.remainingPrincipal || (viewModal.principalAmount - (viewModal.principalPaid || 0)),
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
                        <h5 className="text-xs font-bold uppercase tracking-widest">Overdue Payment Breakdown</h5>
                      </div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Days Late: {daysPastGrace} days</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-500">Payment Amount</span>
                        <span className="font-bold text-slate-900">{formatMoney(details.monthlyPaymentCurrent)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-white/50 rounded-lg border border-slate-100">
                        <span>Grace Period Allowance</span>
                        <span className="text-emerald-500">-{details.graceDays} Days Free</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-500">Extraordinary Interest</span>
                        <span className="font-bold text-rose-500">+ {formatMoney(details.delinquentPenalty)}</span>
                      </div>
                      <Divider className="my-1" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Due</span>
                        <span className="text-lg font-black text-rose-600">{formatMoney(details.monthlyPaymentCurrent + details.delinquentPenalty)}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-4">
              <Divider text="Repayment History" />
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[500px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Base</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">Penalty</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {viewModal.payments?.length > 0 ? viewModal.payments.map((p, i) => (
                      <tr key={i} className="text-[10px] font-bold text-slate-700">
                        <td className="px-4 py-3">
                          <span>{formatDateDDMMYYYY(p.date)}</span>
                          <p className="text-[8px] text-slate-300 uppercase tracking-tighter mt-0.5">{p.type}</p>
                        </td>
                        <td className="px-4 py-3">{formatMoney(p.baseAmount)}</td>
                        <td className="px-4 py-3 text-rose-500">{p.penaltyAmount > 0 ? formatMoney(p.penaltyAmount) : '-'}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900">{formatMoney(p.totalCollected)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-4 py-8 text-center text-[10px] font-bold text-slate-300 uppercase">No history found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <Divider text="Collateral Assets" />

              <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add New Collateral</label>
                  <p className="text-[9px] text-slate-300 uppercase italic">PNG, JPG, PDF (Max 10MB)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="file"
                    id="collateralFile"
                    accept="image/png, image/jpeg, application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
                      if (!allowedTypes.includes(file.type)) {
                        alert('Invalid file type. Please upload PNG, JPG, or PDF.');
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File too large. Maximum size is 10MB.');
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const newCollateral = {
                          id: Date.now(),
                          fileName: file.name,
                          fileType: file.type,
                          fileUrl: ev.target.result,
                          description: document.getElementById('collateralDesc').value || 'No description',
                          status: 'pending',
                          uploadedAt: new Date().toISOString().split('T')[0]
                        };

                        const updatedCollateral = [...(viewModal.collateral || []), newCollateral];
                        updateLoan(viewModal.id, { collateral: updatedCollateral });
                        setViewModal(prev => ({ ...prev, collateral: updatedCollateral }));
                        document.getElementById('collateralDesc').value = '';
                        document.getElementById('collateralFile').value = '';
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('collateralFile').click()}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <FileUp size={16} className="text-primary" />
                    Select File
                  </button>
                  <input
                    type="text"
                    id="collateralDesc"
                    placeholder="Brief description (e.g., Title Deed)"
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {viewModal.collateral?.length > 0 ? viewModal.collateral.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        {item.fileType.includes('image') ? (
                          <img src={item.fileUrl} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                        ) : (
                          <FileText size={20} className="text-primary" />
                        )}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{item.fileName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-0 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <StatusBadge status={item.status} />
                        <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">{formatDateDDMMYYYY(item.uploadedAt)}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No collateral uploaded yet</p>
                  </div>
                )}
              </div>
            </div>

            <Btn onClick={() => setViewModal(null)} className="w-full h-12 shadow-lg">Close Information</Btn>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!acceptTermsModal} onClose={() => setAcceptTermsModal(null)} title="Loan Confirmation">
        {acceptTermsModal && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Review Agreement Terms</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed">Please review the finalized loan parameters before accepting the agreement.</p>
            </div>

            {(() => {
              const isExpired = new Date() > new Date(acceptTermsModal.offerDeadline);
              const details = calculateLoanDetails({
                principal: acceptTermsModal.principalAmount,
                duration: acceptTermsModal.duration,
                interestRate: acceptTermsModal.interestRate
              });
              const initiationFeeAmt = parseFloat(acceptTermsModal.initiationFee) || 0;
              const disbursementAmt = acceptTermsModal.principalAmount - initiationFeeAmt;

              return (
                <div className="space-y-6">
                  {isExpired ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">Offer Has Expired</p>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">This credit offer was valid until {formatDateDDMMYYYY(acceptTermsModal.offerDeadline)} and has expired. Please submit a new loan request.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-start gap-3">
                      <Clock className="text-purple-600 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">Offer Expiration Warning</p>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-1">This credit agreement offer expires on {formatDateDDMMYYYY(acceptTermsModal.offerDeadline)}. Please sign and accept before the deadline.</p>
                      </div>
                    </div>
                  )}

                  {/* Styled Credit Contract Paper */}
                  <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 sm:p-10 shadow-inner relative overflow-hidden space-y-8 font-sans">
                     {/* Watermark/Background Accent */}
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-150 blur-3xl opacity-30 rounded-full" />
                     
                     {/* Header */}
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                           <span className="text-[9px] font-black text-purple-600 uppercase tracking-[0.2em] italic">ARKAD FINANCE Core Agreement</span>
                           <h4 className="text-lg font-black text-slate-800 tracking-tight uppercase mt-0.5">Credit Service Agreement</h4>
                        </div>
                        <div className="text-left sm:text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document ID</p>
                           <p className="text-xs font-mono font-bold text-slate-700">{acceptTermsModal.id}</p>
                        </div>
                     </div>

                     {/* Contract Sections */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-bold text-slate-700">
                        {/* Section A: Parties */}
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic pb-1 border-b border-slate-200/60">I. Parties to Agreement</h5>
                           <div className="space-y-3">
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Creditor / Lender</p>
                                 <p className="text-xs font-extrabold text-slate-800">ARKAD FINANCE S.A. de C.V.</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Borrower / Client</p>
                                 <p className="text-xs font-extrabold text-slate-800">{acceptTermsModal.bankHolderName || acceptTermsModal.user?.name || user?.name}</p>
                                 <p className="text-[9px] text-slate-500 font-bold mt-0.5">{user?.email}</p>
                              </div>
                           </div>
                        </div>

                        {/* Section B: Financial Breakdown */}
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic pb-1 border-b border-slate-200/60">II. Financial Parameters</h5>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Principal Amount</p>
                                 <p className="text-xs font-extrabold text-slate-800">{formatMoney(acceptTermsModal.principalAmount)}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration Term</p>
                                 <p className="text-xs font-extrabold text-slate-800">{acceptTermsModal.duration} Months</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interest Rate</p>
                                 <p className="text-xs font-extrabold text-purple-600">{acceptTermsModal.interestRate}% Monthly</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Repayment Mode</p>
                                 <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{acceptTermsModal.method}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Section C: Fees & Grace Period */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-200/50 font-bold text-slate-700">
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic pb-1 border-b border-slate-200/60">III. Administrative Fees</h5>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Initiation Fee</p>
                                 <p className="text-xs font-extrabold text-slate-800">{formatMoney(initiationFeeAmt)}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Disbursement Amount</p>
                                 <p className="text-xs font-extrabold text-emerald-600">{formatMoney(disbursementAmt)}</p>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic pb-1 border-b border-slate-200/60">IV. Penalties & Grace Periods</h5>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Late Fee Rate</p>
                                  <p className="text-xs font-extrabold text-rose-500">{acceptTermsModal.lateFeeRate}% Monthly</p>
                               </div>
                               <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Grace Period</p>
                                  <p className="text-xs font-extrabold text-slate-800">{acceptTermsModal.gracePeriod} Days</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Section D: Bank Details */}
                      <div className="pt-4 border-t border-slate-200/50 text-xs font-bold text-slate-700">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic pb-3 border-b border-slate-200/60 mb-3">V. Bank & Disbursement Details</h5>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account Holder</p>
                               <p className="text-xs font-extrabold text-slate-800">{acceptTermsModal.bankHolderName || acceptTermsModal.user?.name || user?.name}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bank Name</p>
                               <p className="text-xs font-extrabold text-slate-800">{acceptTermsModal.bankName || '—'}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account / CLABE</p>
                               <p className="text-xs font-extrabold text-slate-800 font-mono tracking-wide">{acceptTermsModal.accountNumber || '—'}</p>
                            </div>
                         </div>
                      </div>

                     {/* Section E: Cost Summary Box */}
                     <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Installment Projection</span>
                           <span className="px-2.5 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded-md text-[8px] font-bold uppercase tracking-wider">Calculated Value</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                           <div>
                              <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Monthly Payment</p>
                              <p className="text-sm sm:text-base font-extrabold text-primary mt-0.5">{formatMoney(details.monthlyInstallment)}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Principal Owed</p>
                              <p className="text-sm sm:text-base font-extrabold text-white mt-0.5">{formatMoney(details.principal)}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Total Credit Cost</p>
                              <p className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">{formatMoney(details.totalPayable)}</p>
                           </div>
                        </div>
                     </div>

                     {/* Digital Signature Signing Fields */}
                     {!isExpired && (
                        <div className="pt-6 border-t border-slate-200 space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic pb-1">V. Digital Consent Signature</h5>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Type Your Full Name to Sign</label>
                                 <input
                                   type="text"
                                   id="digitalSigName"
                                   placeholder={acceptTermsModal.bankHolderName || user?.name}
                                   className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                                 />
                              </div>
                              <div className="flex items-center gap-3 px-1 sm:pt-6">
                                 <input
                                   type="checkbox"
                                   id="digitalSigAgree"
                                   className="w-4.5 h-4.5 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                 />
                                 <label htmlFor="digitalSigAgree" className="text-[9px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer select-none">
                                    I agree to the terms of this credit agreement.
                                 </label>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Btn variant="danger" onClick={handleDecline} className="w-full sm:flex-1 h-14">Decline Offer</Btn>
                    {!isExpired && (
                       <Btn
                         onClick={handleAccept}
                         disabled={isAccepting}
                         className="w-full sm:flex-[2] h-14 shadow-xl"
                       >
                         {isAccepting ? 'Processing Signature...' : 'Sign & Accept'}
                       </Btn>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}
