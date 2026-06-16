import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  FileText, 
  MapPin, 
  MessageCircle, 
  Building, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  Check,
  Info,
  Banknote,
  Building2,
  Wallet,
  AlertCircle,
  UploadCloud
} from 'lucide-react';
import { PageTitle, Btn, Input, Select, FormField, StatCard, Divider, Loader, EmptyState } from '../../components/UI';
import { getLoanSettings, addPipelineLoan } from '../../utils/loanConfig';
import { calculateLoanDetails } from '../../utils/loanCalculator';
import { useAuth } from '../../context/AuthContext';
import { useLoans } from '../../context/LoanContext';

const LOAN_DURATION_OPTIONS = [3, 6, 12, 24, 36].map((m) => ({
  value: m,
  label: `${m} Months`,
}));

const LOAN_AMOUNT_OPTIONS = [
  { value: '1000', label: 'MXN $1,000' },
  { value: '2000', label: 'MXN $2,000' },
  { value: '5000', label: 'MXN $5,000' },
  { value: '10000', label: 'MXN $10,000' },
  { value: '20000', label: 'MXN $20,000' },
  { value: '50000', label: 'MXN $50,000' },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function LoanApplyForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addLoan } = useLoans();
  const [step, setStep] = useState(0); 
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkedReqs, setCheckedReqs] = useState({}); 
  const [form, setForm] = useState({
    amount: '1000',
    duration: 12,
    description: '',
  });

  const REQUIREMENTS = [
    { id: 'id', icon: ShieldCheck, title: 'Identity Registry', desc: 'Valid government NRC ID or passport required for verification.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'residence', icon: Building, title: 'Residential Node', desc: 'Current proof of residence (Utility bill or rental agreement).', color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const allChecked = REQUIREMENTS.every(r => checkedReqs[r.id]);
  const [settings, setSettings] = useState(getLoanSettings());
  const [kycStatus, setKycStatus] = useState(localStorage.getItem('kycStatus') || 'missing');

  useEffect(() => {
    const s = getLoanSettings();
    setSettings(s);
    if (parseFloat(form.amount) < s.minLoanAmount) {
      setForm(prev => ({ ...prev, amount: s.minLoanAmount.toString() }));
    }
  }, []);


  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto py-32 px-6 text-center animate-in zoom-in-95 duration-1000">
        <div className="pro-card p-12 sm:p-24 flex flex-col items-center group">
           <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-8 sm:mb-12">
              <CheckCircle size={40} className="sm:w-14 sm:h-14" />
           </div>
           <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-4 sm:mb-6 leading-none">Application Submitted</h2>
           <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed mb-10 sm:mb-16 italic">
             Your loan request has been successfully received. You will be notified once the review is complete.
           </p>
           <Btn onClick={() => navigate('/borrower/dashboard')} className="w-full sm:w-auto !h-14 sm:!h-16 !px-16 italic font-black text-[10px] uppercase tracking-widest">
             Return to Dashboard
           </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-16 animate-in fade-in duration-1000 px-4 sm:px-0">
      <PageTitle 
        title="Loan Application" 
        subtitle="Configure your loan requirements and bank details for processing." 
      />

      {kycStatus === 'missing' ? (
        <div className="max-w-3xl mx-auto py-16 px-6 text-center">
          <div className="pro-card p-12 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-8">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">KYC Action Required</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm mb-10">
              You must submit your KYC documents in your profile before you can apply for a loan.
            </p>
            <Btn onClick={() => navigate('/borrower/profile')} className="!h-14 !px-12 italic font-black text-[10px] uppercase tracking-widest">
              Go to Profile
            </Btn>
          </div>
        </div>
      ) : (
      <>
      <div className="flex items-center justify-between px-2 sm:px-16 relative">
        <div className="absolute top-5 sm:top-7 left-0 w-full h-[1px] sm:h-[2px] bg-slate-100 -z-10" />
        {[
          { id: 0, label: 'Reqs' },
          { id: 1, label: 'Amount' },
          { id: 2, label: 'Review' }
        ].map(s => {
          const isActive = step === s.id;
          const isDone = step > s.id;
          const canJump = s.id < step || (s.id === 1 && allChecked) || (step >= 1 && s.id <= 2 && allChecked);
          
          return (
            <button 
              key={s.id} 
              type="button"
              onClick={() => {
                if (s.id === 0) setStep(0);
                else if (allChecked) setStep(s.id);
                else alert('Please complete requirements first');
              }}
              className={`flex flex-col items-center group outline-none transition-all duration-500 ${canJump ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'}`}
            >
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-slate-900 text-white shadow-2xl rotate-6' : isDone ? 'bg-primary text-white' : 'bg-white text-slate-200 border border-slate-100'}`}>
                {isDone ? <Check size={16} /> : <span className="text-xs sm:text-base font-black italic">{s.id}</span>}
              </div>
              <p className={`mt-3 sm:mt-5 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] italic transition-colors ${isActive ? 'text-slate-900' : 'text-slate-300 group-hover:text-slate-400'}`}>{s.label}</p>
            </button>
          );
        })}
      </div>

      <div className="pro-card overflow-hidden min-h-[500px] sm:min-h-[550px] flex flex-col group">
        <div className="p-6 sm:p-16 md:p-24 flex-1 flex flex-col">
          {step === 0 && (
            <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">00 / Requirements & Eligibility</h2>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Institutional Compliance Checklist</p>
                </div>
                <button onClick={() => {
                  const all = {}; REQUIREMENTS.forEach(r => all[r.id] = true); setCheckedReqs(all);
                }} className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                  Confirm All Requirements
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
                 {REQUIREMENTS.map((req, i) => {
                   const isChecked = !!checkedReqs[req.id];
                   return (
                    <button key={i} type="button" onClick={() => setCheckedReqs(prev => ({ ...prev, [req.id]: !prev[req.id] }))}
                      className={`p-4 sm:p-6 border rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 text-left transition-all duration-300 select-none outline-none ${isChecked ? 'bg-white border-primary shadow-xl shadow-primary/5 scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:border-slate-200 active:scale-95'}`}>
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${req.bg} ${req.color} flex items-center justify-center transition-transform ${isChecked ? 'rotate-6' : ''}`}>
                           <req.icon size={20} />
                        </div>
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-white scale-110' : 'border-slate-200 bg-white'}`}>
                           {isChecked && <Check size={14} strokeWidth={4} />}
                        </div>
                      </div>
                      <div>
                         <h4 className={`text-xs sm:text-sm font-black uppercase italic tracking-tight transition-colors ${isChecked ? 'text-primary' : 'text-slate-900'}`}>{req.title}</h4>
                         <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 leading-relaxed">{req.desc}</p>
                      </div>
                    </button>
                   );
                 })}
              </div>

              <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all flex items-start gap-3 sm:gap-4 ${allChecked ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-primary/5 border-primary/10 text-primary'}`}>
                 {allChecked ? <CheckCircle size={16} className="shrink-0 mt-1" /> : <AlertCircle className="shrink-0 mt-1" size={16} />}
                 <p className="text-[10px] sm:text-[11px] font-bold italic leading-relaxed">
                   {allChecked ? "All requirements verified. Proceed with capital request." : "Please verify all prerequisites by clicking the cards above."}
                 </p>
              </div>

              <div className="pt-4 sm:pt-6">
                <Btn onClick={() => setStep(1)} disabled={!allChecked} className={`w-full !h-14 sm:!h-16 italic font-black uppercase tracking-widest rounded-2xl ${allChecked ? 'shadow-2xl shadow-primary/20' : 'opacity-40 grayscale pointer-events-none'}`}>
                  {allChecked ? 'Proceed to Application' : 'Requirements Pending'} <ArrowRight size={18} className="ml-4" />
                </Btn>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">01 / Loan Details</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Identity Profile &amp; Capital Scope</p>
              </div>

              <div className="space-y-5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                  Desired Amount <span className="text-primary">(MXN)</span>
                </label>

                {/* Custom input */}
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm sm:text-base font-black text-slate-400 italic pointer-events-none tracking-widest">MXN $</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => update('amount', e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    className="premium-input pl-20 sm:pl-24 bg-slate-50 border-slate-200 italic font-black text-xl sm:text-2xl h-16 sm:h-20 text-slate-900 focus:border-primary/40 transition-all w-full rounded-2xl sm:rounded-3xl shadow-inner"
                    placeholder={settings.minLoanAmount.toString()}
                    min={settings.minLoanAmount}
                  />
                </div>

                {/* Validation warning */}
                {parseFloat(form.amount) < settings.minLoanAmount && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider italic">
                      Minimum allowed: {formatMoney(settings.minLoanAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Repayment Period */}
              <FormField label="Repayment Period">
                <select value={form.duration} onChange={e => update('duration', Number(e.target.value))} className="premium-input appearance-none bg-slate-50 border-slate-100 italic font-bold h-12 sm:h-14">
                  {LOAN_DURATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </FormField>

              <FormField label="Purpose of Loan">
                <textarea rows="4" placeholder="How you plan to use these funds..." value={form.description} onChange={e => update('description', e.target.value)} className="premium-input bg-slate-50 border-slate-100 min-h-[120px] sm:min-h-[140px] resize-none italic font-bold p-4" />
              </FormField>

              {/* Real-time Calculator */}
              {parseFloat(form.amount) > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-6 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Loan Projection (Interest-Only)</h4>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 border-dashed">
                    <span className="text-sm font-bold text-slate-600">Monthly Interest Payment</span>
                    <span className="text-sm font-black text-slate-900">{formatMoney(calculateLoanDetails({ principal: form.amount, duration: form.duration, interestRate: 5 }).monthlyInterest)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 border-dashed">
                    <span className="text-sm font-bold text-slate-600">Initiation Fee (3%)</span>
                    <span className="text-sm font-black text-rose-500">-{formatMoney(calculateLoanDetails({ principal: form.amount, duration: form.duration, interestRate: 5, initiationFee: 3 }).initiationFee)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-black text-slate-900 uppercase">Total Net Funds Received</span>
                    <span className="text-lg font-black text-emerald-600">{formatMoney(calculateLoanDetails({ principal: form.amount, duration: form.duration, interestRate: 5, initiationFee: 3 }).disbursementAmount)}</span>
                  </div>
                </div>
              )}

              <div className="pt-6 sm:pt-10">
                <Btn
                  onClick={() => setStep(2)}
                  disabled={!form.amount || parseFloat(form.amount) < settings.minLoanAmount}
                  className="w-full !h-14 sm:!h-16 italic font-black uppercase tracking-widest rounded-2xl"
                >
                  Continue to Review <ArrowRight size={18} className="ml-4" />
                </Btn>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 sm:space-y-12 animate-in fade-in zoom-in-95 duration-700">
               <div className="space-y-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">02 / Final Review</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Confirm application parameters</p>
              </div>
              <div className="pro-card p-8 sm:p-16 bg-slate-50 border border-slate-100 space-y-8 sm:space-y-12 text-center rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden">
                 <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] sm:tracking-[0.4em] italic mb-4 sm:mb-8">Requested Amount</p>
                 <h4 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic">{formatMoney(form.amount)}</h4>
                 <div className="grid grid-cols-2 gap-6 sm:gap-10 max-w-sm mx-auto pt-6 sm:pt-10 text-left italic">
                    <div className="space-y-1 sm:space-y-2">
                       <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest">Period</p>
                       <p className="text-sm sm:text-base font-black text-slate-900">{form.duration} Mo</p>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                       <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest">KYC Status</p>
                       <p className="text-[10px] sm:text-sm font-black text-emerald-500 uppercase">
                          Verified
                       </p>
                    </div>
                 </div>
              </div>
              <div className="flex gap-4 sm:gap-6 pt-6 sm:pt-10">
                <Btn variant="outline" onClick={() => setStep(1)} className="flex-1 !h-14 sm:!h-16 italic font-black uppercase tracking-widest text-[9px] sm:text-[10px] rounded-2xl">Modify</Btn>
                <Btn onClick={() => { 
                   setSubmitting(true); 
                   setTimeout(() => { 
                     const userEmail = localStorage.getItem('userEmail') || user?.email || '';
                     addLoan({
                       user: { name: user?.name || userEmail || "Borrower", email: userEmail },
                       principalAmount: parseFloat(form.amount),
                       duration: Number(form.duration),
                       interestRate: 5,
                       remainingPrincipal: parseFloat(form.amount),
                       source: 'borrower_portal',
                       originationDate: new Date().toISOString().split('T')[0],
                       documents: {
                          idProof: 'uploaded',
                          addressProof: 'uploaded'
                       }
                     }); 
                     setSubmitting(false); 
                     setSubmitted(true); 
                   }, 1000); 
                 }} disabled={submitting} loading={submitting} className="flex-[2] !h-14 sm:!h-16 italic font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 text-[9px] sm:text-[10px]">
                   Submit Application
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

