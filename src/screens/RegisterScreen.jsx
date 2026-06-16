import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, ArrowLeft, User, Mail, 
  Lock, CheckCircle2, ShieldAlert,
  Fingerprint, Landmark, ChevronRight, Smartphone, RefreshCw, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ fixedRole }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  
  // Registration form inputs
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '', // WhatsApp Number
    agentCode: '',
    password: '',
    role: fixedRole || 'BORROWER'
  });

  // OTP Verification state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(585); // 9 minutes and 45 seconds (9:45)
  const [resendTimer, setResendTimer] = useState(30); // 30 seconds resend countdown
  const inputsRef = useRef([]);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // OTP Countdown timer
  useEffect(() => {
    if (step !== 2) return;
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [step, timeLeft]);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (step !== 2) return;
    if (resendTimer <= 0) return;
    const timerId = setInterval(() => setResendTimer(r => r - 1), 1000);
    return () => clearInterval(timerId);
  }, [step, resendTimer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate sending OTP code
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimeLeft(585); // Reset to 9:45
      setResendTimer(30); // Reset resend timer
    }, 1200);
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    // Register user with credentials in global context
    const res = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role.toLowerCase(),
      agentCode: form.agentCode
    });

    if (res.success) {
      // Auto-generate CRM lead if borrower
      if (form.role === 'BORROWER') {
        const savedLeads = localStorage.getItem('crm_leads');
        const leads = savedLeads ? JSON.parse(savedLeads) : [];
        const newLead = {
          id: `L-AUTO-${Date.now()}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          status: 'NEW SIGNUP',
          lastContact: new Date().toISOString().split('T')[0],
          nextFollowUp: new Date().toISOString().split('T')[0],
          notes: 'Automatic lead generated via website registration.',
          priority: 'high'
        };
        localStorage.setItem('crm_leads', JSON.stringify([newLead, ...leads]));
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(res.message || 'OTP verification failed. Please try again.');
    }
    setLoading(false);
  };

  const handleResendCode = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setResendTimer(30);
    setError('');
    setInfoMessage('Verification OTP code resent successfully to WhatsApp!');
    setTimeout(() => setInfoMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans text-slate-900">
      <div className="w-full max-w-md space-y-8">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate('/login')} 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          {step === 2 ? 'Back to Step 1' : 'Back to Login'}
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          {success ? (
            <div className="text-center py-12 space-y-6">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                 <CheckCircle2 size={40} />
               </div>
               <div className="space-y-2">
                 <h3 className="text-2xl font-black uppercase tracking-tight">Verified Successfully</h3>
                 <p className="text-sm font-medium text-slate-400">Account created. Redirecting to login...</p>
               </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-8">
              {/* HEADER */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#0a3d62] rounded-full flex items-center justify-center text-white mx-auto shadow-lg mb-4">
                  <Landmark size={24} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Create Account</h2>
                <p className="text-sm font-medium text-slate-400">Join our secure lending network (Step 1/2)</p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-5">
                {/* ROLE PICKER */}
                {!fixedRole && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Borrower', role: 'BORROWER', icon: User },
                      { label: 'Agent', role: 'AGENT', icon: Fingerprint }
                    ].map(r => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => update('role', r.role)}
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${form.role === r.role ? 'bg-[#0a3d62] border-[#0a3d62] text-white shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'}`}
                      >
                        <r.icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{r.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                      type="text"
                      placeholder="Enter legal name"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <input 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                      type="tel"
                      placeholder="+57 301 234 5678"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agent Code (Optional)</label>
                    <input 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                      type="text"
                      placeholder="e.g. AG-2024-CARLOS"
                      value={form.agentCode}
                      onChange={e => update('agentCode', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <input 
                        className="w-full h-12 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => update('password', e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                    <ShieldAlert size={18} />
                    <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-[#0a3d62] text-white font-bold rounded-xl shadow-lg hover:bg-[#072a44] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {loading ? 'SENDING OTP...' : 'GET VERIFICATION CODE'}
                  {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: OTP */
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center text-[#0a3d62] mx-auto mb-4 border border-blue-100/30">
                  <Smartphone size={36} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Verify WhatsApp</h2>
                <p className="text-xs font-medium text-slate-400">We sent code to <span className="font-bold text-slate-700">{form.phone}</span></p>
                <p className="text-[11px] font-black text-rose-500 mt-2 uppercase tracking-wider">
                  Expires in: {formatTime(timeLeft)}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => inputsRef.current[idx] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-lg font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0a3d62] focus:bg-white transition-all shadow-inner"
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                    <ShieldAlert size={18} />
                    <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                  </div>
                )}

                {infoMessage && (
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <CheckCircle2 size={18} />
                    <p className="text-xs font-bold uppercase tracking-tight">{infoMessage}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading || otp.join('').length < 6}
                  className="w-full h-14 bg-[#0a3d62] text-white font-bold rounded-xl shadow-lg hover:bg-[#072a44] transition-all flex items-center justify-center gap-2 group disabled:opacity-75"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY CODE'}
                  {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={handleResendCode}
                    disabled={resendTimer > 0}
                    className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all ${resendTimer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-[#0a3d62] hover:underline'}`}
                  >
                    <RefreshCw size={12} className={resendTimer > 0 ? '' : 'animate-spin-slow'} />
                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
