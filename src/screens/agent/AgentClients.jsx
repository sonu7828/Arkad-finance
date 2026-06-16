import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Phone, Mail, TrendingUp, Globe, Activity,
  ChevronRight, Briefcase, ArrowRight, UserCheck,
  Download as DownloadIcon, ShieldCheck, X, Plus, DollarSign, Percent, AlertCircle, Clock,
  LayoutGrid, Table, Send, CheckCircle2, Wallet, Award
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils.js';
import { PageTitle, StatusBadge, StatCard, Input, EmptyState, Btn, ProTable, Modal, FormField } from '../../components/UI';
import { getDueDateCounter } from '../../utils/dateUtils';
import { useLoans } from '../../context/LoanContext';
import { useAuth } from '../../context/AuthContext';

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AgentClients() {
  const navigate = useNavigate();
  const { loans, generateDummyPaymentsData } = useLoans();
  const { user: authUser } = useAuth();

  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, OVERDUE, DUE_TODAY, UPCOMING, EARNINGS
  const [toastMessage, setToastMessage] = useState('');

  // Setup default referred loans/scenarios so they are always present for demo purposes
  const agentLoans = useMemo(() => {
    let list = loans.filter(l =>
      l.agent === authUser?.id ||
      l.agent === 'AG-2024-CARLOS' ||
      l.agent === 'agent@arkad.com' ||
      (!l.agent || l.agent === 'None')
    );

    const defaultReferred = [
      {
        id: 'LOAN-2024-001',
        user: { name: 'José Garcia', email: 'jose@example.com' },
        principalAmount: 1500,
        amountDue: 150.00,
        status: 'Active',
        dueDate: new Date().toISOString().split('T')[0], // Today
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-005',
        user: { name: 'María López', email: 'maria@example.com' },
        principalAmount: 2000,
        amountDue: 200.00,
        status: 'Late',
        dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days overdue
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-008',
        user: { name: 'Miguel Santos', email: 'miguel@example.com' },
        principalAmount: 1750,
        amountDue: 175.00,
        status: 'Late',
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // 5 days overdue
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-012',
        user: { name: 'Ana Rodriguez', email: 'ana@example.com' },
        principalAmount: 2250,
        amountDue: 225.00,
        status: 'Active',
        dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0], // 8 days from now
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-013',
        user: { name: 'Carlos Gomez', email: 'carlos.g@example.com' },
        principalAmount: 3000,
        amountDue: 300.00,
        status: 'Active',
        dueDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0], // 12 days
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-014',
        user: { name: 'Sofia Hernandez', email: 'sofia@example.com' },
        principalAmount: 5250,
        amountDue: 525.00,
        status: 'Active',
        dueDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0], // 18 days
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-015',
        user: { name: 'Luis Ramirez', email: 'luis@example.com' },
        principalAmount: 1000,
        amountDue: 100.00,
        status: 'Paid',
        dueDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-016',
        user: { name: 'Elena Torres', email: 'elena@example.com' },
        principalAmount: 1200,
        amountDue: 120.00,
        status: 'Paid',
        dueDate: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-017',
        user: { name: 'Juan Ortega', email: 'juan@example.com' },
        principalAmount: 1500,
        amountDue: 150.00,
        status: 'Active',
        dueDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-018',
        user: { name: 'Isabella Silva', email: 'isabella@example.com' },
        principalAmount: 2000,
        amountDue: 200.00,
        status: 'Active',
        dueDate: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-019',
        user: { name: 'Daniel Santos', email: 'daniel@example.com' },
        principalAmount: 1100,
        amountDue: 110.00,
        status: 'Active',
        dueDate: new Date(Date.now() + 29 * 86400000).toISOString().split('T')[0],
        interestRate: 10,
        agentCommission: 10
      },
      {
        id: 'LOAN-2024-020',
        user: { name: 'Lucia Alvarez', email: 'lucia@example.com' },
        principalAmount: 1300,
        amountDue: 130.00,
        status: 'Active',
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        interestRate: 10,
        agentCommission: 10
      }
    ];

    const merged = [...list];
    defaultReferred.forEach(def => {
      if (!merged.some(l => l.id === def.id)) {
        merged.push(def);
      }
    });

    return merged;
  }, [loans, authUser]);

  const tabs = [
    { id: 'ALL', label: 'My Clients' },
    { id: 'OVERDUE', label: 'Overdue' },
    { id: 'DUE_TODAY', label: 'Due Today' },
    { id: 'UPCOMING', label: 'Upcoming' },
    { id: 'EARNINGS', label: 'My Earnings' },
  ];

  // Process clients data with badge colors & status mapping
  const processedClients = useMemo(() => {
    return agentLoans.map(cl => {
      let statusText = 'ON-TIME';
      let badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100'; // Green

      const statusLower = cl.status?.toLowerCase();
      if (statusLower === 'paid' || statusLower === 'completed') {
        statusText = 'PAID';
        badgeColor = 'bg-slate-100 text-slate-500 border-slate-200'; // Gray
      } else if (cl.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(cl.dueDate);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          statusText = 'DUE TODAY';
          badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100'; // Green
        } else if (diffDays > 0) {
          statusText = `DUE IN ${diffDays} DAYS`;
          badgeColor = 'bg-amber-50 text-amber-600 border-amber-100'; // Gold
        } else {
          statusText = `${Math.abs(diffDays)} DAYS OVERDUE`;
          badgeColor = 'bg-rose-50 text-rose-600 border-rose-100'; // Red
        }
      }

      // Calculations
      const amountDue = cl.amountDue || (cl.principalAmount / (cl.duration || 12)) * (1 + (cl.interestRate || 10) / 100);
      const commissionRate = authUser?.commissionRate ? parseFloat(authUser.commissionRate) / 100 : 0.10;
      const commission = amountDue * commissionRate;

      return {
        ...cl,
        statusText,
        badgeColor,
        amountDue,
        commission
      };
    });
  }, [agentLoans, authUser]);

  // Compute stats/totals dynamically to exactly match requirements
  const overdueTotal = useMemo(() => {
    return processedClients
      .filter(cl => cl.statusText.includes('OVERDUE'))
      .reduce((sum, cl) => sum + cl.amountDue, 0);
  }, [processedClients]);

  const dueTodayTotal = useMemo(() => {
    return processedClients
      .filter(cl => cl.statusText === 'DUE TODAY')
      .reduce((sum, cl) => sum + cl.amountDue, 0);
  }, [processedClients]);

  const upcomingTotal = useMemo(() => {
    return processedClients
      .filter(cl => cl.statusText.includes('DUE IN') || cl.statusText === 'ON-TIME')
      .reduce((sum, cl) => sum + cl.amountDue, 0);
  }, [processedClients]);

  const filteredClients = useMemo(() => {
    let result = processedClients;

    // Search
    if (searchQuery && activeTab !== 'EARNINGS') {
      result = result.filter(l =>
        (l.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.id || '').toString().includes(searchQuery)
      );
    }

    // Tabs
    result = result.filter(l => {
      if (activeTab === 'OVERDUE') return l.statusText.includes('OVERDUE');
      if (activeTab === 'DUE_TODAY') return l.statusText === 'DUE TODAY';
      if (activeTab === 'UPCOMING') return l.statusText.includes('DUE IN') || l.statusText === 'ON-TIME';
      return true; // ALL
    });

    return result;
  }, [processedClients, searchQuery, activeTab]);

  const totalAssets = agentLoans.reduce((sum, l) => sum + Number(l.principalAmount || 0), 0);

  const handleExport = () => {
    const exportData = filteredClients.map(l => ({
      ID: l.id,
      Name: l.user?.name,
      Status: l.statusText,
      AmountDue: l.amountDue,
      Commission: l.commission
    }));
    exportToExcel(exportData, 'Agent_Client_List');
  };

  const handleRemind = (client) => {
    setToastMessage(`Reminder notification sent to ${client.user?.name || 'client'} successfully!`);
    setTimeout(() => setToastMessage(''), 4000);

    const phone = client.user?.whatsapp || "+5211234567890";
    const amountStr = `$${client.amountDue.toFixed(2)}`;
    let messageText = '';

    if (client.statusText === 'DUE TODAY') {
      messageText = `¡Hola compa! Te recuerdo que tu pago está DUE TODAY.\nPréstamo: ${client.id} | Monto: ${amountStr} |\nPor favor realiza el pago hoy. ¡Gracias!`;
    } else if (client.statusText.includes('2 DAYS OVERDUE')) {
      messageText = `¡Hola compa! Tu pago está VENCIDO HACE 2 DÍAS.\nPréstamo: ${client.id} | Monto: ${amountStr} |\nPor favor realiza el pago cuanto antes. Gracias.`;
    } else if (client.statusText.includes('OVERDUE')) {
      const daysMatch = client.statusText.match(/\d+/);
      const days = daysMatch ? daysMatch[0] : '5';
      messageText = `¡Hola compa! Tu pago está VENCIDO HACE ${days} DÍAS.\nPréstamo: ${client.id} | Monto: ${amountStr} |\nEs URGENTE que realices el pago hoy. Gracias.`;
    } else {
      messageText = `¡Hola compa! Te recuerdo de tu próximo pago.\nPréstamo: ${client.id} | Monto: ${amountStr} |\nPor favor realiza el pago. ¡Gracias!`;
    }

    const encodedMessage = encodeURIComponent(messageText);
    window.open(`https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${encodedMessage}`, '_blank');
  };

  // Static commission data for Tab 5 exactly as specified:
  const commissionBreakdown = [
    { name: 'José Garcia', id: 'LOAN-2024-001', rate: '10%', commission: 15.00, status: 'Pending' },
    { name: 'María López', id: 'LOAN-2024-005', rate: '10%', commission: 20.00, status: 'Pending' },
    { name: 'Miguel Santos', id: 'LOAN-2024-008', rate: '10%', commission: 17.50, status: 'Pending' },
    { name: 'Ana Rodriguez', id: 'LOAN-2024-012', rate: '10%', commission: 22.50, status: 'Paid' },
  ];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-top-6 duration-300">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider">Reminder Dispatched</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

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

      {/* STATS SUMMARY (Hide on Earnings tab to avoid confusion with earnings cards) */}
      {activeTab !== 'EARNINGS' && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          <StatCard label="Network Size" value={agentLoans.length} icon={Users} trend="Active" />
          <StatCard label="Total AUM" value={`MXN $${(totalAssets / 1000).toFixed(1)}k`} icon={TrendingUp} trend="+4.2%" />
          <StatCard label="Performance" value="84%" icon={UserCheck} trend="High" />
          <StatCard label="Market" value="Mexico" icon={Globe} trend="Domestic" />
        </section>
      )}

      {/* TABS & FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'EARNINGS' && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-[#0a3d62] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                title="Card Layout"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#0a3d62] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                title="Table Layout"
              >
                <Table size={16} />
              </button>
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
        )}
      </div>

      {/* TOTAL BANNERS FOR FILTERS */}
      {activeTab === 'OVERDUE' && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-500" />
            <span className="text-xs font-black uppercase tracking-wider">Total overdue from my clients:</span>
          </div>
          <span className="text-sm font-black tracking-tight">{formatMoney(overdueTotal)}</span>
        </div>
      )}

      {activeTab === 'DUE_TODAY' && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between text-emerald-800">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider">Total due today:</span>
          </div>
          <span className="text-sm font-black tracking-tight">{formatMoney(dueTodayTotal)}</span>
        </div>
      )}

      {activeTab === 'UPCOMING' && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between text-amber-800">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon size={18} className="text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider">Total upcoming:</span>
          </div>
          <span className="text-sm font-black tracking-tight">{formatMoney(upcomingTotal)} in next 30 days</span>
        </div>
      )}

      {/* PRESENTATION CONTAINER */}
      {activeTab === 'EARNINGS' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pro-card p-6 bg-white border border-slate-100 shadow-sm rounded-3xl text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Wallet size={24} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">$145.00</p>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-none">Total Pending Commission</p>
              <p className="text-[9px] font-medium text-slate-400 italic">(waiting for collection)</p>
            </div>

            <div className="pro-card p-6 bg-white border border-slate-100 shadow-sm rounded-3xl text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">$320.00</p>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-none">Commission Paid (This Month)</p>
              <p className="text-[9px] font-medium text-slate-400 italic">(already received)</p>
            </div>

            <div className="pro-card p-6 bg-white border border-slate-100 shadow-sm rounded-3xl text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Award size={24} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">$2,840.00</p>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-none">All-Time Earnings</p>
              <p className="text-[9px] font-medium text-slate-400 italic">(since joining)</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest px-1">Commission Breakdown</h3>
            <ProTable headers={['Client', 'Loan ID', 'Rate', 'Commission', 'Status']}>
              {commissionBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="font-bold text-slate-800 italic uppercase">{row.name}</td>
                  <td className="font-mono text-xs text-slate-500 font-bold">{row.id}</td>
                  <td className="font-bold text-slate-700">{row.rate}</td>
                  <td className="font-black text-slate-950">${row.commission.toFixed(2)}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${row.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </ProTable>
          </div>
        </div>
      ) : (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(cl => (
              <div
                key={cl.id}
                className="pro-card p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 cursor-pointer"
                onClick={() => setSelectedClient(cl)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{cl.user?.name}</h3>
                    <p className="text-[11px] font-mono font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{cl.id}</p>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cl.badgeColor}`}>
                      {cl.statusText}
                    </span>
                    <p className="text-[10px] font-black text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded border border-emerald-100/30 mt-2 uppercase tracking-wider leading-none">
                      Comm: {formatMoney(cl.commission)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100/70 pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{formatMoney(cl.amountDue)}</p>
                  </div>
                </div>

                {cl.statusText !== 'PAID' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemind(cl);
                    }}
                    className="w-full h-11 bg-[#0a3d62] hover:bg-[#072a44] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm mt-2"
                  >
                    <Send size={12} /> Remind Client
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ProTable headers={['Member', 'Due Info', 'Exposure', 'Commission', 'Status', '']}>
            {filteredClients.map(cl => {
              const isOverdue = cl.statusText.includes('OVERDUE');
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
                        {cl.statusText}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col text-left italic">
                      <span className="text-sm font-black text-slate-900 tracking-tighter">{formatMoney(cl.amountDue)}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{cl.interestRate || 10}% Rate</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm font-black text-emerald-600">{formatMoney(cl.commission)}</span>
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cl.badgeColor}`}>
                      {cl.statusText}
                    </span>
                  </td>
                  <td className="text-right">
                    {cl.statusText !== 'PAID' ? (
                      <Btn
                        size="sm"
                        className="!py-1.5 !px-3 shadow-sm"
                        onClick={(e) => { e.stopPropagation(); handleRemind(cl); }}
                      >
                        Remind
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
        )
      )}

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
                { label: 'Commission Earned', value: formatMoney(selectedClient.commission), icon: DollarSign },
                { label: 'Status Node', value: selectedClient.statusText, icon: UserCheck },
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
              {selectedClient.statusText !== 'PAID' && (
                <Btn
                  className="w-full !h-14 italic font-black uppercase tracking-widest rounded-2xl text-[9px] shadow-lg"
                  onClick={() => { handleRemind(selectedClient); setSelectedClient(null); }}
                >
                  Send Payment Reminder
                </Btn>
              )}
            </div>
          </div>
        )}
      </Modal>

      {agentLoans.length === 0 ? (
        <div className="pro-card p-10 text-center flex flex-col items-center justify-center space-y-4 border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-700 font-bold text-sm">No clients are currently registered in your network!</p>
            <p className="text-slate-400 text-xs mt-1">To trial/test the Network Registry features, generate sample trial data.</p>
          </div>
          <Btn
            onClick={generateDummyPaymentsData}
            className="mt-2 flex items-center gap-2 shadow-lg shadow-primary/20 rounded-xl"
            size="sm"
          >
            <Plus size={14} /> Populate Trial Network
          </Btn>
        </div>
      ) : (
        filteredClients.length === 0 && activeTab !== 'EARNINGS' && (
          <EmptyState icon={Briefcase} title="Registry Empty" description="No network members match your search parameters." />
        )
      )}
    </div>
  );
}

// Small inline Lucide wrapper component in case CalendarDays is missing or differently named in Lucide version.
function CalendarDaysIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}
