import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Search, UserPlus, Trash2, Mail, Phone, Lock,
  CheckCircle2, Activity, Shield, Key, History, User, Activity as ActivityIcon,
  Fingerprint, Zap, ShieldAlert, RotateCcw, MoreVertical, ChevronRight
} from 'lucide-react';
import { StatusBadge, PageTitle, StatCard, Btn, Input, Modal, FormField, Divider } from '../../components/UI';

const DUMMY_ADMINS = [
  { id: 'ADM-001', name: 'Master Control', email: 'admin@arkad.com', phone: '+1 888 999 0000', lastLogin: '2 mins ago' },
  { id: 'ADM-002', name: 'Sarah Security', email: 'sarah.sec@arkad.com', phone: '+1 888 999 0001', lastLogin: '1 hour ago' },
  { id: 'ADM-003', name: 'Robert Risk', email: 'robert.risk@arkad.com', phone: '+1 888 999 0002', lastLogin: 'Yesterday' },
];

export default function AdminAdmins() {
  const [admins, setAdmins] = useState(DUMMY_ADMINS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: 'AdminPassword123!' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return admins.filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [admins, search]);

  const handleAddAdmin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newAdmin = { ...form, id: `ADM-00${admins.length + 1}`, lastLogin: 'Just now' };
      setAdmins([newAdmin, ...admins]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setForm({ name: '', email: '', phone: '', password: 'AdminPassword123!' });
    }, 1000);
  };

  const handleDeleteAdmin = (id) => {
    setAdmins(p => p.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Institutional Nodes" 
        subtitle="Manage system administrators and root-level access permissions" 
        action={
           <Btn size="md" onClick={() => setIsModalOpen(true)}>
              <UserPlus size={16} className="mr-2" /> Add Root Admin
           </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Admins" value={admins.length} icon={Shield} color="text-primary" />
        <StatCard label="Active Sessions" value={admins.length} icon={Zap} color="text-emerald-500" />
        <StatCard label="System Integrity" value="Stable" icon={ShieldCheck} color="text-indigo-400" />
      </section>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
           <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Root Registry</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized system controllers</p>
           </div>
           <div className="relative flex-1 md:max-w-xs w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                className="premium-input pl-12 h-12"
                placeholder="Search administrators..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filtered.map(a => (
             <div key={a.id} className="pro-card p-8 group relative overflow-hidden flex flex-col h-full bg-white border border-slate-100 hover:shadow-lg transition-all duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl opacity-50" />
                
                <div className="relative z-10 flex-1">
                   <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                         <ShieldCheck size={20} />
                      </div>
                      <StatusBadge status="ADMIN" />
                   </div>

                   <div className="space-y-4">
                      <div>
                         <h4 className="text-lg font-bold text-slate-800 tracking-tight transition-colors group-hover:text-primary">{a.name}</h4>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{a.email}</p>
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                            <ActivityIcon size={12} className="text-slate-300" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{a.lastLogin}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <Phone size={12} className="text-primary" />
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{a.phone}</p>
                         </div>
                      </div>
                   </div>
                </div>
     
                <div className="mt-8 pt-6 border-t border-slate-50 relative z-10 flex gap-2">
                     <Btn 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAdmin(a.id)}
                        className="flex-1 !text-rose-500 hover:!bg-rose-50 border-rose-100"
                     >
                        <Trash2 size={14} className="mr-2" /> Revoke
                     </Btn>
                     <Btn variant="outline" size="sm" className="w-10 px-0">
                        <MoreVertical size={14} />
                     </Btn>
                 </div>
             </div>
           ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Administrator Authorization">
         <form onSubmit={handleAddAdmin} className="space-y-6">
            <FormField label="Assignee Name">
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name" required />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField label="Security Email">
                 <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@arkad.com" required />
               </FormField>
               <FormField label="Contact Registry">
                 <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+..." required />
               </FormField>
            </div>
            <FormField label="Access Key (Encrypted)">
               <Input value={form.password} onChange={e => setForm({...form, password: e.target.value})} type="password" />
            </FormField>
            
            <div className="flex gap-4 pt-4">
               <Btn variant="outline" type="button" className="flex-1 h-14" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
               <Btn type="submit" loading={isSubmitting} className="flex-[2] h-14">Authorize Node</Btn>
            </div>
         </form>
      </Modal>
    </div>
  );
}

