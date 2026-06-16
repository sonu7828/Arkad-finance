import React, { useState } from 'react';
import { LogOut, Edit2, Phone, Mail, Building, User, Shield, Activity, Lock, CheckCircle2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Btn, PageTitle, Input } from '../../components/UI';
import Modal from '../../components/Modal';

const DUMMY_USER = {
  name: 'Operations Staff',
  email: 'staff@loanpro.io',
  phone: '+260971001000',
  businessName: 'LoanPro Capital',
  role: 'Staff Manager',
  initials: 'KS',
};

export default function StaffProfile() {
  const navigate = useNavigate();
  const [user] = useState(DUMMY_USER);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    businessName: user.businessName,
    email: user.email,
    phone: user.phone,
    newPassword: '',
    confirmPassword: '',
  });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleLogout = () => { navigate('/login'); };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="pro-card rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.2),transparent)]" />
          <div className="absolute top-4 right-6 flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Node Online</span>
          </div>
        </div>

        <div className="px-8 pb-8 -mt-10">
          <div className="flex items-end justify-between mb-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-primary font-bold text-2xl ring-4 ring-slate-50">
              {user.initials}
            </div>
            <div className="flex gap-3">
              <Btn variant="outline" onClick={() => setEditModal(true)} size="md">
                <Edit2 size={14} className="mr-2" /> Edit Identity
              </Btn>
              <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl ring-1 ring-rose-100 text-rose-600 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all bg-rose-50">
                <LogOut size={14} /> Terminate
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</span>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                <Shield size={12} className="text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 pro-card rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Identity Metadata</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Core identity parameters and communication vectors</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Phone, label: 'Phone', value: user.phone },
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Building, label: 'Company', value: user.businessName },
              { icon: Shield, label: 'Authority', value: user.role },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-white group transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform shadow-sm">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-tight truncate">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="pro-card rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex-1">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Node Status</h3>
            </div>
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 ring-2 ring-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-600 uppercase tracking-tight">Active & Verified</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Node operational and authorized</p>
              </div>
            </div>
          </div>

          <div className="pro-card rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Authorization Doc</h3>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <div className="p-6">
              <label className="flex flex-col items-center justify-center gap-3 w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-primary flex items-center justify-center transition-all">
                  <Zap size={18} className="text-slate-300 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Sync Proof Document</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Image or PDF</p>
                </div>
                <input type="file" accept="image/*,.pdf" className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Update Identity Parameters">
        <div className="space-y-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Legal Name', key: 'name', type: 'text' },
              { label: 'Corporate Entity', key: 'businessName', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Phone Number', key: 'phone', type: 'tel' },
            ].map(({ label, key, type }) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
                <Input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="h-11" />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={12} className="text-primary" />
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Protocol Update</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'New Password', key: 'newPassword' },
                { label: 'Confirm Password', key: 'confirmPassword' },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
                  <Input type="password" placeholder="••••••••" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="h-11" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Btn variant="outline" className="flex-1 h-12" onClick={() => setEditModal(false)}>Cancel</Btn>
            <Btn className="flex-[2] h-12 shadow-lg" onClick={() => {
              if (form.newPassword && form.newPassword !== form.confirmPassword) { showToast('Passwords do not match'); return; }
              setEditModal(false);
              showToast('Identity parameters synchronized successfully');
            }}>
              <Edit2 size={14} className="mr-2" /> Synchronize Identity
            </Btn>
          </div>
        </div>
      </Modal>

      {toastMsg && (
        <div className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest italic">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}
