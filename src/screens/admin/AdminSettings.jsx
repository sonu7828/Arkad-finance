import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Save, RefreshCw, Layers, Shield, Percent, 
  Clock, Briefcase, Zap, AlertTriangle, CheckCircle2, Sliders, Activity, 
  Database, History, Cpu, Globe, Lock, Key, RotateCcw, ShieldAlert, Trash2, 
  Terminal, Server, ChevronRight, AlertCircle
} from 'lucide-react';
import { PageTitle, Btn, StatCard, Divider, Select } from '../../components/UI';
import { getLoanSettings, saveLoanSettings } from '../../utils/loanConfig';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    interestRate: '',
    graceDays: '',
    agentCommission: '',
    delinquentInterestRate: '',
    initiationFee: '',
    minLoanDuration: '1',
    minLoanAmount: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedSettings = getLoanSettings();
    setSettings({
      interestRate: savedSettings.interestRate.toString(),
      graceDays: savedSettings.graceDays.toString(),
      agentCommission: savedSettings.agentCommission.toString(),
      delinquentInterestRate: savedSettings.delinquentInterestRate.toString(),
      initiationFee: savedSettings.initiationFee.toString(),
      minLoanDuration: (savedSettings.minLoanDuration || 1).toString(),
      minLoanAmount: (savedSettings.minLoanAmount || 500).toString()
    });
  }, []);

  const validate = () => {
    const numericFields = [
      'interestRate', 'graceDays', 'agentCommission', 
      'delinquentInterestRate', 'initiationFee', 'minLoanAmount', 'minLoanDuration'
    ];
    
    for (const field of numericFields) {
      const val = parseFloat(settings[field]);
      if (isNaN(val) || val < 0) {
        setMessage({ type: 'error', text: `Invalid value for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.` });
        return false;
      }
    }
    return true;
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      const settingsToSave = {
        interestRate: parseFloat(settings.interestRate),
        graceDays: parseInt(settings.graceDays),
        agentCommission: parseFloat(settings.agentCommission),
        delinquentInterestRate: parseFloat(settings.delinquentInterestRate),
        initiationFee: parseFloat(settings.initiationFee),
        minLoanDuration: parseInt(settings.minLoanDuration),
        minLoanAmount: parseFloat(settings.minLoanAmount)
      };
      
      saveLoanSettings(settingsToSave);
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Financial parameters synchronized successfully.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 800);
  };

  const handleWipe = () => {
    if (window.confirm("CRITICAL: This will irreversibly purge the institutional data vault. Proceed?")) {
      setIsSaving(true);
      setTimeout(() => {
        localStorage.removeItem('loan_management_settings');
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Institutional Orchestration" 
        subtitle="Manage global interest yield, processing fees, and core system parameters" 
        action={
           <Btn variant="outline" size="md" onClick={() => window.location.reload()}>
              <RotateCcw size={16} className="mr-2" /> Sync Parameters
           </Btn>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 space-y-8">
            <form onSubmit={handleSave} className="pro-card p-10 bg-white border border-slate-100 shadow-sm space-y-10 group">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                     <Sliders size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 tracking-tight">Financial Policy Module</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Global yield and risk share constants</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Global Interest Rate (%)</label>
                     <div className="relative">
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input className="premium-input pl-11 h-12" type="number" step="0.01" value={settings.interestRate} onChange={e => setSettings(s => ({...s, interestRate: e.target.value}))} placeholder="e.g. 10" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Late Penalty Rate (%)</label>
                     <div className="relative">
                        <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={14} />
                        <input className="premium-input pl-11 h-12" type="number" step="0.01" value={settings.delinquentInterestRate} onChange={e => setSettings(s => ({...s, delinquentInterestRate: e.target.value}))} placeholder="e.g. 2" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Agent Participation (%)</label>
                     <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={14} />
                        <input className="premium-input pl-11 h-12" type="number" step="0.01" value={settings.agentCommission} onChange={e => setSettings(s => ({...s, agentCommission: e.target.value}))} placeholder="e.g. 5" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Grace Period (Days)</label>
                     <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input className="premium-input pl-11 h-12" type="number" value={settings.graceDays} onChange={e => setSettings(s => ({...s, graceDays: e.target.value}))} placeholder="e.g. 3" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Initiation Fee (MXN)</label>
                     <div className="relative">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-300" size={14} />
                        <input className="premium-input pl-11 h-12" type="number" step="0.01" value={settings.initiationFee} onChange={e => setSettings(s => ({...s, initiationFee: e.target.value}))} placeholder="e.g. 500" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Min Loan Threshold (MXN)</label>
                     <div className="relative">
                        <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input className="premium-input pl-11 h-12" type="number" step="0.01" value={settings.minLoanAmount} onChange={e => setSettings(s => ({...s, minLoanAmount: e.target.value}))} placeholder="e.g. 500" />
                     </div>
                  </div>
               </div>

               {message.text && (
                  <div className={`p-6 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-lg shadow-black/5 ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                  </div>
               )}

               <div className="pt-8 border-t border-slate-50 flex justify-end">
                  <Btn type="submit" loading={isSaving} className="px-12 h-16 !rounded-2xl shadow-xl shadow-primary/20">
                     Synchronize Global Policy
                  </Btn>
               </div>
            </form>
         </div>

         <div className="space-y-8">
            <div className="pro-card p-8 relative overflow-hidden group">
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <Cpu size={20} />
                     </div>
                     <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 italic">Core Status</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-900 mt-1 italic">Network Telemetry</p>
                     </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: 'Cloud Stability', value: 'Optimal', icon: Globe, color: 'text-emerald-500' },
                      { label: 'Node Latency', value: '0.4ms', icon: Zap, color: 'text-primary' },
                      { label: 'Vault Integrity', value: '100%', icon: Database, color: 'text-emerald-500' },
                      { label: 'Clock Sync', value: 'Stratum 1', icon: RefreshCw, color: 'text-primary' }
                    ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                         <div className="flex items-center gap-3">
                            <s.icon size={12} className="text-slate-300" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 italic">{s.label}</span>
                         </div>
                         <span className={`text-[10px] font-bold uppercase tracking-widest italic ${s.color}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-slate-50">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-1">Architecture Node</p>
                     <p className="text-base font-bold italic tracking-tight uppercase text-slate-900">v14.2.0-STABLE</p>
                  </div>
               </div>
            </div>

            <div className="pro-card p-8 text-center group">
               <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-300 mx-auto flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm rotate-12 group-hover:rotate-0">
                  <Trash2 size={24} />
               </div>
               <div className="mt-6 mb-8">
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight italic">Factory Override</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 leading-relaxed px-2 italic">Purge all institutional records and reset system to zero-state.</p>
               </div>
               <Btn onClick={handleWipe} className="w-full h-14 !bg-rose-600 hover:!bg-rose-700">
                  Purge Data Vault
               </Btn>
            </div>
         </div>
      </div>
    </div>
  );
}



