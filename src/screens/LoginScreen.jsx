import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight,
  ShieldAlert,
  Landmark,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal, Btn } from '../components/UI';

const DEMO_ROLES = [
  { label: 'Administrator', role: 'admin', email: 'admin@arkad.com', portal: 'admin' },
  { label: 'Staff Member', role: 'staff', email: 'staff@arkad.com', portal: 'admin' },
  { label: 'Borrower', role: 'borrower', email: 'borrower@arkad.com', portal: 'user' },
  { label: 'Partner Agent', role: 'agent', email: 'agent@arkad.com', portal: 'user' },
];

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('arkad123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const activeRoles = DEMO_ROLES;

  const handleDemoSelect = (role) => {
    setEmail(role.email);
    setPassword('arkad123');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setError('');
    setLoading(true);
    
    setTimeout(async () => {
      try {
        const result = await login(email, password);
        if (result.success) {
          navigate(`/${result.role}/dashboard`, { replace: true });
        } else {
          setError('Invalid credentials.');
        }
      } catch (err) {
        setError('Login failed. Try again.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* LEFT COLUMN - Marketing/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-8 lg:p-10 flex-col justify-between text-white relative overflow-hidden shrink-0 h-full">
        {/* Abstract background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
            <Landmark className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tighter uppercase italic">
              ARKAD<span className="text-primary">FINANCE</span>
            </h1>
            <p className="text-[8px] font-bold text-indigo-300/80 uppercase tracking-widest leading-none">Unified Platform</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-4 max-w-sm my-auto relative z-10">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Real-Time Credit & <br />
            <span className="bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">Operations Monitoring</span>
          </h2>
          <p className="text-indigo-200/70 text-xs leading-relaxed">
            Manage loans, incoming applications, client portfolios, agent commissions, and collateral under a secured, comprehensive financial ecosystem.
          </p>
          
          <div className="pt-2 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xl font-bold text-white">99.8%</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 mt-0.5">SLA Uptime</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xl font-bold text-white">256-bit</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 mt-0.5">AES Encrypted</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-indigo-300/40 text-[10px] relative z-10">
          © 2026 Arkad Finance. SAMS Secured.
        </div>
      </div>

      {/* RIGHT COLUMN - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-8 bg-slate-50 relative h-full overflow-hidden">
        
        {/* Floating Back to Website Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[11px] font-bold rounded-lg border border-slate-200/80 shadow-sm transition-all flex items-center gap-1.5 group cursor-pointer active:scale-95"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Website
        </button>

        {/* Login Card */}
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 lg:p-7 shadow-lg border border-slate-200/40 space-y-4">
          
          {/* HEADER */}
          <div className="text-center space-y-1">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-2">
              <Landmark size={20} />
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              CENTRAL ACCESS PORTAL
            </h1>
            <p className="text-[11px] font-medium text-slate-400">Enter your credentials to continue</p>
          </div>

          {/* Test Accounts */}
          <div className="space-y-2">
            <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Fast-Track Test Access</p>
            <div className="grid grid-cols-2 gap-1.5">
              {activeRoles.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDemoSelect(r)}
                  className="p-2 bg-slate-50/50 border border-slate-200/60 rounded-lg text-left hover:border-primary/40 hover:bg-primary/[0.02] transition-all group cursor-pointer"
                >
                  <p className="text-[10px] font-bold text-slate-800 uppercase group-hover:text-primary leading-tight">{r.label}</p>
                  <p className="text-[8px] text-slate-400 truncate mt-0.5 leading-none">{r.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-2.5">
              <div className="space-y-0.5">
                <label className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    className="w-full h-9 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setShowResetModal(true)}
                    className="text-[8px] font-extrabold text-primary hover:underline uppercase tracking-widest"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    className="w-full h-9 pl-10 pr-10 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100/80 animate-fade-in">
                <ShieldAlert size={14} className="shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-wide">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-10 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-md shadow-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-1 group disabled:opacity-70 cursor-pointer active:scale-98 text-xs"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS PORTAL'}
              {!loading && <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>

            <div className="text-center pt-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                New to the system? 
                <button 
                  type="button"
                  onClick={() => navigate('/register')}
                  className="ml-1.5 text-primary hover:underline font-black italic"
                >
                  Create Account →
                </button>
              </p>
            </div>
          </form>


        </div>
      </div>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password Access">
        <div className="space-y-4 text-left p-2">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-800">Instructions Dispatched</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">A password reset link has been simulated. Please check your inbox.</p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Btn onClick={() => setShowResetModal(false)} className="!h-10 text-[9px] uppercase font-black tracking-widest px-6 rounded-xl">
              Close Registry
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
