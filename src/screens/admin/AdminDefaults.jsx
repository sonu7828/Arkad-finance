import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Search, UserX, Clock, Shield, Zap, Activity, Database, History, 
  User, Activity as ActivityIcon, Radar, RotateCcw, ArrowUpRight, PhoneCall, 
  AlertCircle, FileDown, ChevronRight
} from 'lucide-react';
import { StatusBadge, PageTitle, Btn, StatCard, ProTable, Modal, Divider } from '../../components/UI';

const DUMMY_DEFAULTS = [
  { id: 'LN-DEF-01', borrower: 'Edward Norton', amount: 4500, lateDays: 12, status: 'overdue', lender: 'Main Vault' },
  { id: 'LN-DEF-02', borrower: 'Felix Wright', amount: 12000, lateDays: 45, status: 'defaulted', lender: 'Risk Node A' },
  { id: 'LN-DEF-03', borrower: 'George Harrison', amount: 800, lateDays: 5, status: 'overdue', lender: 'Main Vault' },
  { id: 'LN-DEF-04', borrower: 'Hannah Montana', amount: 25000, lateDays: 90, status: 'defaulted', lender: 'Partner Node B' },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AdminDefaults() {
  const [loans, setLoans] = useState(DUMMY_DEFAULTS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewModal, setViewModal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filtered = useMemo(() => {
    return loans.filter(l => {
      const matchesSearch = l.borrower.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'all' || l.status === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [loans, search, filterType]);

  const totalExposure = useMemo(() => {
    return loans.reduce((sum, l) => sum + l.amount, 0);
  }, [loans]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Risk Exposure Matrix" 
        subtitle="Monitor and resolve high-risk liabilities and defaulted institutional protocols" 
        action={
          <div className="flex items-center gap-4">
             <Btn variant="outline" size="md" onClick={handleRefresh} loading={isRefreshing}>
                <RotateCcw size={16} className="mr-2" /> Synch Risk Spectrum
             </Btn>
             <Btn size="md">
                <FileDown size={16} className="mr-2" /> Export Report
             </Btn>
          </div>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Omni Exposure" value={formatMoney(totalExposure)} icon={ShieldAlert} color="text-rose-500" />
        <StatCard label="Defaulted Nodes" value={loans.filter(l => l.status === 'defaulted').length} icon={UserX} color="text-rose-600" />
        <StatCard label="Network Integrity" value="Optimal" icon={Radar} color="text-emerald-500" />
      </section>

      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
           <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Risks', icon: ActivityIcon },
                { id: 'overdue', label: 'Overdue Dues', icon: Clock },
                { id: 'defaulted', label: 'Default Registry', icon: ShieldAlert },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    filterType === tab.id
                      ? 'bg-white text-rose-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="relative flex-1 xl:max-w-xs w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                className="premium-input pl-12 h-12"
                placeholder="Search target profile..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
        </div>

        <ProTable headers={[
          { label: 'Target Entity' },
          { label: 'Exposure Volume' },
          { label: 'Default Latency' },
          { label: 'Associated Node' },
          { label: 'Status' },
          { label: 'Action', className: 'text-right' }
        ]}>
          {filtered.map((l) => (
            <tr key={l.id} className="group hover:bg-rose-50/20 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${l.status === 'defaulted' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'}`}>
                       {l.borrower[0]}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-slate-800 group-hover:text-rose-500 transition-colors">{l.borrower}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ref: {l.id}</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[13px] font-bold text-slate-900">{formatMoney(l.amount)}</p>
              </td>
              <td className="px-6 py-5">
                 <div className="flex items-center gap-2 text-rose-500 font-bold">
                    <Clock size={12} />
                    <span className="text-[11px] uppercase tracking-widest">{l.lateDays} Days Overdue</span>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{l.lender}</p>
              </td>
              <td className="px-6 py-5">
                 <StatusBadge status={l.status.toUpperCase()} />
              </td>
              <td className="px-6 py-5 text-right">
                 <Btn size="sm" variant="outline" onClick={() => setViewModal(l)}>
                    Recovery Analysis
                 </Btn>
              </td>
            </tr>
          ))}
        </ProTable>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Conflict Node Protocols">
         {viewModal && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="p-8 bg-rose-500 rounded-3xl relative overflow-hidden text-center text-white border border-rose-400">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl opacity-50" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-rose-100">Total Capital Exposure</p>
                 <h4 className="text-3xl font-extrabold tracking-tight mt-2 italic">{formatMoney(viewModal.amount)}</h4>
                 <div className="mt-4 inline-block px-4 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest leading-none">
                    Target: {viewModal.borrower}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Registry ID', value: viewModal.id, icon: Database, color: 'text-indigo-500' },
                 { label: 'Risk Standing', value: viewModal.status.toUpperCase(), icon: ActivityIcon, color: 'text-rose-500' },
                 { label: 'Origin Node', value: viewModal.lender, icon: Shield, color: 'text-emerald-500' },
                 { label: 'Latency Period', value: `${viewModal.lateDays} Days`, icon: Clock, color: 'text-amber-500' },
               ].map((item, i) => (
                 <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-slate-800">{item.value}</p>
                 </div>
               ))}
              </div>

              <Divider text="Institutional Reclamation Logic" />

              <div className="space-y-4">
                 <div className="flex items-start gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100">
                    <AlertCircle size={20} className="text-rose-500 mt-1 shrink-0" />
                    <div>
                       <h5 className="text-[11px] font-bold text-rose-900 uppercase tracking-widest">Procedural Directive</h5>
                       <p className="text-[10px] font-medium text-rose-700 mt-1 leading-relaxed italic">
                         Initiate legal reclamation protocols and restrict all associated credit nodes for {viewModal.borrower}. 
                         Capital reclamation target: {formatMoney(viewModal.amount)}.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Btn className="flex-[2] h-14 !bg-rose-600 hover:!bg-rose-700">Initiate Escalation</Btn>
                <Btn variant="outline" className="flex-1 h-14" onClick={() => setViewModal(null)}>Dismiss</Btn>
              </div>
           </div>
         )}
      </Modal>
    </div>
  );
}

