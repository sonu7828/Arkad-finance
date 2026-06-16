import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  Phone, 
  Shield, 
  Edit3, 
  Lock, 
  Camera, 
  Upload, 
  Gift, 
  ShieldCheck, 
  User, 
  ArrowRight,
  UserCircle2,
  Mail,
  ShieldAlert,
  Save,
  CheckCircle2,
  Activity,
  FileText,
  Fingerprint,
  Calendar
} from 'lucide-react';
import { PageTitle, Btn, Input, Modal, FormField, Divider } from '../../components/UI';
import { fileToDataUrl, loadSavedImage, saveImageLocally } from '../../utils/fileUploads';
import KYCUploadModal from '../../components/KYCUploadModal';

const DUMMY_USER = {
  name: 'John Borrower',
  phone: '+260 971 009 900',
  nrc: 'NRC-200188',
  nrcType: 'National ID Card',
  role: 'BORROWER',
  initials: 'JB',
  id: 'BRW-0019',
  email: 'john.borrower@arkad.com',
  agentCode: 'AG-2024-CARLOS',
  memberSince: 'Jan 15, 2024'
};

export default function BorrowerProfile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const user = {
    ...DUMMY_USER,
    name: authUser?.name || DUMMY_USER.name,
    id: authUser?.id || DUMMY_USER.id,
    email: authUser?.email || DUMMY_USER.email,
    phone: authUser?.phone || DUMMY_USER.phone,
    agentCode: authUser?.agentCode || DUMMY_USER.agentCode
  };
  const [toastMsg, setToastMsg] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [kycModal, setKycModal] = useState(false);
  const [kycStatus, setKycStatus] = useState('verified'); // Enforce KYC Verified by default

  React.useEffect(() => {
    localStorage.setItem('kycStatus', 'verified');
  }, []);

  const [profileImageStorageKey, setProfileImageStorageKey] = useState(`profile-photo:${user?.id || 'borrower'}`);
  const [profilePhoto, setProfilePhoto] = useState(() => loadSavedImage(`profile-photo:${user?.id || 'borrower'}`));
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [kycFiles, setKycFiles] = useState({
    idFront: null,
    idBack: null,
    addressProof: null,
    additionalDoc: null
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogout = () => { navigate('/login'); };

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setProfilePhoto(dataUrl);
    saveImageLocally(profileImageStorageKey, dataUrl);
    showToast('Profile Photo Updated');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
          {/* ── PROFILE HERO ── */}
      <section className="pro-card relative overflow-hidden !p-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-slate-900 to-primary/80" />
        <div className="relative pt-16 pb-10 px-8 flex flex-col items-center text-center">
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={64} />
              )}
              <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm">
                 <Camera size={20} />
                 <span className="text-[10px] font-bold uppercase mt-1">Update</span>
                 <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
              </label>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg z-20">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-widest">{user.role}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {user.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-8">
             <Btn variant="outline" size="sm" onClick={() => setEditModal(true)} className="!px-8 !bg-white !rounded-xl shadow-sm">
                <Edit3 size={14} className="mr-2" /> Edit Details
             </Btn>
             <button onClick={handleLogout} className="h-10 px-6 rounded-xl border border-rose-100 text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2">
                <LogOut size={14} /> Log Out
             </button>
          </div>
        </div>
      </section>

      {/* ── INFO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Dossier */}
        <div className="pro-card space-y-8 !p-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                    <UserCircle2 size={20} />
                 </div>
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Identity Dossier</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
           </div>
           
            <div className="space-y-6">
               {[
                 { label: 'Full Legal Name', value: user.name, icon: User },
                 { label: 'Registered Email', value: user.email, icon: Mail },
                 { label: 'WhatsApp Number', value: user.phone, icon: Phone },
                 { label: 'National ID Type', value: user.nrcType, icon: FileText },
                 { label: 'KYC Status', value: '✓ Verified', icon: ShieldCheck, colorClass: 'text-emerald-600 font-extrabold' },
                 { label: 'Agent Code', value: user.agentCode || 'None', icon: Fingerprint },
                 { label: 'Member Since', value: user.memberSince, icon: Calendar }
               ].map((item, i) => (
                 <div key={i} className="flex flex-col group">
                    <div className="flex items-center gap-2 mb-1.5 text-slate-400 group-hover:text-primary transition-colors">
                       <item.icon size={12} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className={`text-sm font-bold ml-5 ${item.colorClass || 'text-slate-700'}`}>{item.value}</p>
                 </div>
               ))}
            </div>
        </div>

        {/* Security & Verification */}
        <div className="pro-card space-y-8 !p-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                    <ShieldCheck size={20} />
                 </div>
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Compliance Status</h3>
              </div>
           </div>

           <div className="space-y-4">
              <div className="p-5 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl flex items-center justify-between group hover:bg-emerald-50 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                       <CheckCircle2 size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-800 mb-0.5 tracking-tight">Authenticated</p>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-80">Active Member</p>
                    </div>
                 </div>
              </div>

               <div className="p-5 bg-amber-50/40 border border-amber-100/50 rounded-2xl flex items-center justify-between group hover:bg-amber-50 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                       <Activity size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-800 mb-0.5 tracking-tight">KYC Registry</p>
                       <p className={`text-[10px] font-bold uppercase tracking-widest opacity-80 ${kycStatus === 'pending_admin_review' ? 'text-blue-600' : kycStatus === 'verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                         {kycStatus === 'pending_admin_review' ? 'Under Review' : kycStatus === 'verified' ? 'Verified' : 'Action Required'}
                       </p>
                       {kycStatus !== 'missing' && (
                         <button 
                           onClick={() => {
                             localStorage.removeItem('kycStatus');
                             setKycStatus('missing');
                           }}
                           className="text-[8px] font-bold text-slate-400 hover:text-rose-500 underline uppercase tracking-widest mt-1"
                         >
                           Reset Demo Flow
                         </button>
                       )}
                    </div>
                 </div>
                 {kycStatus !== 'pending_admin_review' && kycStatus !== 'verified' && (
                   <Btn variant="ghost" size="sm" className="!text-[9px] !px-4 !bg-white/50 hover:!bg-white shadow-sm !rounded-lg" onClick={() => setKycModal(true)}>Upload Docs</Btn>
                 )}
              </div>
           </div>
        </div>

      </div>

      <div className="pro-card relative overflow-hidden !p-8 group">
         <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32 group-hover:translate-x-24 transition-transform duration-700" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
               <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-primary shadow-xl rotate-3 group-hover:rotate-0 transition-all">
                  <Lock size={28} />
               </div>
               <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight mb-1">Account Security</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">System-wide encryption is active. Manage your access tokens and security credentials here.</p>
               </div>
            </div>
            <Btn variant="outline" size="sm" onClick={() => setEditModal(true)} className="!bg-white !px-8 !h-12 !rounded-xl shadow-lg shadow-slate-200/50 border-slate-200 hover:border-primary group-hover:scale-105 transition-all w-full md:w-auto">
               <ShieldAlert size={16} className="mr-2" /> Change Password
            </Btn>
         </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Update Personal Information">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Legal Name">
               <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Email Registry">
               <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </FormField>
          </div>
          
          <Divider text="Security Credentials" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="New Security Token">
               <Input type="password" placeholder="••••••••" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
            </FormField>
            <FormField label="Confirm Token">
               <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Btn variant="outline" className="!rounded-xl" onClick={() => setEditModal(false)}>Cancel</Btn>
            <Btn className="!rounded-xl !px-10" onClick={() => { setEditModal(false); showToast('Profile Updated'); }}>
              <Save size={16} className="mr-2" /> Save Profile
            </Btn>
          </div>
        </div>
      </Modal>

      <KYCUploadModal 
        isOpen={kycModal} 
        onClose={() => setKycModal(false)} 
        onSubmit={(data) => {
          console.log("KYC Submitted Data:", data);
          setKycStatus('pending_admin_review'); 
          localStorage.setItem('kycStatus', 'pending_admin_review');
          setKycModal(false); 
          showToast('KYC Documents Submitted for Review'); 
        }} 
      />

      {/* Modern Toast */}
      {toastMsg && createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100000005] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
            <CheckCircle2 className="text-emerald-400" size={24} />
            <span className="text-sm font-bold tracking-tight">{toastMsg}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
