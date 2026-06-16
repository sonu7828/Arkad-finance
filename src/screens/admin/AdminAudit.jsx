import React, { useState, useMemo } from 'react';
import { 
  History, Search, Clock, User, Globe, ShieldCheck, Activity, Download, 
  Zap, Fingerprint, Database, Server, Cpu, Network, RotateCcw, ShieldAlert, 
  ChevronRight, Settings, Bell, Eye, FileText
} from 'lucide-react';
import { PageTitle, Btn, Input, StatusBadge, StatCard, ProTable, Modal, Divider, FormField } from '../../components/UI';

const DUMMY_LOGS = [
  { id: 'LOG-3301', action: 'Institutional Disbursement Authorization', performedBy: 'Root Admin', timestamp: new Date().toISOString(), type: 'admin' },
  { id: 'LOG-3302', action: 'Risk Engine Recalculation', performedBy: 'System AI', timestamp: new Date().toISOString(), type: 'system' },
  { id: 'LOG-3303', action: 'API Authentication Handshake', performedBy: 'External Node', timestamp: new Date().toISOString(), type: 'system' },
  { id: 'LOG-3304', action: 'Policy Configuration Update', performedBy: 'Security Lead', timestamp: new Date().toISOString(), type: 'admin' },
  { id: 'LOG-3305', action: 'Batch Payment Verification', performedBy: 'Staff Node', timestamp: new Date().toISOString(), type: 'admin' },
];

export default function AdminAudit() {
  const [logs, setLogs] = useState(DUMMY_LOGS);
  const [search, setSearch] = useState('');
  const [logScope, setLogScope] = useState('all');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    neural_risk_scoring: true,
    auto_reminders: true,
    debug_mode: false
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const toggleSetting = (key) => {
    setSettings(p => ({ ...p, [key]: !p[key] }));
  };

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.performedBy.toLowerCase().includes(search.toLowerCase());
      const matchesScope = logScope === 'all' || log.type === logScope;
      return matchesSearch && matchesScope;
    });
  }, [logs, search, logScope]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Telemetery Registry" 
        subtitle="Comprehensive audit trail of institutional operations and system interactions" 
        action={
          <div className="flex items-center gap-4">
             <Btn variant="outline" size="md" onClick={handleRefresh} loading={loading}>
                <RotateCcw size={16} className="mr-2" /> Synchronize Logs
             </Btn>
             <Btn size="md">
                <Download size={16} className="mr-2" /> Export Protocol
             </Btn>
          </div>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {[
           { id: 'maintenance_mode', label: 'Service Lockdown', icon: Server, desc: 'Restrict network ingress', color: 'text-rose-500' },
           { id: 'neural_risk_scoring', label: 'ML Analytics', icon: Cpu, desc: 'Automated policy grading', color: 'text-primary' },
           { id: 'auto_reminders', label: 'Notice Automation', icon: Bell, desc: 'Client engagement nodes', color: 'text-emerald-500' },
           { id: 'debug_mode', label: 'Telemetry Verbose', icon: Database, desc: 'Enhanced debug stream', color: 'text-amber-500' },
         ].map((s) => (
           <div key={s.id} className="pro-card p-8 bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-8">
                 <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all ${settings[s.id] ? s.color : 'text-slate-300'}`}>
                    <s.icon size={20} />
                 </div>
                 <div 
                    onClick={() => toggleSetting(s.id)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${settings[s.id] ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings[s.id] ? 'left-7' : 'left-1'}`} />
                  </div>
              </div>
              <div>
                 <h4 className="text-sm font-bold text-slate-800 tracking-tight">{s.label}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{s.desc}</p>
              </div>
           </div>
         ))}
      </section>

      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Net Logs', icon: FileText },
                { id: 'admin', label: 'Human Nodes', icon: User },
                { id: 'system', label: 'Core Events', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLogScope(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    logScope === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="relative flex-1 xl:max-w-xs w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                className="premium-input pl-12 h-12"
                placeholder="Search audit trail..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
        </div>

        <ProTable headers={[
          { label: 'Activity Log' },
          { label: 'Executor' },
          { label: 'Registry Date' },
          { label: 'Registry Key' },
          { label: 'Action', className: 'text-right' }
        ]}>
          {filtered.map((log) => (
            <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                       <Fingerprint size={18} />
                    </div>
                    <p className="text-[13px] font-bold text-slate-800 tracking-tight">{log.action}</p>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'admin' ? 'bg-primary' : 'bg-slate-300'}`} />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{log.performedBy}</p>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <div className="space-y-0.5 font-bold tracking-tight">
                    <p className="text-[11px] text-slate-600 uppercase">{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</p>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg">
                    {log.id}
                 </span>
              </td>
              <td className="px-6 py-5 text-right">
                 <Btn size="sm" variant="outline">View Detail</Btn>
              </td>
            </tr>
          ))}
        </ProTable>
      </div>
    </div>
  );
}

