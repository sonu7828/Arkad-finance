import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, CheckCircle2, Clock, TrendingUp, ShieldCheck, FileText, CreditCard,
  BarChart3, Users, ArrowRight, User, ChevronRight, Activity, Download as DownloadIcon, Truck
} from 'lucide-react';
import { StatusBadge, StatCard, Btn, ProTable, PageTitle } from '../../components/UI';
import { useLoans } from '../../context/LoanContext';

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { loans, updateLoan } = useLoans();

  const allLoans = React.useMemo(() => {
    return loans.map(l => ({
      ...l,
      status: l.status === 'Pending' || l.status === 'PENDING' ? 'pending' : l.status === 'Active' || l.status === 'APPROVED' ? 'active' : l.status.toLowerCase()
    }));
  }, [loans]);

  const pendingCount = allLoans.filter(l => l.status === 'pending').length;
  const todayCollections = allLoans.reduce((sum, l) => sum + (l.principalAmount * 0.08), 0); // Simulated collection target

  const cashDeliveries = allLoans.filter(l => l.status === 'terms_set' || (l.status === 'active' && !l.disbursementDate));

  const handleConfirmPickup = (id) => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    updateLoan(id, {
      status: 'active',
      disbursementDate: today.toISOString().split('T')[0],
      dueDate: nextMonth.toISOString().split('T')[0]
    });
    alert('Pickup confirmed. Loan successfully disbursed!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Operations Hub</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daily loan processing & verification queue</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" size="sm" onClick={() => navigate('/staff/calendar')}>
            <Calendar size={14} className="mr-2" /> Schedule
          </Btn>
          <Btn size="sm" onClick={() => navigate('/staff/loans')}>
            Review Queue
          </Btn>
        </div>
      </div>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Pending Review" value={pendingCount} icon={FileText} trend="Needs Action" />
        <StatCard label="Cash Deliveries" value={cashDeliveries.length} icon={Truck} trend="Action Required" />
        <StatCard label="Target Collections" value={formatMoney(todayCollections)} icon={TrendingUp} trend="Daily Goal" />
        <StatCard label="Due Payments" value="14" icon={Clock} trend="Priority" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* REVIEW QUEUE */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CASH DELIVERY QUEUE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Truck size={16} className="text-amber-500" /> Pending Cash Pickups
              </h3>
            </div>

            {cashDeliveries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-400">No cash deliveries scheduled right now.</p>
              </div>
            ) : (
              <ProTable headers={['Borrower', 'Amount', 'Status', 'Action']}>
                {cashDeliveries.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 text-[10px] font-bold shrink-0">
                          {l.user.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 truncate max-w-[120px] md:max-w-none">{l.user.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{l.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-sm font-bold text-slate-900">{formatMoney(l.principalAmount)}</span></td>
                    <td><StatusBadge status="PENDING DISBURSEMENT" /></td>
                    <td className="text-right">
                      <Btn variant="primary" size="sm" onClick={() => handleConfirmPickup(l.id)}>Confirm Pickup</Btn>
                    </td>
                  </tr>
                ))}
              </ProTable>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" /> Incoming Applications
              </h3>
              <button onClick={() => navigate('/staff/loans')} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View Full Queue</button>
            </div>

            <ProTable 
              headers={['Borrower', 'Amount', { label: 'Tenure', className: 'hidden sm:table-cell' }, 'Status', 'Action']}
            >
              {allLoans.filter(l => l.status === 'pending').map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">
                        {l.user.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 truncate max-w-[120px] md:max-w-none">{l.user.name}</span>
                        <span className="text-[10px] text-slate-400 sm:hidden font-bold tracking-widest">{l.duration} Months</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm font-bold text-slate-900">{formatMoney(l.principalAmount)}</span></td>
                  <td className="hidden sm:table-cell"><span className="text-xs font-medium text-slate-400">{l.duration} Months</span></td>
                  <td><StatusBadge status={l.status} /></td>
                  <td className="text-right">
                    <Btn variant="ghost" size="sm" onClick={() => navigate('/staff/loans')}>Verify</Btn>
                  </td>
                </tr>
              ))}
            </ProTable>
          </div>
        </div>

        {/* QUICK ACTIONS & UTILS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="pro-card p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Shortcuts</h4>
              <div className="space-y-2">
                {[
                  { label: 'Payment Verification', icon: CreditCard, path: '/staff/payments' },
                  { label: 'Customer Directory', icon: Users, path: '/staff/borrowers' },
                  { label: 'Notification Center', icon: Activity, path: '/staff/notifications' },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={14} className="text-slate-400 group-hover:text-primary" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    </div>
                    <ChevronRight size={12} className="text-slate-200" />
                  </button>
                ))}
              </div>
           </div>

           <div className="pro-card p-6 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary blur-[40px] opacity-20" />
              <div className="relative z-10 space-y-4 text-center">
                 <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                    <DownloadIcon size={20} className="text-primary" />
                 </div>
                 <h5 className="text-sm font-bold">End of Day Report</h5>
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest">Generate current collection summary</p>
                 <Btn variant="outline" size="sm" className="w-full !border-white/20 !text-white hover:!bg-white/10">Download CSV</Btn>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
