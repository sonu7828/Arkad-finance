import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Briefcase, ShieldCheck, Clock3, TrendingUp, 
  UserPlus, ChevronRight
} from 'lucide-react';
import { PageTitle, Btn } from '../../components/UI';

export default function AdminUsers() {
  const navigate = useNavigate();

  const userTypes = [
    { label: 'Staff Corps', detail: 'Internal loan officers and system executives.', path: '/admin/staff', icon: UserCheck, tag: 'Internal Team' },
    { label: 'Borrowers', detail: 'Registered entities and individual clients.', path: '/admin/borrowers', icon: Users, tag: 'Primary Clients' },
    { label: 'Field Agents', detail: 'External referral partners and field associates.', path: '/admin/agents', icon: Briefcase, tag: 'External Partners' },
    { label: 'Architects', detail: 'System owners and root administrators.', path: '/admin/admins', icon: ShieldCheck, tag: 'System Control' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageTitle 
        title="Institutional Directory" 
        subtitle="Manage and provision access across your entire organizational infrastructure" 
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {userTypes.map((type, i) => (
          <div 
            key={i}
            onClick={() => navigate(type.path)}
            className="pro-card p-10 group cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[400px]"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all mb-8">
                <type.icon size={24} />
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 italic">{type.tag}</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">{type.label}</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mt-4 italic opacity-80">{type.detail}</p>
            </div>

            <div className="relative z-10 p-5 rounded-2xl bg-slate-50 border border-slate-50 group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-lg transition-all flex items-center justify-between">
               <div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Status</p>
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Live Registry</h4>
               </div>
               <div className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
               </div>
            </div>
          </div>
        ))}
      </section>

      <section className="pro-card p-12 relative overflow-hidden min-h-[350px] flex items-center group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
            <div className="max-w-xl text-center lg:text-left space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Scale Operations</span>
               </div>
               <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Expand Institutional Reach</h2>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">Comprehensive protocols to provision and supervise your growing network of borrowers and support staff.</p>
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
               <Btn 
                 onClick={() => navigate('/admin/borrowers?status=pending')} 
                 variant="outline"
                 size="lg"
                 className="px-10 h-16"
               >
                  <Clock3 size={18} className="mr-3" /> 
                  Awaiting Review
               </Btn>
               <div className="flex flex-col gap-4">
                  <Btn 
                    onClick={() => navigate('/admin/borrowers')} 
                    size="lg"
                    className="px-10 h-16 shadow-lg shadow-primary/20"
                  >
                     <UserPlus size={18} className="mr-3" /> 
                     Provision Entity
                  </Btn>
                  <button 
                    onClick={() => navigate('/admin/staff')}
                    className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-primary transition-all bg-transparent border-none cursor-pointer italic"
                  >
                    View All Staff <ChevronRight size={14} />
                  </button>
               </div>
            </div>
         </div>
      </section>
   </div>
  );
}
