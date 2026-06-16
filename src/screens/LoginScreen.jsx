import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight,
  ShieldAlert,
  Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ROLES = [
  { label: 'Administrator', role: 'admin', email: 'admin@arkad.com', portal: 'admin' },
  { label: 'Staff Member', role: 'staff', email: 'staff@arkad.com', portal: 'admin' },
  { label: 'Borrower', role: 'borrower', email: 'borrower@arkad.com', portal: 'user' },
  { label: 'Partner Agent', role: 'agent', email: 'agent@arkad.com', portal: 'user' },
];

export default function LoginScreen({ isAdminPortal = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('arkad123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter roles based on portal type
  // Show all roles as it's now a unified portal
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
          // Unified login: no portal mismatch checks needed

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
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#0a3d62] rounded-full flex items-center justify-center text-white mx-auto shadow-lg mb-4">
            <Landmark size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            CENTRAL ACCESS PORTAL
          </h1>
          <p className="text-sm font-medium text-slate-400">Enter your credentials to continue</p>
        </div>

        {/* Test Accounts */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Test Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {activeRoles.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDemoSelect(r)}
                className="p-3 bg-white border border-slate-100 rounded-xl text-left hover:border-[#0a3d62]/30 hover:bg-slate-50 transition-all group shadow-sm"
              >
                <p className="text-[11px] font-bold text-slate-900 uppercase group-hover:text-[#0a3d62]">{r.label}</p>
                <p className="text-[9px] text-slate-400 truncate">{r.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  className="w-full h-12 pl-12 pr-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0a3d62] transition-all"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
              <ShieldAlert size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-[#0a3d62] text-white font-bold rounded-xl shadow-lg hover:bg-[#072a44] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS PORTAL'}
            {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              New to the system? 
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="ml-2 text-[#0a3d62] hover:underline font-black italic"
              >
                Create Account →
              </button>
            </p>
          </div>
        </form>

        <div className="text-center space-y-3">
          <p className="text-center text-[10px] font-medium text-slate-300 uppercase tracking-[0.2em] italic">
            © 2026 Secured Asset Management System
          </p>
          <div>
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                alert('System cache cleared! Resetting demo data and reloading...');
                window.location.reload();
              }}
              className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest hover:underline italic"
            >
              Reset System Cache & Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
