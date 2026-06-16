import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, Copy, Wallet, Users, Activity, ArrowRight, TrendingUp, ShieldCheck, Sparkles, Zap, ChevronRight, Share2
} from 'lucide-react';
import { PageTitle, StatusBadge, StatCard, Btn, ProTable } from '../../components/UI';

const DUMMY_CLIENTS = [
  { id: 1, name: 'Michael Johnson', phone: '+260971001122', status: 'approved', date: '2024-10-14' },
  { id: 2, name: 'Sarah Williams', phone: '+260971001133', status: 'pending', date: '2024-10-13' },
  { id: 3, name: 'David Brown', phone: '+260971001144', status: 'identified', date: '2024-10-12' },
];

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/register?ref=AGT-0042`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER & REFERRAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agent Dashboard</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Track your referrals and commission payouts</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn 
            variant="outline" 
            size="sm" 
            onClick={handleCopyLink}
            className={copied ? '!border-emerald-500 !text-emerald-500 bg-emerald-50' : ''}
          >
            {copied ? (
              <><Check size={14} className="mr-2" /> Copied</>
            ) : (
              <><Copy size={14} className="mr-2" /> Copy Referral</>
            )}
          </Btn>
          <Btn size="sm" onClick={() => navigate('/agent/clients')}>
             <Share2 size={14} className="mr-2" /> Invite Client
          </Btn>
        </div>
      </div>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Clients" value="12" icon={Users} trend="+2 this month" onClick={() => navigate('/agent/clients')} />
        <StatCard label="Total Earnings" value="$1,400" icon={TrendingUp} trend="Gross Yield" onClick={() => navigate('/agent/commissions')} />
        <StatCard label="Active Portfolio" value="7" icon={Activity} trend="Healthy" onClick={() => navigate('/agent/clients')} />
        <StatCard label="Pending Payout" value="$550" icon={Wallet} trend="Available for Payout" onClick={() => navigate('/agent/payments')} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* REFERRAL LIST */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Recent Referral Activity
            </h3>
            <button onClick={() => navigate('/agent/clients')} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Full Directory</button>
          </div>

          <ProTable 
            headers={['Client', { label: 'Contact', className: 'hidden sm:table-cell' }, 'Status', '']}
          >
            {DUMMY_CLIENTS.map((client) => (
              <tr key={client.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">
                      {client.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 truncate max-w-[120px] md:max-w-none">{client.name}</span>
                      <span className="text-[10px] text-slate-400 sm:hidden font-bold tracking-widest">{client.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell"><span className="text-xs font-medium text-slate-400">{client.phone}</span></td>
                <td><StatusBadge status={client.status} /></td>
                <td className="text-right">
                  <button onClick={() => navigate('/agent/clients')} className="p-2 text-slate-300 hover:text-primary transition-colors">
                    <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </ProTable>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="pro-card p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Navigation</h4>
              <div className="space-y-2">
                {[
                  { label: 'Payout History', icon: Wallet, path: '/agent/payments' },
                  { label: 'Commission Stats', icon: TrendingUp, path: '/agent/commissions' },
                  { label: 'Account Profile', icon: ShieldCheck, path: '/agent/profile' },
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

           <div className="pro-card p-6 bg-primary/5 border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                    <Sparkles size={16} />
                 </div>
                 <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Agent Incentive</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                 You are only 3 referrals away from becoming a **Gold Tier Agent**. Unlock an extra 2% commission on all payouts.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
