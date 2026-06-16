import React, { useState, useMemo } from 'react';
import { 
  UserPlus, ShieldCheck, Activity, Search, Trash2, Mail, Phone, Lock, Upload,
  CheckCircle2, Briefcase, Zap, ArrowRight, ShieldAlert, Users, Trash, Download
} from 'lucide-react';
import { PageTitle, StatusBadge, Btn, StatCard, Input, Modal, Divider, FormField } from '../../components/UI';

const DUMMY_STAFF = [
  { id: 'STF-001', name: 'Alice Cooper', businessName: 'Credit Operations', email: 'alice@arkad.com', phone: '+1 234 567 8901', isApproved: true, plan: 'paid', createdAt: '2024-01-15' },
  { id: 'STF-002', name: 'Bob Marley', businessName: 'Risk Assessment', email: 'bob@arkad.com', phone: '+1 234 567 8902', isApproved: true, plan: 'standard', createdAt: '2024-02-20' },
  { id: 'STF-003', name: 'Charlie Sheen', businessName: 'Customer Success', email: 'charlie@arkad.com', phone: '+1 234 567 8903', isApproved: false, plan: 'standard', createdAt: '2024-03-10' },
  { id: 'STF-004', name: 'Diana Ross', businessName: 'Legal / Compliance', email: 'diana@arkad.com', phone: '+1 234 567 8904', isApproved: true, plan: 'paid', createdAt: '2024-04-05' },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AdminStaff() {
  const [lenders, setLenders] = useState(DUMMY_STAFF);
  const [search, setSearch]   = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal]     = useState(null);
  const [form, setForm]               = useState({ name: '', businessName: '', email: '', phone: '', password: 'Password123!', document: null, plan: 'standard' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = useMemo(() => lenders.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.businessName.toLowerCase().includes(search.toLowerCase())
  ), [lenders, search]);

  const handleAddStaff = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newStaff = {
        ...form,
        id: `STF-00${lenders.length + 1}`,
        isApproved: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setLenders([newStaff, ...lenders]);
      setShowSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        setIsModalOpen(false);
        setShowSuccess(false);
        setForm({ name: '', businessName: '', email: '', phone: '', password: 'Password123!', document: null, plan: 'standard' });
      }, 1500);
    }, 1000);
  };

  const handleDelete = (id) => {
    setLenders(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Institutional Nodes" 
        subtitle="Manage internal staff members and system operators" 
        action={
           <Btn size="md" onClick={() => setIsModalOpen(true)}>
              <UserPlus size={16} className="mr-2" /> Add System Operator
           </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Operators" value={lenders.length} icon={Users} color="text-primary" />
        <StatCard label="Active Status" value={lenders.filter(l => l.isApproved).length} icon={ShieldCheck} color="text-emerald-500" />
        <StatCard label="Connectivity" value="Stable" icon={Activity} color="text-indigo-400" />
      </section>

      <div className="flex flex-col md:flex-row gap-6 px-1">
        <div className="flex-1 relative group">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name or department..."
            className="premium-input pl-12 h-14"
          />
        </div>
        <Btn variant="outline" size="md">
           <Download size={16} className="mr-2" /> Access Logs
        </Btn>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(l => (
          <div key={l.id} className="pro-card p-8 bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl opacity-50" />
             
             <div className="mb-6 relative z-10">
                <div className="flex items-start justify-between mb-6">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all font-bold text-slate-400">
                      {l.name[0]}
                   </div>
                   <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={l.isApproved ? 'active' : 'pending'} />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{l.plan === 'paid' ? 'Enterprise' : 'Staff'}</span>
                   </div>
                 </div>
                <div className="space-y-1">
                   <h4 className="text-lg font-bold text-slate-800 tracking-tight">{l.businessName}</h4>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{l.name}</p>
                </div>
             </div>
  
             <div className="flex gap-3 mt-auto relative z-10">
                  <Btn variant="outline" size="sm" onClick={() => setViewModal(l)} className="flex-1">
                    Profile
                  </Btn>
                  <button onClick={() => handleDelete(l.id)} className="w-10 h-10 rounded-lg bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all border border-slate-100">
                    <Trash2 size={16} />
                  </button>
              </div>
           </div>
        ))}
      </section>

      {/* Profile Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Operator Dossier">
        {viewModal && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-50" />
               <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-900 font-bold text-2xl border border-slate-100">
                  {viewModal.name[0]}
               </div>
               <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{viewModal.name}</h4>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{viewModal.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network ID</p>
                   <p className="text-xs font-bold text-slate-800">{viewModal.id}</p>
               </div>
               <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Node</p>
                   <p className="text-xs font-bold text-slate-800">{viewModal.phone}</p>
               </div>
            </div>

            <Divider text="Permissions & Access" />
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Granted Capabilities</p>
               <div className="flex flex-wrap gap-2">
                  {['Loan Review', 'Payment Audit', 'Data Export', 'User Verification'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
               </div>
            </div>

            <Btn variant="outline" onClick={() => setViewModal(null)} className="w-full h-14">
               Close Record
            </Btn>
          </div>
        )}
      </Modal>

      {/* Add Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Register Operator">
        {showSuccess ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
             <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-lg border border-emerald-100">
                <CheckCircle2 size={40} />
             </div>
             <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Access Granted</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operator has been added to the registry</p>
             </div>
          </div>
        ) : (
          <form onSubmit={handleAddStaff} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Operator Name">
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" required />
               </FormField>
               <FormField label="Department / Role">
                  <Input value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} placeholder="e.g. Risk Ops" />
               </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Email Registry">
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="staff@arkad.com" required />
               </FormField>
               <FormField label="Contact Phone">
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+..." />
               </FormField>
            </div>

            <FormField label="Security Password">
               <Input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </FormField>

            <div className="grid grid-cols-2 gap-6 pt-2">
               <Btn 
                 type="submit"
                 loading={isSubmitting}
                 className="h-14"
               >
                 Create Registry
               </Btn>
               <Btn 
                 variant="outline"
                 type="button"
                 onClick={() => setIsModalOpen(false)}
                 className="h-14"
               >
                 Cancel
               </Btn>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
