import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  Star, 
  MoreHorizontal,
  ChevronRight,
  PhoneCall,
  Mail,
  Zap,
  PlusCircle,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { PageTitle, StatusBadge, Btn, ProTable, StatCard, Modal, FormField, Input, Divider } from '../../components/UI';
import { useLoans } from '../../context/LoanContext';

const DUMMY_CRM_DATA = [
  { 
    id: 'L-001', 
    name: 'Rahul Sharma', 
    email: 'rahul@example.com', 
    status: 'HOT LEAD', 
    lastContact: '2026-05-10', 
    nextFollowUp: '2026-05-12', 
    notes: 'Interested in ₹5L Home Loan. Pending document pickup.',
    priority: 'high',
    phone: '+91 9876543210'
  },
  { 
    id: 'L-002', 
    name: 'Priya Verma', 
    email: 'priya@example.com', 
    status: 'CONTACTED', 
    lastContact: '2026-05-08', 
    nextFollowUp: '2026-05-15', 
    notes: 'Called. Asked to call back after 3 days.',
    priority: 'medium',
    phone: '+91 8877665544'
  },
  { 
    id: 'L-003', 
    name: 'Amit Patel', 
    email: 'amit@example.com', 
    status: 'NEW SIGNUP', 
    lastContact: '2026-05-11', 
    nextFollowUp: '2026-05-11', 
    notes: 'Just registered. Need to explain interest rates.',
    priority: 'high',
    phone: '+91 7766554433'
  },
  { 
    id: 'L-004', 
    name: 'Suresh Raina', 
    email: 'suresh@example.com', 
    status: 'COLD', 
    lastContact: '2026-05-01', 
    nextFollowUp: '2026-05-20', 
    notes: 'Application incomplete. No response on calls.',
    priority: 'low',
    phone: '+91 6655443322'
  }
];

