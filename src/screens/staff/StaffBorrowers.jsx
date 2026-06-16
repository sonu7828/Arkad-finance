import React, { useState } from 'react';
import {
  Search, User, Trash2, Phone, Calendar, MapPin, ClipboardList, CheckCircle2, 
  X, ChevronRight, Mail, ShieldCheck, ShieldAlert, Filter
} from 'lucide-react';
import { PageTitle, StatCard, Btn, StatusBadge, Divider } from '../../components/UI';
import Modal from '../../components/Modal';

const RiskBadge = ({ risk }) => {
  const configs = {
    'GREEN': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Low Risk' },
    'AMBER': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Medium Risk' },
    'RED': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: 'High Risk' }
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
  { id: 1, name: 'Michael Johnson', nrc: 'NRC-100291', phone: '+260971001122', email: 'michael@email.com', dob: '1990-03-14', address: '12 Kabulonga Rd, Lusaka', risk: 'GREEN', isApproved: true, isVerified: true, loans: [{ currentPrincipal: 5000 }, { currentPrincipal: 3200 }] },
  { id: 2, name: 'Sarah Williams', nrc: 'NRC-100292', phone: '+260971001133', email: 'sarah@email.com', dob: '1988-07-22', address: '5 Rhodes Park, Lusaka', risk: 'AMBER', isApproved: true, isVerified: false, loans: [{ currentPrincipal: 8500 }] },
  { id: 3, name: 'David Brown', nrc: 'NRC-100293', phone: '+260971001144', email: 'david@email.com', dob: '1995-11-03', address: '22 Olympia, Lusaka', risk: 'GREEN', isApproved: false, isVerified: false, loans: [] },
  { id: 4, name: 'Emma Thompson', nrc: 'NRC-100294', phone: '+260971001155', email: 'emma@email.com', dob: '1985-01-15', address: '8 Woodlands, Lusaka', risk: 'RED', isApproved: true, isVerified: true, loans: [{ currentPrincipal: 12000 }] },
  { id: 5, name: 'James Wilson', nrc: 'NRC-100295', phone: '+260971001166', email: 'james@email.com', dob: '1992-09-30', address: '3 Ibex Hill, Lusaka', risk: 'GREEN', isApproved: true, isVerified: true, loans: [] },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function StaffBorrowers() {
  const [borrowers, setBorrowers] = useState(DUMMY_BORROWERS);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewModal, setViewModal] = useState(null);

  const pendingCount = borrowers.filter(b => !b.isApproved).length;

  const filtered = borrowers.filter(b => {
    const matchSearch = (b.name || '').toLowerCase().includes(search.toLowerCase()) || (b.nrc || '').includes(search);
    const matchRisk = riskFilter === 'ALL' || b.risk === riskFilter;
    const isPending = !b.isApproved;
    const matchStatus = statusFilter === 'ALL' ? true : statusFilter === 'PENDING' ? isPending : !isPending;
    return matchSearch && matchRisk && matchStatus;
  });

  const handleApprove = (id) => {
    setBorrowers(p => p.map(b => b.id === id ? { ...b, isApproved: true } : b));
  };

  const handleDelete = (id) => {
    setBorrowers(p => p.filter(b => b.id !== id));
    if (viewModal?.id === id) setViewModal(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageTitle 
        title="Customer Directory"
        subtitle="Manage registered borrowers, review risk assessments, and handle account verifications."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Customers" value={borrowers.length} icon={User} color="text-slate-900" />
        <StatCard label="Low Risk Profiles" value={borrowers.filter(b => b.risk === 'GREEN').length} icon={ShieldCheck} color="text-emerald-500" />
        <StatCard label="Pending Verifications" value={pendingCount} icon={ShieldAlert} color="text-amber-500" />
      </section>

      <div className="pro-card shadow-sm overflow-hidden group">
        <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/50">
           <div className="flex-1 relative group">
             <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
             <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="premium-input pl-12 h-11" />
           </div>
           <div className="flex flex-wrap gap-4 items-center">
             <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 gap-1">
               {[['ALL', 'All'], ['PENDING', `Pending (${pendingCount})`], ['ACTIVE', 'Verified']].map(([val, label]) => (
                 <button key={val} onClick={() => setStatusFilter(val)}
                   className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === val ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-600'}`}
                 >{label}</button>
               ))}
             </div>
             <div className="relative group">
                <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
                  className="premium-input !pl-10 !pr-8 h-11 text-[10px] font-bold uppercase tracking-widest appearance-none min-w-[160px]">
                  <option value="ALL">All Risk Levels</option>
                  <option value="GREEN">Low Risk</option>
                  <option value="AMBER">Medium Risk</option>
                  <option value="RED">High Risk</option>
                </select>
             </div>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-50">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-300 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-300 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active Loans</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-300 uppercase tracking-widest">Outstanding</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-300 uppercase tracking-widest">Risk</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-300 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="py-24 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No customers match your filters</td></tr>
              ) : filtered.map(b => {
                const totalOwed = b.loans.reduce((s, l) => s + Number(l.currentPrincipal || 0), 0);
                const isPending = !b.isApproved;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => setViewModal(b)}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:rotate-6 transition-all">
                          <User size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{b.name}</p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {b.nrc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2"><Phone size={12} className="text-slate-200" /><span className="text-xs font-bold text-slate-500 uppercase">{b.phone}</span></div>
                        <div className="flex items-center gap-2"><Mail size={12} className="text-slate-200" /><span className="text-[10px] font-bold text-slate-300">{b.email}</span></div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-bold ${b.loans.length > 0 ? 'text-primary' : 'text-slate-200'}`}>{b.loans.length}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className={`text-sm font-bold ${totalOwed > 0 ? 'text-rose-500' : 'text-slate-200'}`}>
                        {totalOwed > 0 ? formatMoney(totalOwed) : 'MXN $0.00'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <RiskBadge risk={b.risk} />
                        {isPending && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                             <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Review</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                        {isPending && (
                          <Btn onClick={() => handleApprove(b.id)} size="sm" className="!h-9 !px-4 !rounded-xl !bg-emerald-600 text-[9px]">Approve</Btn>
                        )}
                        <Btn onClick={() => setViewModal(b)} variant="outline" size="sm" className="!h-9 !px-4 !rounded-xl text-[9px]">Details</Btn>
                        <button onClick={() => handleDelete(b.id)} className="w-9 h-9 flex items-center justify-center text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-rose-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Customer Details">
        {viewModal && (
          <div className="space-y-8 pb-4">
            <div className="p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-primary flex items-center justify-center font-bold text-2xl shadow-xl mx-auto mb-5">
                {viewModal.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{viewModal.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">NRC: {viewModal.nrc || 'N/A'}</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <RiskBadge risk={viewModal.risk} />
                <StatusBadge status={viewModal.isVerified ? 'verified' : 'pending'} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Primary Contact', value: viewModal.phone || 'N/A', icon: Phone },
                { label: 'Date of Birth', value: viewModal.dob ? new Date(viewModal.dob).toLocaleDateString() : 'N/A', icon: Calendar },
                { label: 'Residential Address', value: viewModal.address || 'N/A', icon: MapPin },
                { label: 'Account Summary', value: `${viewModal.loans.length} Loan(s)`, icon: ClipboardList },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <item.icon size={12} className="text-primary" /> {item.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>

            <Divider />
            <div className="flex justify-center">
               <button onClick={() => setViewModal(null)} className="text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:text-slate-800 transition-colors flex items-center gap-2 group">
                 <X size={14} className="group-hover:rotate-90 transition-transform" /> Close Details
               </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
