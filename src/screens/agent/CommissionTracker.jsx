import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Clock, ArrowUpRight, CheckCircle2, 
  Wallet, Activity, ShieldCheck, ChevronRight, List, Users
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageTitle, StatusBadge, StatCard, Btn, ProTable, Modal, Divider, FormField, Input } from '../../components/UI';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { useLoans } from '../../context/LoanContext';

const DUMMY_USER = { name: 'Victor Banda', role: 'agent' };

const DUMMY_PAYOUTS = [
  { id: 1, agent: { name: 'Victor Banda' }, amount: 850, method: 'BANK_TRANSFER', status: 'COMPLETED', createdAt: '2024-09-20T00:00:00Z' },
  { id: 2, agent: { name: 'Victor Banda' }, amount: 550, method: 'MOBILE_MONEY', status: 'PENDING', createdAt: '2024-10-10T00:00:00Z' },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function CommissionTracker() {
  const navigate = useNavigate();
  const { loans, generateDummyPaymentsData } = useLoans();
  const historySectionRef = useRef(null);

  // Derive Commissions from Loans
  const history = useMemo(() => {
    let comms = [];
    let idCounter = 1;
    loans.forEach(l => {
      // Paid Commissions (10% of collected interest)
      const paidInterest = (l.payments || []).filter(p => p.type === 'interest');
      paidInterest.forEach(p => {
        comms.push({
          id: idCounter++,
          agent: { name: DUMMY_USER.name },
          borrower: { name: l.user?.name },
          amount: (p.baseAmount || p.totalCollected || 0) * 0.10,
          percentage: 10,
          status: 'PAID',
          createdAt: p.date || p.createdAt || new Date().toISOString()
        });
      });

      // Pending Commissions (10% of unpaid interest)
      if (l.unpaidInterest > 0) {
        comms.push({
          id: idCounter++,
          agent: { name: DUMMY_USER.name },
          borrower: { name: l.user?.name },
          amount: l.unpaidInterest * 0.10,
          percentage: 10,
          status: 'PENDING',
          createdAt: new Date().toISOString() // Represents current pending snapshot
        });
      }
    });
    return comms.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [loans]);

  const [payouts, setPayouts] = useState(DUMMY_PAYOUTS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [payoutFilter, setPayoutFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // KPI DETAIL STATE
  const [activeKpiDetail, setActiveKpiDetail] = useState(null);

  // PAYOUT STATE
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutError, setPayoutError] = useState('');

  const stats = {
    total: history.reduce((sum, c) => sum + Number(c.amount), 0),
    count: history.length,
  };
  const pendingEarnings = history.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + Number(c.amount), 0);

  // Sync amount when modal opens
  useEffect(() => {
    if (isPayoutModalOpen) {
      setPayoutAmount(pendingEarnings.toString());
      setPayoutError('');
    }
  }, [isPayoutModalOpen, pendingEarnings]);

  const handlePayoutRequest = () => {
    const amt = parseFloat(payoutAmount);
    if (!amt || amt <= 0) {
      setPayoutError('Please enter a valid amount.');
      return;
    }
    if (amt > pendingEarnings) {
      setPayoutError(`Maximum available: MXN $${pendingEarnings}`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setPayouts(prev => [{ id: Date.now(), agent: { name: DUMMY_USER.name }, amount: amt, method: 'NETWORK_TRANSFER', status: 'PENDING', createdAt: new Date().toISOString() }, ...prev]);
      setIsSubmitting(false);
      setIsPayoutModalOpen(false);
      alert(`Payout request for MXN $${amt} transmitted successfully.`);
    }, 1200);
  };

  const historyColumns = [
    { header: 'Node / ID', render: (c) => (<div><span className="text-sm font-bold text-slate-900 uppercase">#{c.id}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">{new Date(c.createdAt).toLocaleDateString()}</span></div>) },
    { header: 'Borrower', render: (c) => <span className="text-sm font-bold text-slate-800 uppercase">{c.borrower?.name}</span> },
    { header: 'Yield', align: 'right', render: (c) => (<div className="text-right"><span className="text-sm font-bold text-slate-900">{formatMoney(c.amount)}</span><span className="text-[9px] font-bold text-emerald-500 uppercase block mt-1">{c.percentage}% Ratio</span></div>) },
    { header: 'Status', align: 'center', render: (c) => <StatusBadge status={c.status === 'PAID' ? 'verified' : 'pending'} /> },
  ];

  const payoutColumns = [
    { header: 'Payout / Date', render: (p) => (<div><span className="text-sm font-bold text-slate-900 uppercase">#{p.id}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">{new Date(p.createdAt).toLocaleDateString()}</span></div>) },
    { header: 'Amount / Method', align: 'right', render: (p) => (<div className="text-right"><span className="text-base font-bold text-slate-900">{formatMoney(p.amount)}</span><span className="text-[9px] font-bold text-slate-400 uppercase block mt-1">{p.method}</span></div>) },
    { header: 'Verification', align: 'center', render: (p) => <StatusBadge status={p.status === 'COMPLETED' ? 'verified' : 'pending'} /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <PageTitle 
        title="Yield Intelligence" 
        subtitle="10% Interest Commission Analytics & Yield Tracking"
        action={
          <div className="flex items-center gap-3">
            <Btn variant="outline" onClick={generateDummyPaymentsData} className="italic font-black uppercase tracking-widest text-[9px] rounded-xl !h-12 px-6">
              Generate Trial Data
            </Btn>
            {pendingEarnings > 0 && (
              <Btn onClick={() => setIsPayoutModalOpen(true)} className="shadow-lg shadow-primary/20 italic font-black uppercase tracking-widest text-[9px] rounded-xl !h-12 px-6">
                <Wallet size={14} className="mr-2" /> Request Payout
              </Btn>
            )}
          </div>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Aggregate Yield" 
          value={formatMoney(stats.total)} 
          icon={DollarSign} 
          trend="Total Volume" 
          onClick={() => {
            if (historySectionRef.current) historySectionRef.current.scrollIntoView({ behavior: 'smooth' });
            setFilterStatus('all');
          }}
          className={filterStatus === 'all' ? '!border-primary bg-primary/5' : ''}
        />
        <StatCard 
          label="Pending Liquidity" 
          value={formatMoney(pendingEarnings)} 
          icon={Clock} 
          trend="Action Required"
          onClick={() => {
            if (historySectionRef.current) historySectionRef.current.scrollIntoView({ behavior: 'smooth' });
            setFilterStatus('pending');
          }}
          className={filterStatus === 'pending' ? '!border-amber-500 bg-amber-50/50' : ''}
        />
        <StatCard 
          label="Registry Entries" 
          value={stats.count} 
          icon={Activity} 
          trend="Network Flow"
          onClick={() => {
            if (historySectionRef.current) historySectionRef.current.scrollIntoView({ behavior: 'smooth' });
            setFilterStatus('paid');
          }}
          className={filterStatus === 'paid' ? '!border-emerald-500 bg-emerald-50/50' : ''}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div ref={historySectionRef} className="space-y-5 scroll-mt-24">
           <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tighter italic uppercase leading-none">Yield Ledger</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Inbound commission stream audit</p>
              </div>
              <div className="flex gap-2">
                 {['all', 'pending', 'paid'].map(k => (
                    <button key={k} onClick={() => setFilterStatus(k)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filterStatus === k ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                    >{k}</button>
                 ))}
              </div>
           </div>
            {history.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">No commissions recorded yet.</p>
                  <p className="text-xs text-slate-400 mt-1">To trial commission tracking and payout requests, generate dummy data.</p>
                </div>
                <Btn 
                  onClick={generateDummyPaymentsData}
                  className="mt-1 flex items-center gap-2 shadow-sm rounded-lg"
                  size="sm"
                >
                  Populate Trial Commissions
                </Btn>
              </div>
            ) : (
             <ProTable 
                columns={historyColumns} 
                data={history.filter(c => filterStatus === 'all' ? true : filterStatus === 'paid' ? c.status === 'PAID' : c.status !== 'PAID')} 
                onRowClick={(row) => setSelectedTx(row)}
             />
           )}
        </div>

        <div className="space-y-5">
           <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tighter italic uppercase leading-none">Payout Archive</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Outbound fund flow records</p>
              </div>
              <div className="flex gap-2">
                 {['all', 'PENDING', 'COMPLETED'].map(k => (
                    <button key={k} onClick={() => setPayoutFilter(k)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${payoutFilter === k ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                    >{k === 'COMPLETED' ? 'Verified' : k}</button>
                 ))}
              </div>
           </div>
           <ProTable 
              columns={payoutColumns} 
              data={payouts.filter(p => payoutFilter === 'all' ? true : p.status === payoutFilter)} 
              onRowClick={(row) => setSelectedTx({ ...row, type: 'payout' })}
           />
        </div>
      </div>

      <Modal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} title={selectedTx?.type === 'payout' ? 'Payout Verification' : 'Yield Node Disclosure'}>
         {selectedTx && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 p-10 rounded-[2rem] relative overflow-hidden text-white text-center shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />
                 <div className="w-16 h-16 rounded-2xl bg-white text-slate-900 flex items-center justify-center mb-6 mx-auto shadow-xl">
                    {selectedTx.type === 'payout' ? <Wallet size={28} className="italic" /> : <DollarSign size={28} className="italic" />}
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 italic">
                    {selectedTx.type === 'payout' ? 'Certified Payout' : 'Audited Node Yield'}
                 </p>
                 <h3 className="text-4xl font-black tracking-tighter text-white italic">{formatMoney(selectedTx.amount)}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {[
                   { label: selectedTx.type === 'payout' ? 'Payout Channel' : 'Target Entity', value: selectedTx.type === 'payout' ? selectedTx.method : (selectedTx.borrower?.name || 'BORROWER_NODE') },
                   { label: selectedTx.type === 'payout' ? 'Reference ID' : 'Yield Ratio', value: selectedTx.type === 'payout' ? `#ST-${selectedTx.id}` : `${selectedTx.percentage}% Allocation` },
                   { label: 'Value Date', value: formatDateDDMMYYYY(selectedTx.createdAt) },
                   { label: 'Registry Status', value: (selectedTx.status === 'PAID' || selectedTx.status === 'COMPLETED') ? 'CLEARED' : 'PENDING' },
                 ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-50 rounded-2xl hover:border-primary/20 transition-all group">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic group-hover:text-primary transition-colors">{row.label}</span>
                       <span className={`text-xs font-black uppercase tracking-tight italic ${row.label === 'Registry Status' ? ((selectedTx.status === 'PAID' || selectedTx.status === 'COMPLETED') ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-800'}`}>{row.value}</span>
                    </div>
                 ))}
              </div>

              <Btn variant="outline" onClick={() => setSelectedTx(null)} className="w-full h-14 uppercase tracking-widest text-[9px] font-black italic rounded-2xl">Dismiss Disclosure</Btn>
           </div>
         )}
      </Modal>

      <Modal isOpen={isPayoutModalOpen} onClose={() => setIsPayoutModalOpen(false)} title="Payout Protocol">
         <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className={`p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl text-white text-center ${pendingEarnings > 0 ? 'bg-primary' : 'bg-slate-900'}`}>
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] translate-x-1/2 -translate-y-1/2" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-3 italic text-center w-full">Request Amount (Editable)</p>
               
               <div className="relative max-w-[240px] mx-auto">
                 <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-black italic opacity-50">MXN $</span>
                 <input 
                   type="number"
                   value={payoutAmount}
                   onChange={e => {
                     setPayoutAmount(e.target.value);
                     if (parseFloat(e.target.value) > pendingEarnings) {
                       setPayoutError(`Limit: ${formatMoney(pendingEarnings)}`);
                     } else {
                       setPayoutError('');
                     }
                   }}
                   className="w-full bg-transparent border-none text-white text-5xl font-black tracking-tighter italic text-center focus:outline-none placeholder:opacity-30"
                   placeholder="0.00"
                 />
               </div>
               
               {payoutError && (
                 <p className="text-[10px] font-black uppercase text-red-200 mt-2 animate-bounce">{payoutError}</p>
               )}
            </div>

            <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-relaxed italic">
                    Total Liquidity Pipeline: <b>{formatMoney(pendingEarnings)}</b>. You can withdraw any amount up to this limit.
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Btn variant="outline" onClick={() => setIsPayoutModalOpen(false)} className="w-full h-14 italic font-black uppercase tracking-widest text-[9px] rounded-2xl">Cancel</Btn>
               <Btn 
                 onClick={handlePayoutRequest} 
                 disabled={pendingEarnings === 0 || isSubmitting || !!payoutError}
                 className={`w-full h-14 italic font-black uppercase tracking-widest text-[9px] rounded-2xl shadow-xl shadow-primary/20 ${pendingEarnings > 0 && !payoutError ? '' : 'grayscale opacity-50'}`}
               >
                  {isSubmitting ? 'Transmitting...' : `Payout MXN $${payoutAmount || '0'}`}
               </Btn>
            </div>
         </div>
      </Modal>
    </div>
  );
}