export default function AdminCRM() {
  const { triggerAutoReminders } = useLoans();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : DUMMY_CRM_DATA;
  });
  const [viewModal, setViewModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', status: 'NEW SIGNUP', notes: '' });

  // Sync with localStorage
  React.useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  const today = new Date().toISOString().split('T')[0];

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.email.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'TODAY') matchesFilter = l.nextFollowUp === today;
    if (filter === 'NEW') matchesFilter = l.status === 'NEW SIGNUP';
    if (filter === 'HOT') matchesFilter = l.status === 'HOT LEAD';

    return matchesSearch && matchesFilter;
  });

  const handleAddLead = (e) => {
    e.preventDefault();
    const lead = {
      ...newLead,
      id: `L-${Date.now()}`,
      lastContact: new Date().toISOString().split('T')[0],
      nextFollowUp: new Date().toISOString().split('T')[0],
      priority: 'medium'
    };
    setLeads([lead, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', email: '', phone: '', status: 'NEW SIGNUP', notes: '' });
  };

  const handleUpdateLead = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      const updatedLeads = leads.map(l => l.id === viewModal.id ? viewModal : l);
      setLeads(updatedLeads);
      setIsUpdating(false);
      setViewModal(null);
    }, 400);
  };

  const handleDeleteLead = (id) => {
    if(window.confirm("Are you sure you want to remove this lead?")) {
      setLeads(leads.filter(l => l.id !== id));
      setViewModal(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="CRM Intelligence Hub" 
        subtitle="Manage customer relationships, track leads, and optimize follow-up workflows."
        action={
          <div className="flex gap-3">
            <Btn size="md" variant="outline" onClick={() => {
              if (triggerAutoReminders) triggerAutoReminders();
              alert('Automated payment reminders have been queued for dispatch to all active loan contracts.');
            }}>
              <Zap size={16} className="mr-2 text-amber-500" /> Send Reminders
            </Btn>
            <Btn size="md" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle size={16} className="mr-2" /> Quick Action
            </Btn>
          </div>
        }
      />

      {/* CRM Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => setFilter('ALL')}
          className={`pro-card p-6 text-left transition-all ${filter === 'ALL' ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-white'}`}
        >
          <StatCard label="Active Leads" value={leads.length} icon={Users} color="#3b82f6" />
        </button>
        <button 
          onClick={() => setFilter('TODAY')}
          className={`pro-card p-6 text-left transition-all ${filter === 'TODAY' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/5' : 'bg-white'}`}
        >
          <StatCard label="Follow-ups Today" value={leads.filter(l => l.nextFollowUp === today).length} icon={Calendar} color="#f59e0b" />
        </button>
        <button 
          onClick={() => setFilter('NEW')}
          className={`pro-card p-6 text-left transition-all ${filter === 'NEW' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5' : 'bg-white'}`}
        >
          <StatCard label="New Signups" value={leads.filter(l => l.status === 'NEW SIGNUP').length} icon={Star} color="#10b981" />
        </button>
        <button 
          onClick={() => setFilter('HOT')}
          className={`pro-card p-6 text-left transition-all ${filter === 'HOT' ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/5' : 'bg-white'}`}
        >
          <StatCard label="Hot Pipeline" value={leads.filter(l => l.status === 'HOT LEAD').length} icon={Clock} color="#6366f1" />
        </button>
      </section>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Lead Pipeline</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time customer interaction log</p>
            </div>
            <div className="w-full md:w-80 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                className="premium-input pl-12 h-12"
                placeholder="Search leads by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <ProTable headers={[
            { label: 'Customer Identity' },
            { label: 'Current Status' },
            { label: 'Last Interaction' },
            { label: 'Next Follow-up' },
            { label: 'Notes' },
            { label: 'Actions', className: 'text-right' }
          ]}>
            {filteredLeads.map((lead) => (
              <tr 
                key={lead.id} 
                className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => setViewModal({...lead})}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black">
                      {lead.name[0]}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800 transition-colors group-hover:text-primary">{lead.name}</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    lead.status === 'HOT LEAD' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                    lead.status === 'NEW SIGNUP' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-[12px] font-bold text-slate-500">
                  {lead.lastContact}
                  <div className="flex items-center gap-1 mt-1 text-emerald-500">
                    <Zap size={10} />
                    <span className="text-[9px] uppercase tracking-widest">Reminders Active</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-amber-500" />
                    <span className="text-[12px] font-bold text-slate-700">{lead.nextFollowUp}</span>
                  </div>
                </td>
                <td className="px-6 py-5 max-w-[200px]">
                  <p className="text-[11px] font-medium text-slate-400 line-clamp-2 italic">"{lead.notes}"</p>
                </td>
                <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => alert(`Calling ${lead.name} at ${lead.phone}...`)}
                      className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-colors"
                    >
                      <PhoneCall size={16} />
                    </button>
                    <button 
                      onClick={() => alert(`Message composer opened for ${lead.email}`)}
                      className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-colors"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button 
                      onClick={() => setViewModal({...lead})}
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </ProTable>
        </div>
      </div>

      {/* CRM Action Modal */}
      <Modal 
        isOpen={!!viewModal} 
        onClose={() => setViewModal(null)} 
        title="Update Interaction Log"
        size="md"
      >
        {viewModal && (
          <form onSubmit={handleUpdateLead} className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl font-bold text-slate-900 border border-slate-100">
                  {viewModal.name[0]}
               </div>
               <div>
                  <h4 className="text-lg font-extrabold text-slate-900">{viewModal.name}</h4>
                  <p className="text-xs font-medium text-slate-400">{viewModal.email} • {viewModal.phone}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField label="Lead Pipeline Status">
                  <select 
                    className="premium-input h-12 text-[11px] font-bold uppercase tracking-widest"
                    value={viewModal.status}
                    onChange={(e) => setViewModal({...viewModal, status: e.target.value})}
                  >
                     <option value="NEW SIGNUP">New Signup</option>
                     <option value="CONTACTED">Contacted</option>
                     <option value="HOT LEAD">Hot Lead</option>
                     <option value="COLD">Cold / No Response</option>
                  </select>
               </FormField>
               <FormField label="Follow-up Date">
                  <Input 
                    type="date" 
                    value={viewModal.nextFollowUp}
                    onChange={(e) => setViewModal({...viewModal, nextFollowUp: e.target.value})}
                  />
               </FormField>
            </div>

            <FormField label="Interaction Notes">
               <textarea 
                  className="premium-input min-h-[120px] py-4 text-xs font-medium"
                  placeholder="What was discussed with the client?"
                  value={viewModal.notes}
                  onChange={(e) => setViewModal({...viewModal, notes: e.target.value})}
               />
            </FormField>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
               <Btn 
                type="submit" 
                className="flex-[2] h-14 shadow-lg shadow-primary/20"
                loading={isUpdating}
               >
                  <Save size={16} className="mr-2" /> Save Interaction
               </Btn>
               <Btn 
                type="button" 
                variant="outline" 
                className="flex-1 h-14 text-rose-500 border-rose-100 hover:bg-rose-50"
                onClick={() => handleDeleteLead(viewModal.id)}
               >
                  <Trash2 size={16} className="mr-2" /> Remove Lead
               </Btn>
            </div>
          </form>
        )}
      </Modal>
      
      {/* ADD LEAD MODAL */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Capture New Intelligence"
        size="md"
      >
        <form onSubmit={handleAddLead} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Prospect Name">
              <Input 
                placeholder="Full Legal Name" 
                value={newLead.name} 
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                required
              />
            </FormField>
            <FormField label="Direct Contact">
              <Input 
                placeholder="+91..." 
                value={newLead.phone} 
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                required
              />
            </FormField>
          </div>
          <FormField label="Email Address">
            <Input 
              type="email"
              placeholder="name@example.com" 
              value={newLead.email} 
              onChange={(e) => setNewLead({...newLead, email: e.target.value})}
              required
            />
          </FormField>
          <FormField label="Initial Status">
            <select 
              className="premium-input h-12 text-[11px] font-bold uppercase tracking-widest"
              value={newLead.status}
              onChange={(e) => setNewLead({...newLead, status: e.target.value})}
            >
              <option value="NEW SIGNUP">New Signup</option>
              <option value="CONTACTED">Contacted</option>
              <option value="HOT LEAD">Hot Lead</option>
            </select>
          </FormField>
          <FormField label="Context / Notes">
            <textarea 
              className="premium-input min-h-[100px] py-4 text-xs font-medium"
              placeholder="Any specific requirements or first impression?"
              value={newLead.notes}
              onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
            />
          </FormField>
          <div className="pt-4">
             <Btn type="submit" className="w-full h-14">
                <PlusCircle size={16} className="mr-2" /> Initialize Lead Protocol
             </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
