import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, ArrowLeft, User, Mail, 
  Lock, CheckCircle2, ShieldAlert,
  Fingerprint, Landmark, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ fixedRole }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', agentCode: '', role: fixedRole || 'BORROWER'
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Map phone to email/password to integrate with existing AuthContext
    const finalForm = {
      ...form,
      email: form.phone ? `${form.phone.replace(/\s+/g, '')}@wa.me` : '',
      password: 'arkad123'
    };
    
    const res = await register(finalForm);
    
    if (res.success) {
      // Automatic CRM Lead Generation
      if (form.role === 'BORROWER') {
        const savedLeads = localStorage.getItem('crm_leads');
        const leads = savedLeads ? JSON.parse(savedLeads) : [];
        
        const newLead = {
          id: `L-AUTO-${Date.now()}`,
          name: form.name,
          email: finalForm.email,
          phone: form.phone || 'Not provided',
          status: 'NEW SIGNUP',
          lastContact: new Date().toISOString().split('T')[0],
          nextFollowUp: new Date().toISOString().split('T')[0],
          notes: 'Automatic lead generated via website registration.',
          priority: 'high'
        };
        
        localStorage.setItem('crm_leads', JSON.stringify([newLead, ...leads]));
      }

      setSuccess(true);
      setTimeout(() => navigate('/otp', { state: { phone: form.phone } }), 2000);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans text-slate-900">
      <div className="w-full max-w-md space-y-8">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate('/login')} 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          {success ? (
            <div className="text-center py-12 space-y-6">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                 <CheckCircle2 size={40} />
               </div>
               <div className="space-y-2">
                 <h3 className="text-2xl font-black uppercase tracking-tight">Account Created</h3>
                 <p className="text-sm font-medium text-slate-400">Redirecting to WhatsApp verification...</p>
               </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* HEADER */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg mb-4">
                  <Landmark size={24} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Create Account</h2>
                <p className="text-sm font-medium text-slate-400">Join our secure lending network</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${form.role === r.role ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'}`}
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <input 
                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                      type="tel"
                      placeholder="+57 301 234 5678"
                      value={form.phone || ''}
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
                      value={form.agentCode || ''}
                      onChange={e => update('agentCode', e.target.value)}
                    />
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
                  {loading ? 'PROCESSING...' : 'GET VERIFICATION CODE'}
                  {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
