import React, { useState, useRef } from 'react';
import { 
  Camera, FileText, CheckCircle2, Upload, ArrowUpRight, Loader2, Clock, 
  ShieldCheck, Zap, Package, FileUp, Files
} from 'lucide-react';
import { PageTitle, StatCard, Btn, EmptyState, StatusBadge } from '../../components/UI';

const DUMMY_UPLOADS = [
  { id: 1, name: 'National_ID_NRC.pdf', type: 'PDF', verified: true, imageUrl: null, createdAt: '2024-09-10T00:00:00Z' },
  { id: 2, name: 'Bank_Statement_Sept2024.pdf', type: 'PDF', verified: false, imageUrl: null, createdAt: '2024-10-01T00:00:00Z' },
  { id: 3, name: 'Employment_Letter.jpg', type: 'IMAGE', verified: true, imageUrl: null, createdAt: '2024-09-25T00:00:00Z' },
];

export default function BorrowerCollateral() {
  const [uploads, setUploads] = useState(DUMMY_UPLOADS);
  const [uploading, setUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploads(prev => [...prev, {
        id: Date.now(),
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
        verified: false,
        imageUrl: null,
        createdAt: new Date().toISOString(),
      }]);
      setUploading(false);
    }, 1200);
    e.target.value = '';
  };

  const visibleUploads = uploads.filter((doc) =>
    statusFilter === 'ALL' ? true : statusFilter === 'VERIFIED' ? doc.verified : !doc.verified
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

      <PageTitle 
        title="Documents & Assets" 
        subtitle="Securely upload and manage your collateral documents and identification for loan verification."
        action={
          <Btn
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shadow-lg"
          >
            {uploading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
            {uploading ? 'Processing...' : 'Upload Document'}
          </Btn>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Documents" value={uploads.length} icon={Files} color="text-slate-900" />
        <StatCard label="Verified Assets" value={uploads.filter((u) => u.verified).length} icon={ShieldCheck} color="text-emerald-500" />
        <StatCard label="Pending Review" value={uploads.filter((u) => !u.verified).length} icon={Clock} color="text-amber-500" />
      </section>

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`pro-card p-16 flex flex-col items-center justify-center gap-8 border-2 border-dashed transition-all cursor-pointer relative overflow-hidden group ${uploading ? 'border-primary/50 bg-primary/5 cursor-wait' : 'border-slate-100 hover:border-primary/40 hover:bg-slate-50/50 hover:shadow-xl'} rounded-3xl bg-white`}
      >
        <div className={`w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm transition-all duration-700 ${uploading ? 'animate-pulse' : 'group-hover:rotate-6 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'} text-slate-300`}>
          {uploading ? <Loader2 size={36} className="animate-spin text-primary" /> : <FileUp size={36} />}
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-slate-800 uppercase tracking-tight">{uploading ? 'Processing Document...' : 'Upload New Document'}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Supports PDF, PNG, and JPEG formats</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
           <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Document History</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Detailed list of your uploaded collateral</p>
           </div>
           
           <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm gap-1">
            {[
              { key: 'ALL', label: 'All Documents', icon: Files },
              { key: 'VERIFIED', label: 'Verified', icon: ShieldCheck },
              { key: 'PENDING', label: 'Pending', icon: Clock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${statusFilter === key ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {visibleUploads.length > 0 ? (
            visibleUploads.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between group hover:border-primary/20 hover:shadow-md transition-all gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-6 transition-all ${doc.verified ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                    <FileText size={22} />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{doc.name}</h5>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{doc.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={doc.verified ? 'VERIFIED' : 'PENDING'} />
                  <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState 
              icon={Package}
              title="No Documents Found"
              description="Your document history is currently empty. Please upload your collateral to proceed."
              action={<Btn onClick={() => fileInputRef.current?.click()} className="h-12">Upload First Document</Btn>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
