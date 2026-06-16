import React, { useState } from 'react';
import { 
  DollarSign, 
  History, 
  Clock, 
  ArrowUpRight, 
  CreditCard, 
  Wallet, 
  CheckCircle2,
  Calendar, 
  Search, 
  ArrowDownCircle, 
  Zap, 
  Activity,
  Globe,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { PageTitle, StatusBadge, StatCard, Input, Modal, EmptyState, Divider, Btn } from '../../components/UI';

const DUMMY_PAYOUTS = [
  { id: 1, borrower: { name: 'Michael Johnson' }, amount: 250, percentage: 5, status: 'PAID', createdAt: '2024-10-01T00:00:00Z', type: 'YIELD' },
  { id: 2, borrower: { name: 'Sarah Williams' }, amount: 425, percentage: 5, status: 'PAID', createdAt: '2024-10-08T00:00:00Z', type: 'DISBURSEMENT' },
  { id: 3, borrower: { name: 'Emma Thompson' }, amount: 600, percentage: 5, status: 'PAID', createdAt: '2024-09-15T00:00:00Z', type: 'YIELD' },
  { id: 4, borrower: { name: 'James Wilson' }, amount: 125, percentage: 5, status: 'PAID', createdAt: '2024-10-14T00:00:00Z', type: 'DISBURSEMENT' },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AgentPayments() {
  const [payouts] = useState(DUMMY_PAYOUTS);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPayout, setSelectedPayout] = useState(null);

  const filtered = payouts.filter(p => {
    const matchesSearch = (p.borrower?.name || '').toLowerCase().includes(search.toLowerCase()) || (p.id || '').toString().includes(search);
    const matchesFilter = activeFilter === 'all' ? true : activeFilter === 'yield' ? p.type === 'YIELD' : activeFilter === 'disbursement' ? p.type === 'DISBURSEMENT' : true;
    return matchesSearch && matchesFilter;
  });

  const totalYield = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <PageTitle 
        title="Payout Registry" 
        subtitle="Comprehensive orchestration and auditing of yield disbursements and institutional payouts" 
      />

      {/* KPI GRID WITH INLINE FILTERING */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Aggregate Yield" 
          value={formatMoney(totalYield)} 
          icon={TrendingUp} 
          trend="+12.4%" 
          onClick={() => setActiveFilter(activeFilter === 'yield' ? 'all' : 'yield')}
          className={activeFilter === 'yield' ? '!border-primary bg-primary/5' : ''}
        />
        <StatCard 
          label="Disbursements" 
          value={payouts.length} 
          icon={Activity} 
          trend="Action Node" 
          onClick={() => setActiveFilter(activeFilter === 'disbursement' ? 'all' : 'disbursement')}
          className={activeFilter === 'disbursement' ? '!border-emerald-500 bg-emerald-50/50' : ''}
        />
        <StatCard 
          label="Security Status" 
          value="ENCRYPTED" 
          icon={ShieldCheck} 
          trend="Verified" 
          onClick={() => setActiveFilter('all')}
        />
      </section>

      {/* SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search payouts by reference or entity node..."
            className="w-full h-14 pl-12 pr-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold italic placeholder:text-slate-200 focus:border-primary/30 transition-all outline-none shadow-sm"
          />
        </div>
        {activeFilter !== 'all' && (
           <Btn variant="outline" size="sm" onClick={() => setActiveFilter('all')} className="rounded-xl italic font-black text-[9px] uppercase border-primary/20 text-primary">
              Clear Filter: {activeFilter}
           </Btn>
        )}
      </div>

      {/* INLINE DATA LIST */}
      <div className="space-y-5">
        <div className="px-1 flex items-center justify-between">
           <h3 className="text-lg font-black text-slate-800 tracking-tighter italic uppercase">Registry Output</h3>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{filtered.length} Entries Discovered</p>
        </div>
        
        {filtered.length === 0 ? (
          <EmptyState 
            icon={History}
            title="Registry Void"
            description="No payout events discovered in the current directive."
            action={<Btn onClick={() => {setSearch(''); setActiveFilter('all');}}>Reset Parameters</Btn>}
          />
        ) : (
          filtered.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPayout(p)}
              className="premium-card bg-white p-6 border border-slate-50 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                  <ArrowDownCircle size={22} className="italic text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tighter italic leading-none mb-2">TX_REF: #{p.id.toString().padStart(5, '0')}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{p.borrower?.name || 'ROOT_ENTITY'}</span>
                    <Divider className="!my-0 !h-1 !w-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-10 relative z-10 pl-14 md:pl-0">
                <div className="text-right italic">
                  <p className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">{formatMoney(p.amount)}</p>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{p.percentage}% Node Yield</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status="PAID" />
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-slate-100">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DISCLOSURE MODAL (For row details only) */}
      <Modal isOpen={!!selectedPayout} onClose={() => setSelectedPayout(null)} title="Payout Disclosure Interface">
        {selectedPayout && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="premium-card bg-slate-900 p-10 rounded-[2.5rem] relative overflow-hidden text-white border-none shadow-2xl text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-4 italic animate-pulse font-black">Confirmed Institutional Yield</p>
              <p className="text-5xl font-black tracking-tighter leading-none italic">{formatMoney(selectedPayout.amount)}</p>
              <div className="mt-8 flex justify-center">
                 <StatusBadge status="PAID" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { label: 'Ledger Identifier', value: `#PAYOUT_${selectedPayout.id}` },
                 { label: 'Affiliated Entity', value: selectedPayout.borrower?.name || 'SYSTEM' },
                 { label: 'Yield Calibration', value: `${selectedPayout.percentage}% Allocation`, isPrimary: true },
                 { label: 'Temporal Registry', value: new Date(selectedPayout.createdAt).toLocaleString() },
               ].map((row, i) => (
                 <div key={i} className="p-6 bg-white border border-slate-50 rounded-2xl group hover:border-primary/20 transition-all">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 italic">{row.label}</p>
                    <p className={`text-xs font-black italic uppercase ${row.isPrimary ? 'text-primary' : 'text-slate-800'}`}>{row.value}</p>
                 </div>
               ))}
            </div>

            <Btn variant="outline" onClick={() => setSelectedPayout(null)} className="w-full !h-14 uppercase tracking-widest text-[9px] font-black italic !rounded-2xl">
              Dismiss Disclosure
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
