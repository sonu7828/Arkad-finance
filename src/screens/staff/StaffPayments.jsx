import React, { useState, useMemo } from 'react';
import {
  DollarSign, Search, CheckCircle2, XCircle, Clock, ShieldCheck, Zap,
  CreditCard, FileText, Activity, ArrowRight, User, TrendingUp
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageTitle, StatusBadge, StatCard, Btn } from '../../components/UI';
import Modal from '../../components/Modal';

const DUMMY_PAYMENTS = [
  { id: 'P-5501', loanId: 'LN-8801', loan: { user: { name: 'Michael Johnson', email: 'michael@email.com' } }, baseAmount: 1200, totalCollected: 1200, trxId: 'TXN-88271', status: 'pending', createdAt: '2024-10-14', method: 'Direct Transfer', penaltyAmount: 0 },
  { id: 'P-5502', loanId: 'LN-8802', loan: { user: { name: 'Sarah Williams', email: 'sarah@email.com' } }, baseAmount: 1500, totalCollected: 1500, trxId: 'TXN-88272', status: 'verified', createdAt: '2024-10-15', method: 'Mobile Money', penaltyAmount: 0 },
  { id: 'P-5503', loanId: 'LN-8803', loan: { user: { name: 'David Brown', email: 'david@email.com' } }, baseAmount: 850, totalCollected: 1050, trxId: 'TXN-88273', status: 'late', createdAt: '2024-10-12', method: 'Card Payment', penaltyAmount: 200 },
  { id: 'P-5504', loanId: 'LN-8804', loan: { user: { name: 'Emma Thompson', email: 'emma@email.com' } }, baseAmount: 2500, totalCollected: 2500, trxId: 'TXN-88274', status: 'verified', createdAt: '2024-10-10', method: 'Bank Wire', penaltyAmount: 0 },
  { id: 'P-5505', loanId: 'LN-8805', loan: { user: { name: 'James Wilson', email: 'james@email.com' } }, baseAmount: 1100, totalCollected: 1100, trxId: 'TXN-88275', status: 'pending', createdAt: '2024-10-16', method: 'Direct Transfer', penaltyAmount: 0 },
];

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function StaffPayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    const t = searchParams.get('tab');
    if (t === 'verification') return 'PENDING';
    if (t === 'verified') return 'VERIFIED';
    return 'ALL';
  }, [searchParams]);

  const setPayTab = (tab) => {
    if (tab === 'ALL') setSearchParams({}, { replace: true });
    else if (tab === 'PENDING') setSearchParams({ tab: 'verification' }, { replace: true });
    else if (tab === 'VERIFIED') setSearchParams({ tab: 'verified' }, { replace: true });
  };

  const [payments, setPayments] = useState(DUMMY_PAYMENTS);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);

  const stats = {
    totalPrincipal: payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + Number(p.totalCollected || 0), 0),
    pendingCount: payments.filter(p => p.status === 'pending').length,
    overdueCount: payments.filter(p => p.status === 'late').length,
    totalUsers: new Set(payments.map(p => p.loan?.user?.name)).size,
  };

  const filtered = payments.filter(p => {
    const name = p.loan?.user?.name || '';
    const trx = p.trxId || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || trx.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'ALL' ? true : p.status.toUpperCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleVerify = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'verified' } : p));
    setViewModal(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageTitle
        title={activeTab === 'PENDING' ? 'Verification Hub' : activeTab === 'VERIFIED' ? 'Authorized Payments' : 'Payment Ledger'}
        subtitle="Track and verify all incoming loan repayments and capital flows."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Verified Volume" value={formatMoney(stats.totalPrincipal)} color="text-emerald-500" icon={TrendingUp} />
        <StatCard label="Pending Verification" value={stats.pendingCount} color="text-primary" icon={Zap} />
        <StatCard label="Overdue Payments" value={stats.overdueCount} color="text-rose-500" icon={Activity} />
        <StatCard label="Total Clients" value={stats.totalUsers} color="text-slate-900" icon={User} />
      </section>

      <div className="pro-card bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/50">
          <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 gap-1">
            {[{ id: 'PENDING', label: 'New Signals' }, { id: 'VERIFIED', label: 'Authorized' }, { id: 'ALL', label: 'All Records' }].map(tab => (
              <button key={tab.id} onClick={() => setPayTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-600'}`}
              >{tab.label}</button>
            ))}
          </div>
          <div className="relative w-full xl:w-80 group">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or transaction ID..." className="premium-input pl-12 h-11" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={28} className="text-slate-200" />
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No matching signals found</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id} onClick={() => setViewModal(p)}
              className="p-6 bg-white border-2 border-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between group professional-hover gap-6 cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-primary flex items-center justify-center shadow-sm group-hover:rotate-6 transition-all">
                  <DollarSign size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{p.loan?.user?.name || '—'}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REF: {p.trxId}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-6">
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">{formatMoney(p.totalCollected)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.method}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="PAYMENT VERIFICATION" size="sm">
        {viewModal && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Grid Layout - Always 2 Columns for that Premium Look */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
               <div className="space-y-1">
                  <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Borrower</label>
                  <div className="premium-input bg-white border-slate-100 h-10 sm:h-12 flex items-center px-3 sm:px-4 text-slate-900 font-bold text-[10px] sm:text-xs truncate">
                    {viewModal.loan?.user?.name}
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                  <div className="premium-input bg-white border-slate-100 h-10 sm:h-12 flex items-center px-3 sm:px-4 text-slate-900 font-black text-[10px] sm:text-xs">
                    {formatMoney(viewModal.totalCollected)}
                  </div>
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Source / REF</label>
               <div className="premium-input bg-white border-slate-100 h-10 sm:h-12 flex items-center px-3 sm:px-4 text-slate-900 font-bold text-[9px] sm:text-[10px] truncate">
                  {viewModal.method} — {viewModal.trxId}
               </div>
            </div>

            {/* Buttons - Always Side by Side */}
            <div className="flex items-center gap-2 sm:gap-3 pt-2">
               <button 
                  onClick={() => setViewModal(null)}
                  className="flex-1 h-10 sm:h-12 rounded-xl bg-slate-50 text-slate-500 font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
               >
                  Cancel
               </button>
               {viewModal.status === 'pending' && (
                 <button 
                    onClick={() => handleVerify(viewModal.id)}
                    className="flex-1 h-10 sm:h-12 rounded-xl bg-primary text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                 >
                    Authorize
                 </button>
               )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
