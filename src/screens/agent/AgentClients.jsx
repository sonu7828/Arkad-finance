import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Phone, Mail, TrendingUp, Globe, Activity, 
  ChevronRight, Briefcase, ArrowRight, UserCheck, 
  Download as DownloadIcon, ShieldCheck, X, Plus, DollarSign, Percent, AlertCircle, Clock
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils.js';
import { PageTitle, StatusBadge, StatCard, Input, EmptyState, Btn, ProTable, Modal, FormField } from '../../components/UI';
import { getDueDateCounter } from '../../utils/dateUtils';
import { useLoans } from '../../context/LoanContext';

function formatMoney(value) {
  return `MXN $${Number(value || 0).toLocaleString()}`;
}

export default function AgentClients() {
  const navigate = useNavigate();
  const { loans } = useLoans();
  
  // We'll consider loans with an agent assigned as "our clients" for demo purposes
  const agentLoans = useMemo(() => loans.filter(l => l.status === 'active' || l.status === 'late'), [loans]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, OVERDUE, DUE_TODAY, UPCOMING

  const tabs = [
    { id: 'ALL', label: 'My Clients' },
    { id: 'OVERDUE', label: 'Overdue' },
    { id: 'DUE_TODAY', label: 'Due Today' },
    { id: 'UPCOMING', label: 'Upcoming' },
  ];

  const filteredClients = useMemo(() => {
    let result = agentLoans;

    // Search
    if (searchQuery) {
      result = result.filter(l => 
        (l.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.id || '').toString().includes(searchQuery)
      );
    }

    // Tabs
    result = result.filter(l => {
      if (!l.dueDate) return activeTab === 'ALL';
      const counter = getDueDateCounter(l.dueDate);
      
      if (activeTab === 'OVERDUE') return counter.includes('overdue') || l.status === 'late';
      if (activeTab === 'DUE_TODAY') return counter === 'Due today';
      if (activeTab === 'UPCOMING') return !counter.includes('overdue') && counter !== 'Due today';
      
      return true; // ALL
    });

    return result;
  }, [agentLoans, searchQuery, activeTab]);

  const totalAssets = agentLoans.reduce((sum, l) => sum + Number(l.principalAmount || 0), 0);

  const handleExport = () => {
    const exportData = filteredClients.map(l => ({
      ID: l.id, Name: l.user?.name,
      Status: l.status,
      Principal: l.principalAmount,
      InterestRate: l.interestRate
    }));
    exportToExcel(exportData, 'Agent_Client_List');
  };

  const handleWhatsAppUrge = (loan) => {
    // Assuming standard phone if not present
    const phone = "+5211234567890"; // Using dummy Mexican number 
    const message = encodeURIComponent(`¡Hola compa! Tu pago del préstamo ${loan.id} está VENCIDO. Por favor, regulariza tu situación lo antes posible para evitar recargos adicionales.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic">Network Registry</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Authorized Agent Client Portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" size="sm" onClick={handleExport} className="rounded-xl italic">
            <DownloadIcon size={14} className="mr-2" /> Export
          </Btn>
        </div>
      </div>

      {/* STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Network Size" value={agentLoans.length} icon={Users} trend="Active" />
        <StatCard label="Total AUM" value={`MXN $${(totalAssets/1000).toFixed(1)}k`} icon={TrendingUp} trend="+4.2%" />
        <StatCard label="Performance" value="84%" icon={UserCheck} trend="High" />
        <StatCard label="Market" value="Mexico" icon={Globe} trend="Domestic" />
      </section>

      {/* TABS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-primary shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search network members..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[11px] font-bold italic placeholder:text-slate-300 focus:border-primary/30 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <ProTable headers={['Member', 'Due Info', 'Exposure', 'Status', '']}>
        {filteredClients.map(cl => {
           const counter = cl.dueDate ? getDueDateCounter(cl.dueDate) : 'N/A';
           const isOverdue = counter.includes('overdue') || cl.status === 'late';

           return (
            <tr key={cl.id} className="group cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setSelectedClient(cl)}>
              <td>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black italic shadow-lg">
                    {cl.user?.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors italic uppercase tracking-tighter">{cl.user?.name}</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{cl.id}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex flex-col text-left italic">
                  <span className={`text-[11px] font-black ${isOverdue ? 'text-rose-500' : 'text-slate-600'}`}>
                    {cl.dueDate || 'No Date'}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>
                    {counter}
                  </span>
                </div>
              </td>
              <td>
                <div className="flex flex-col text-left italic">
                  <span className="text-sm font-black text-slate-900 tracking-tighter">{formatMoney(cl.principalAmount)}</span>
                  <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{cl.interestRate}% Rate</span>
                </div>
              </td>
              <td>
                <StatusBadge status={isOverdue ? 'LATE' : cl.status} />
              </td>
              <td className="text-right">
                {isOverdue ? (
                  <Btn 
                    size="sm" 
                    variant="danger" 
                    className="!py-1.5 !px-3 shadow-xl shadow-rose-500/20"
                    onClick={(e) => { e.stopPropagation(); handleWhatsAppUrge(cl); }}
                  >
                    WhatsApp Urge
                  </Btn>
                ) : (
                  <button className="p-2 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1">
                    <ArrowRight size={16} />
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </ProTable>

      {/* MODALS */}
      <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Member Profile Registry">
        {selectedClient && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 p-6 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
               <div className="w-16 h-16 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-xl font-black italic relative z-10">
                  {selectedClient.user?.name[0]}
               </div>
               <div className="relative z-10">
                  <h4 className="text-xl font-black tracking-tighter uppercase italic leading-none">{selectedClient.user?.name}</h4>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2 italic">
                     <ShieldCheck size={12} /> Institutional Verification Active
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
               {[
                 { label: 'Registry ID', value: selectedClient.id, icon: Briefcase },
                 { label: 'Net Exposure', value: formatMoney(selectedClient.principalAmount), icon: TrendingUp },
                 { label: 'Asset Yield', value: `${selectedClient.interestRate}% Fixed`, icon: Activity },
                 { label: 'Status Node', value: selectedClient.status, icon: UserCheck },
               ].map((item, i) => (
                 <div key={i} className="p-5 rounded-2xl border border-slate-50 bg-white space-y-1.5 hover:border-primary/20 transition-all group">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 italic">
                       <item.icon size={10} className="group-hover:text-primary transition-colors" /> {item.label}
                    </p>
                    <p className="text-[11px] font-black text-slate-700 italic tracking-tight uppercase">{item.value}</p>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
               <Btn variant="outline" className="w-full !h-14 italic font-black uppercase tracking-widest rounded-2xl text-[9px]" onClick={() => setSelectedClient(null)}>Dismiss</Btn>
               {(getDueDateCounter(selectedClient.dueDate).includes('overdue') || selectedClient.status === 'late') && (
                 <Btn 
                   variant="danger" 
                   className="w-full !h-14 italic font-black uppercase tracking-widest rounded-2xl text-[9px] shadow-xl shadow-rose-500/20"
                   onClick={() => handleWhatsAppUrge(selectedClient)}
                 >
                   Send WhatsApp Urge
                 </Btn>
               )}
            </div>
          </div>
        )}
      </Modal>

      {filteredClients.length === 0 && (
        <EmptyState icon={Briefcase} title="Registry Empty" description="No network members match your search parameters." />
      )}
    </div>
  );
}
