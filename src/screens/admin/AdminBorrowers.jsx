import React, { useState, useMemo } from 'react';
import { 
  Users, ShieldCheck, AlertTriangle, Search, User, Trash2, Pencil, Phone, 
  Calendar, MapPin, Activity, Database, Filter, UserPlus, ArrowRight, 
  ChevronRight, Hash, Sparkles, Zap
} from 'lucide-react';
import { Btn, PageTitle, StatusBadge, StatCard, Input, Select, ProTable, Modal, FormField, Divider } from '../../components/UI';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

const RiskBadge = ({ risk }) => {
  const configs = {
    'GREEN': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Low Risk' },
    'AMBER': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Medium Risk' },
    'RED': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: 'High Risk' },
  };
  const c = configs[risk] || configs['GREEN'];
  return (
    <div className={`px-3 py-1.5 rounded-xl border ${c.bg} ${c.text} ${c.border} text-[9px] font-bold uppercase tracking-widest flex items-center gap-2`}>
      <div className={`w-1 h-1 rounded-full ${c.text.replace('text', 'bg')}`} />
      {c.label}
    </div>
  );
};


const DUMMY_BORROWERS = [
  { id: 'BOR-101', name: 'Alice Wilson', email: 'alice@gmail.com', phone: '+1 555 0101', nrc: 'ID-88271', dob: '1990-05-12', address: 'San Francisco, CA', risk: 'GREEN', isApproved: true, createdAt: '2023-01-15', leadStatus: 'HOT LEAD', lastContact: '2026-05-10', nextFollowUp: '2026-05-12', notes: 'Interested in ₹5L Home Loan. Pending document pickup.' },
  { id: 'BOR-102', name: 'Bob Thompson', email: 'bob@gmail.com', phone: '+1 555 0102', nrc: 'ID-88272', dob: '1985-11-20', address: 'Austin, TX', risk: 'AMBER', isApproved: true, createdAt: '2023-02-20', leadStatus: 'CONTACTED', lastContact: '2026-05-08', nextFollowUp: '2026-05-15', notes: 'Called. Asked to call back after 3 days.' },
  { id: 'BOR-103', name: 'Charlie Davis', email: 'charlie@gmail.com', phone: '+1 555 0103', nrc: 'ID-88273', dob: '1992-03-10', address: 'Chicago, IL', risk: 'RED', isApproved: false, createdAt: '2023-03-05', leadStatus: 'NEW SIGNUP', lastContact: '2026-05-11', nextFollowUp: '2026-05-11', notes: 'Just registered. Need to explain interest rates.' },
  { id: 'BOR-104', name: 'Diana Prince', email: 'diana@gmail.com', phone: '+1 555 0104', nrc: 'ID-88274', dob: '1988-07-05', address: 'Seattle, WA', risk: 'GREEN', isApproved: true, createdAt: '2023-04-12', leadStatus: 'COLD', lastContact: '2026-05-01', nextFollowUp: '2026-05-20', notes: 'Application incomplete. No response on calls.' },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AdminBorrowers() {
  const [borrowers, setBorrowers] = useState(DUMMY_BORROWERS);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [viewModal, setViewModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', nrc: '', dob: '', address: '', password: 'Password123!', risk: 'GREEN' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return borrowers.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.nrc.includes(search);
      const matchRisk   = riskFilter === 'ALL' || b.risk === riskFilter;
      return matchSearch && matchRisk;
    });
  }, [borrowers, search, riskFilter]);

  const handleAddBorrower = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newBorrower = { ...form, id: `BOR-${101 + borrowers.length}`, isApproved: true, createdAt: new Date().toISOString() };
      setBorrowers([newBorrower, ...borrowers]);
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setForm({ name: '', email: '', phone: '', nrc: '', dob: '', address: '', password: 'Password123!', risk: 'GREEN' });
    }, 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Client Portfolio" 
        subtitle="Manage borrower identities and individual risk profiles" 
        action={
           <Btn size="md" onClick={() => setIsAddModalOpen(true)}>
              <UserPlus size={16} className="mr-2" /> Add New Borrower
           </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setRiskFilter('ALL')}
          className={`pro-card p-6 text-left transition-all ${riskFilter === 'ALL' ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-white'}`}
        >
          <StatCard label="Total Borrowers" value={borrowers.length} icon={Users} color="text-primary" />
        </button>
        <button 
          onClick={() => setRiskFilter('GREEN')}
          className={`pro-card p-6 text-left transition-all ${riskFilter === 'GREEN' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5' : 'bg-white'}`}
        >
          <StatCard label="Low Risk Node" value={borrowers.filter(b => b.risk === 'GREEN').length} icon={ShieldCheck} color="text-emerald-500" />
        </button>
        <button 
          onClick={() => setRiskFilter('RED')}
          className={`pro-card p-6 text-left transition-all ${riskFilter === 'RED' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-500/5' : 'bg-white'}`}
        >
          <StatCard label="Critical Risk" value={borrowers.filter(b => b.risk === 'RED').length} icon={AlertTriangle} color="text-rose-500" />
        </button>
      </section>

      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 xl:max-w-2xl">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                className="premium-input pl-12 h-12"
                placeholder="Search by name or NRC ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 sm:w-auto w-full">
              {[['ALL','All'],['GREEN','Stable'],['AMBER','Medium'],['RED','Risk']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRiskFilter(val)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    riskFilter === val ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Btn variant="outline" size="md">
             <Activity size={16} className="mr-2" /> Performance Audit
          </Btn>
        </div>

        <ProTable headers={[
          { label: 'Borrower Entity' },
          { label: 'Contact Node' },
          { label: 'Lead Status' },
          { label: 'Risk Integrity' },
          { label: 'Action', className: 'text-right' }
        ]}>
          {filtered.map((b) => (
            <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                       {b.name[0]}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-slate-800 transition-colors group-hover:text-primary">{b.name}</p>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{b.email}</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[13px] font-bold text-slate-500">{b.phone}</p>
              </td>
              <td className="px-6 py-5">
                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                   b.leadStatus === 'HOT LEAD' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                   b.leadStatus === 'NEW SIGNUP' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                   'bg-slate-50 text-slate-500 border border-slate-100'
                 }`}>
                   {b.leadStatus}
                 </span>
              </td>
              <td className="px-6 py-5">
                 <RiskBadge risk={b.risk} />
              </td>
              <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                 <Btn variant="outline" size="sm" onClick={() => setViewModal(b)}>Profile</Btn>
              </td>
            </tr>
          ))}
        </ProTable>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Client Dossier">
        {viewModal && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-50" />
               <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-900 font-bold text-2xl border border-slate-100 uppercase">
                  {viewModal.name[0]}
               </div>
               <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{viewModal.name}</h4>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{viewModal.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { label: 'Mobile Node', value: viewModal.phone, icon: Phone, color: 'text-primary' },
                 { label: 'NRC ID Registry', value: viewModal.nrc, icon: Hash, color: 'text-indigo-500' },
                 { label: 'Birth Registry', value: formatDateDDMMYYYY(viewModal.dob), icon: Calendar, color: 'text-amber-500' },
                 { label: 'Residential Node', value: viewModal.address, icon: MapPin, color: 'text-rose-500' },
               ].map((item, i) => (
                 <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-slate-800">{item.value}</p>
                 </div>
               ))}
            </div>

            <Divider text="CRM Intelligence" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField label="Lead Status">
                    <select className="premium-input h-12 text-[11px] font-bold uppercase tracking-widest" value={viewModal.leadStatus}>
                       <option value="NEW SIGNUP">New Signup</option>
                       <option value="CONTACTED">Contacted</option>
                       <option value="HOT LEAD">Hot Lead</option>
                       <option value="COLD">Cold / No Response</option>
                    </select>
                 </FormField>
                 <FormField label="Next Follow-up">
                    <Input type="date" value={viewModal.nextFollowUp} />
                 </FormField>
              </div>
              <FormField label="Internal CRM Notes">
                 <textarea 
                    className="premium-input min-h-[100px] py-4 text-xs font-medium" 
                    placeholder="Enter borrower interaction details..."
                    defaultValue={viewModal.notes}
                 />
              </FormField>
            </div>

            <Divider text="Institutional Risk Standing" />
            <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
              viewModal.risk === 'GREEN' ? 'bg-emerald-50 border-emerald-100' : 
              viewModal.risk === 'AMBER' ? 'bg-amber-50 border-amber-100' : 
              'bg-rose-50 border-rose-100'
            }`}>
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                 viewModal.risk === 'GREEN' ? 'bg-emerald-500 text-white' : 
                 viewModal.risk === 'AMBER' ? 'bg-amber-500 text-white' : 
                 'bg-rose-500 text-white'
               }`}>
                  <Zap size={20} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-900">Current Risk: {viewModal.risk}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 italic leading-tight">
                    This client has been analyzed by our institutional risk engine. 
                    Calculated standing: {viewModal.risk === 'GREEN' ? 'Verified Stable' : viewModal.risk === 'AMBER' ? 'Standard Oversight' : 'High Priority Monitoring'}.
                  </p>
               </div>
            </div>

            <Btn variant="outline" className="w-full h-14" onClick={() => setViewModal(null)}>Close Profile</Btn>
          </div>
        )}
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Borrower">
         <form onSubmit={handleAddBorrower} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Full Name">
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Owner name" required />
               </FormField>
               <FormField label="NRC Identifier">
                  <Input value={form.nrc} onChange={e => setForm({...form, nrc: e.target.value})} placeholder="ID Number" required />
               </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Email Registry">
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="client@mail.com" required />
               </FormField>
               <FormField label="Mobile Node">
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+..." required />
               </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Birth Registry">
                  <Input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} required />
               </FormField>
               <FormField label="Initial Risk Rating">
                  <select value={form.risk} onChange={e => setForm({...form, risk: e.target.value})} className="premium-input h-12 appearance-none text-[11px] font-bold uppercase tracking-widest">
                     <option value="GREEN">Stable (Low)</option>
                     <option value="AMBER">Standard (Med)</option>
                     <option value="RED">High Priority</option>
                  </select>
               </FormField>
            </div>
            <FormField label="Residential Node">
               <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Physical address" />
            </FormField>
            <div className="pt-2 flex gap-4">
               <Btn type="submit" loading={isSubmitting} className="flex-[2] h-14">Authorize Onboarding</Btn>
               <Btn variant="outline" type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-14">Abort</Btn>
            </div>
         </form>
      </Modal>
    </div>
  );
}



