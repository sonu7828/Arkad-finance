import React, { useState, useMemo } from 'react';
import { 
  Search, Clock, Eye, ShieldCheck, Database, History, 
  Activity, Layers, Box, Fingerprint, RotateCcw, LayoutGrid, 
  ShieldAlert, Archive, ChevronRight
} from 'lucide-react';
import { StatusBadge, PageTitle, StatCard, Btn, ProTable, Modal, Divider } from '../../components/UI';

const DUMMY_COLLATERAL = [
  { id: 'COL-701', name: 'Commercial Property Deed', borrower: 'Alice Wilson', type: 'Real Estate', value: '$250,000', verified: true, date: '2026-04-10' },
  { id: 'COL-702', name: 'Fleet of Logistic Vehicles', borrower: 'Bob Thompson', type: 'Vehicles', value: '$85,000', verified: false, date: '2026-04-12' },
  { id: 'COL-703', name: 'Industrial Equipment (Lathe)', borrower: 'Charlie Davis', type: 'Machinery', value: '$45,000', verified: true, date: '2026-04-14' },
  { id: 'COL-704', name: 'Stock Portfolio Certificate', borrower: 'Diana Prince', type: 'Securities', value: '$120,000', verified: false, date: '2026-04-15' },
];

export default function AdminCollateral() {
  const [collaterals, setCollaterals] = useState(DUMMY_COLLATERAL);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [isVerifying, setIsVerifying] = useState(null);

  const handleVerify = (id) => {
    setIsVerifying(id);
    setTimeout(() => {
      setCollaterals(prev => prev.map(c => c.id === id ? { ...c, verified: true } : c));
      setIsVerifying(null);
    }, 800);
  };

  const filtered = useMemo(() => {
    return collaterals.filter(c => {
      const matchSearch = c.borrower.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' ? true : filter === 'VERIFIED' ? c.verified : !c.verified;
      return matchSearch && matchFilter;
    });
  }, [collaterals, search, filter]);

  const verifiedCount = collaterals.filter(c => c.verified).length;
  const pendingCount = collaterals.filter(c => !c.verified).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Asset Vault" 
        subtitle="Manage and verify institutional-grade collateral submitted for risk coverage" 
        action={
          <Btn variant="outline" size="md">
             <RotateCcw size={16} className="mr-2" /> Synchronize Records
          </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Collateral" value={collaterals.length} icon={Database} color="text-primary" />
        <StatCard label="Verified Security" value={verifiedCount} icon={ShieldCheck} color="text-emerald-500" />
        <StatCard label="Awaiting Audit" value={pendingCount} icon={Clock} color="text-amber-500" />
      </section>

      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
           <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'All Assets', icon: Archive },
                { id: 'PENDING', label: 'Pending', icon: Clock },
                { id: 'VERIFIED', label: 'Verified', icon: ShieldCheck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === tab.id
                      ? 'bg-white text-primary shadow-sm'
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
                placeholder="Search asset or borrower..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
        </div>

        <ProTable headers={[
          { label: 'Assigned Borrower' },
          { label: 'Asset Identity' },
          { label: 'Category' },
          { label: 'Valuation' },
          { label: 'Status' },
          { label: 'Action', className: 'text-right' }
        ]}>
          {filtered.map((c) => (
            <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                       {c.borrower[0]}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-slate-800 transition-colors group-hover:text-primary">{c.borrower}</p>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Asset Ref: {c.id}</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[13px] font-bold text-slate-700">{c.name}</p>
              </td>
              <td className="px-6 py-5">
                 <div className="flex items-center gap-2">
                    <Box size={12} className="text-primary" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{c.type}</span>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[13px] font-bold text-primary">{c.value}</p>
              </td>
              <td className="px-6 py-5">
                 <StatusBadge status={c.verified ? 'VERIFIED' : 'PENDING'} />
              </td>
              <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                 <Btn variant="outline" size="sm">
                    <Eye size={14} className="mr-2" /> Detail
                 </Btn>
                 {!c.verified && (
                    <Btn size="sm" onClick={() => handleVerify(c.id)} loading={isVerifying === c.id} className="!bg-emerald-600 hover:!bg-emerald-700">
                       <ShieldCheck size={14} className="mr-2" /> Verify
                    </Btn>
                 )}
              </td>
            </tr>
          ))}
        </ProTable>
      </div>
    </div>
  );
}

