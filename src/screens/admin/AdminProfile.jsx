import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Mail, Shield, Edit2, Key, History, Activity, Zap, 
  ShieldAlert, Fingerprint, Lock, Globe, Settings, X, Radar, Calendar, 
  ChevronRight, CheckCircle2
} from 'lucide-react';
import { PageTitle, Btn, Modal, Divider } from '../../components/UI';

const DUMMY_ADMIN = {
  name: 'System Administrator',
  email: 'admin@loanpro.io',
  role: 'System Architect',
  initials: 'KA',
  joined: 'Oct 2024'
};

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user] = useState(DUMMY_ADMIN);
  const [editModal, setEditModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    newPassword: '',
    confirmPassword: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Admin Dossier" 
        subtitle="Manage institutional credentials and executive security protocols" 
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-1 space-y-8">
            <div className="pro-card p-10 bg-white border border-slate-100 shadow-sm text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-50" />
               <div className="relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center font-bold text-2xl shadow-xl rotate-12 group-hover:rotate-0 transition-transform mx-auto mb-6">
                     {user.initials}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{user.name}</h3>
                  <div className="mt-4 px-4 py-1.5 rounded-xl bg-primary/5 text-[9px] font-bold text-primary uppercase tracking-widest inline-flex items-center gap-2">
                     <Shield size={12} /> {user.role}
                  </div>
               </div>
            </div>

            <div className="pro-card p-8 bg-white border border-slate-100 shadow-sm space-y-6">
               <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1">Institutional Status</h4>
               <div className="space-y-3">
                  {[
                    { label: 'Security Node', value: 'Level 5', icon: Lock },
                    { label: 'Permission Set', value: 'Full Access', icon: Key },
                    { label: 'Cluster Region', value: 'Global Registry', icon: Globe },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-50 hover:bg-white hover:border-slate-100 transition-all">
                       <div className="flex items-center gap-3">
                          <m.icon size={14} className="text-primary" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                       </div>
                       <span className="text-xs font-bold text-slate-800 uppercase">{m.value}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="xl:col-span-2 space-y-8">
            <div className="pro-card p-10 bg-white border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-10 gap-6">
                  <div>
                     <h4 className="text-lg font-bold text-slate-800 tracking-tight">Identity Parameters</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Executive profile synchronization</p>
                  </div>
                  <Btn variant="outline" size="md" onClick={() => setEditModal(true)}>
                     <Edit2 size={14} className="mr-2" /> Modify Profile
                  </Btn>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Legal Name', value: user.name, icon: User },
                    { label: 'Institutional Email', value: user.email, icon: Mail },
                    { label: 'Network Alias', value: `@${user.name.toLowerCase().replace(' ', '_')}`, icon: Fingerprint },
                    { label: 'Commission Date', value: user.joined, icon: Calendar },
                  ].map((f, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex items-center gap-2 px-1">
                          <f.icon size={12} className="text-primary" />
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</label>
                       </div>
                       <div className="text-sm font-bold text-slate-800 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100">
                          {f.value}
                       </div>
                    </div>
                  ))}
               </div>

               <Divider />

               <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-rose-50 border border-rose-100">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 rounded-xl bg-white border border-rose-100 text-rose-500 flex items-center justify-center shadow-sm">
                        <LogOut size={22} />
                     </div>
                     <div>
                        <h5 className="text-[14px] font-bold text-slate-800 uppercase tracking-tight">Terminate Session</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Safely exit the administrative bridge</p>
                     </div>
                  </div>
                  <Btn className="!bg-rose-600 hover:!bg-rose-700 !rounded-xl !px-10 h-12" onClick={handleLogout}>
                     Logout Protocol
                  </Btn>
               </div>
            </div>

            <div className="p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center group transition-colors hover:border-primary/30">
               <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 mb-4 group-hover:text-primary transition-all">
                  <Radar size={22} className="animate-pulse" />
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed">
                 Institutional Telemetry Active<br />
                 Biometric Signature Verified for {user.name}
               </p>
            </div>
         </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Modify Administrative Profile">
         <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <input className="premium-input h-12" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                  <input className="premium-input h-12" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
               </div>
            </div>

            <Divider text="Security Update" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">New Password</label>
                  <input className="premium-input h-12" type="password" placeholder="••••••••" value={form.newPassword} onChange={e => setForm(f => ({...f, newPassword: e.target.value}))} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Confirm Protocol</label>
                  <input className="premium-input h-12" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm(f => ({...f, confirmPassword: e.target.value}))} />
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4 text-amber-700">
               <ShieldAlert size={18} className="mt-0.5 shrink-0" />
               <p className="text-[10px] font-bold uppercase tracking-widest italic pt-1 leading-relaxed">Institutional Warning: Modifications will be logged in the system audit trail and assigned to your biometric token.</p>
            </div>

            <div className="flex gap-4 pt-4">
               <Btn variant="outline" className="flex-1 h-14" onClick={() => setEditModal(false)}>Cancel</Btn>
               <Btn className="flex-1 h-14" onClick={() => {
                  setEditModal(false);
                  showToast('Dossier Updated Successfully');
               }}>Synchronize Changes</Btn>
            </div>
         </div>
      </Modal>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 transition-all border border-white/10">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
             <CheckCircle2 size={16} className="text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest italic">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
