import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, ShieldCheck, Camera, Edit3, LogOut, 
  MapPin, Award, TrendingUp, Users, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { Btn, Modal, FormField, Input, Divider } from '../../components/UI';
import { loadSavedImage, saveImageLocally, fileToDataUrl } from '../../utils/fileUploads';

const DUMMY_AGENT = {
  name: 'Demo Partner',
  id: 'AGT-10294',
  email: 'agent@arkad.com',
  phone: '+260 965 221 000',
  location: 'Lusaka HQ',
  trustScore: '99%',
  totalReferrals: 150,
  status: 'CERTIFIED AGENT'
};

export default function AgentProfile() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [editModal, setEditModal] = useState(false);
  
  // Use session name/id/commission if available
  const user = {
    ...DUMMY_AGENT,
    name: authUser?.name || 'Carlos Menendez',
    id: authUser?.id || 'AG-2024-CARLOS',
    email: authUser?.email || 'agent@arkad.com',
    commissionRate: authUser?.commissionRate || '10%'
  };
  
  const profileImageStorageKey = `agent-profile-photo:${user.id}`;
  const [profilePhoto, setProfilePhoto] = useState(() => loadSavedImage(profileImageStorageKey));

  const handleLogout = () => { logout(); };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setProfilePhoto(dataUrl);
    saveImageLocally(profileImageStorageKey, dataUrl);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ── AGENT HEADER CARD ── */}
      <section className="pro-card !py-12 flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2rem] border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Agent" className="w-full h-full object-cover" />
            ) : (
              <User size={64} />
            )}
            <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white">
               <Camera size={20} />
               <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          <div className="absolute bottom-1 right-1 w-10 h-10 bg-[#0a3d62] rounded-xl border-4 border-white flex items-center justify-center text-white shadow-lg">
            <Award size={20} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-2">
             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">{user.status}</span>
             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">Code: {user.id}</span>
             <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">Rate: {user.commissionRate}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
           <Btn variant="outline" size="sm" onClick={() => setEditModal(true)} className="!px-6 !bg-white">Edit Profile</Btn>
           <button onClick={handleLogout} className="h-10 px-6 rounded-xl border border-rose-100 text-rose-500 font-bold text-xs uppercase hover:bg-rose-50 transition-all">Log Out</button>
        </div>
      </section>

      {/* ── PARTNER STATS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
         {[
           { label: 'Trust Score', value: user.trustScore, icon: ShieldCheck, color: 'text-emerald-500' },
           { label: 'Active Network', value: user.totalReferrals, icon: Users, color: 'text-[#0a3d62]' },
           { label: 'Market Reach', value: user.location, icon: MapPin, color: 'text-amber-500' }
         ].map((stat, i) => (
           <div key={i} className="pro-card p-6 sm:p-8 flex flex-col items-center text-center space-y-2 group hover:border-primary/20 transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color} mb-2 shadow-inner group-hover:scale-110 transition-transform`}>
                 <stat.icon size={24} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tighter italic">{stat.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{stat.label}</p>
           </div>
         ))}
      </div>

      {/* ── CONTACT & CREDENTIALS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="pro-card p-6 sm:p-10 space-y-8">
           <div className="border-b border-slate-50 pb-6 flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tighter italic uppercase leading-none">Contact Protocol</h3>
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Verified Outreach</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 text-slate-300">
                 <Mail size={18} />
              </div>
           </div>
           <div className="space-y-6">
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Official Email</span>
                 <p className="text-sm sm:text-base font-black text-slate-800 italic tracking-tight break-all">{user.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Business Line</span>
                 <p className="text-sm sm:text-base font-black text-slate-800 italic tracking-tight">{user.phone}</p>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Agent Code</span>
                 <p className="text-sm sm:text-base font-black text-slate-800 italic tracking-tight">{user.id}</p>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Commission Rate</span>
                 <p className="text-sm sm:text-base font-black text-emerald-600 italic tracking-tight">{user.commissionRate}</p>
              </div>
           </div>
        </div>

        <div className="pro-card p-6 sm:p-10 space-y-8">
           <div className="border-b border-slate-50 pb-6 flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tighter italic uppercase leading-none">Performance Growth</h3>
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Growth Metrics</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 text-slate-300">
                 <TrendingUp size={18} />
              </div>
           </div>
           <div className="space-y-6">
              <div className="p-5 bg-emerald-50/50 border border-emerald-100/50 rounded-[1.5rem] flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                       <CheckCircle2 size={20} />
                    </div>
                    <div>
                       <p className="text-xs sm:text-sm font-black text-slate-800 italic uppercase leading-none mb-1">Elite Status</p>
                       <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Active Partner</p>
                    </div>
                 </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-bold leading-relaxed italic">
                Your referral node is currently performing <span className="text-primary underline decoration-primary/20 decoration-2 underline-offset-4">15% better</span> than last month. Keep building your network.
              </p>
           </div>
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Agent Settings">
         <div className="space-y-6 p-2">
            <FormField label="Full Name">
               <Input value={user.name} readOnly />
            </FormField>
            <FormField label="Mobile Number">
               <Input value={user.phone} readOnly />
            </FormField>
            <div className="flex justify-end pt-4">
               <Btn onClick={() => setEditModal(false)}>Close Registry</Btn>
            </div>
         </div>
      </Modal>

    </div>
  );
}
