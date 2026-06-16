import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative">
      <div className="pro-card w-full max-w-[420px] !p-12 space-y-12 bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 text-center">
        
        {/* INSTITUTIONAL BRANDING */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0a3d62] flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
            <Landmark size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">ARKAD FINANCE</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Identity Protocol 4.0</p>
          </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full h-14 bg-[#0a3d62] text-white text-xs font-black rounded-xl hover:bg-[#072a44] transition-all uppercase tracking-widest shadow-lg shadow-blue-900/10 active:scale-[0.98]"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="w-full h-14 bg-white border border-slate-200 text-slate-900 text-xs font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            Sign Up
          </button>
        </div>

        {/* COMPACT INFORMATION ROW */}
        <div className="pt-8 border-t border-slate-50 grid grid-cols-2 gap-8 text-left">
           {/* About Column */}
           <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0a3d62]">About Us</p>
              <p className="text-[10px] font-medium text-slate-500 leading-tight">
                Next-gen credit management utility for institutional lending cycles.
              </p>
           </div>

           {/* Contact Column */}
           <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0a3d62]">Connect</p>
              <div className="text-[10px] font-bold text-slate-400 space-y-0.5 leading-none">
                 <p>support@arkad.com</p>
                 <p>+260 971 000 000</p>
              </div>
           </div>
        </div>

        {/* FOOTER SIGNATURE */}
        <div className="pt-4 text-[8px] font-medium text-slate-200 uppercase tracking-[0.3em] text-center">
          © 2026 Secured Asset Management
        </div>

      </div>
    </div>
  );
}
