import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Smartphone, ChevronRight, RefreshCw } from 'lucide-react';

export default function OtpVerifyScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone || '+57 301 234 5678';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputs = useRef([]);

  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/borrower/profile'), 1200);
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-8 pb-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 transition-all active:scale-90">
          <ArrowLeft size={20}/>
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-gray-900 shadow-lg ">
             <Shield size={18} />
           </div>
           <span className="text-sm font-bold text-gray-900 tracking-wider">ARKAD<span className="text-blue-600"> FINANCE</span></span>
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm border border-blue-100/50">
              <Smartphone size={36} />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 leading-none mb-2">Verify Your WhatsApp</h2>
            <p className="text-gray-400 font-semibold text-xs">Enter the 6-digit verification code sent to</p>
            <p className="text-sm text-blue-600/80 font-bold mt-1 mb-3">{phone}</p>
            <p className="text-xs font-bold text-slate-500">Code expires in: <span className="text-red-500">{formatTime(timeLeft)}</span></p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex gap-2.5 justify-center">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-sm font-semibold bg-white border border-gray-100 rounded-xl shadow-sm
                    focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 focus:bg-gray-50 transition-all outline-none"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button type="submit" disabled={loading || otp.join('').length < 6}
                className="w-full py-2.5 rounded-lg font-semibold text-gray-900 text-sm
                  bg-blue-600 hover:bg-blue-700 
                   transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    Verify & Continue
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors group">
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  Request New Code
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 p-5 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <p className="text-xs text-blue-800/60 font-semibold text-center leading-relaxed">
               "Security is our top priority. We use industry-standard encryption to protect your data."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
