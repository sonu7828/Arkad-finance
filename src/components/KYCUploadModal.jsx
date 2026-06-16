import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, CheckCircle2, FileText, AlertCircle, File } from 'lucide-react';
import { Modal, Btn, FormField, Select } from './UI';

export default function KYCUploadModal({ isOpen, onClose, onSubmit }) {
  const [docType, setDocType] = useState('National ID');
  const [files, setFiles] = useState({
    idFront: null,
    idBack: null,
    selfie: null,
    addressProofs: []
  });
  
  const [activeCameraFor, setActiveCameraFor] = useState(null); // 'idFront' | 'idBack' | 'selfie'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (files.idFront?.preview) URL.revokeObjectURL(files.idFront.preview);
      if (files.idBack?.preview) URL.revokeObjectURL(files.idBack.preview);
      if (files.selfie?.preview) URL.revokeObjectURL(files.selfie.preview);
      files.addressProofs.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      stopCamera();
    };
  }, []);

  const startCamera = async (field) => {
    setActiveCameraFor(field);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: field === 'selfie' ? 'user' : 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or unavailable. Please use file upload instead.");
      setActiveCameraFor(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setActiveCameraFor(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          file.preview = dataUrl; // Use dataUrl for immediate preview
          setFiles(prev => ({ ...prev, [activeCameraFor]: file }));
          stopCamera();
        });
    }
  };

  const validateFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} exceeds 5MB limit.`);
      return false;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert(`File format ${file.type} not supported. Use JPG, PNG, WEBP, or PDF.`);
      return false;
    }
    return true;
  };

  const handleFileUpload = (field, e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    if (field === 'addressProofs') {
      const newFiles = Array.from(fileList);
      if (files.addressProofs.length + newFiles.length > 2) {
        alert("Maximum 2 documents allowed for Proof of Address.");
        return;
      }
      const validFiles = newFiles.filter(validateFile);
      validFiles.forEach(f => {
        if (f.type.startsWith('image/')) {
          f.preview = URL.createObjectURL(f);
        }
      });
      setFiles(prev => ({ ...prev, addressProofs: [...prev.addressProofs, ...validFiles] }));
    } else {
      const file = fileList[0];
      if (validateFile(file)) {
        if (file.type.startsWith('image/')) {
          file.preview = URL.createObjectURL(file);
        }
        setFiles(prev => ({ ...prev, [field]: file }));
      }
    }
  };

  const removeFile = (field, index = null) => {
    if (field === 'addressProofs' && index !== null) {
      setFiles(prev => {
        const newProofs = [...prev.addressProofs];
        if (newProofs[index].preview) URL.revokeObjectURL(newProofs[index].preview);
        newProofs.splice(index, 1);
        return { ...prev, addressProofs: newProofs };
      });
    } else {
      if (files[field]?.preview) URL.revokeObjectURL(files[field].preview);
      setFiles(prev => ({ ...prev, [field]: null }));
    }
  };

  const calculateProgress = () => {
    let score = 0;
    if (files.idFront) score += 25;
    if (files.idBack) score += 25;
    if (files.addressProofs.length > 0) score += 25;
    if (files.selfie) score += 25;
    return score;
  };

  const progress = calculateProgress();

  const renderUploadBox = (field, label, isOptional = false) => {
    const file = files[field];

    if (file) {
      return (
        <div className="relative w-full h-32 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center overflow-hidden group">
          {file.preview ? (
            <img src={file.preview} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-emerald-600">
              <FileText size={24} className="mb-2" />
              <span className="text-[10px] font-bold text-center px-4 truncate w-full">{file.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button onClick={() => removeFile(field)} className="bg-white/20 hover:bg-rose-500 text-white rounded-full p-2 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
            <CheckCircle2 size={12} />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 transition-colors hover:border-primary hover:bg-primary/5 group">
        <div className="flex gap-4">
          <button onClick={() => startCamera(field)} className="flex flex-col items-center hover:text-primary transition-colors p-2">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-1 group-hover:shadow-md">
              <Camera size={18} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Camera</span>
          </button>
          <label className="flex flex-col items-center hover:text-primary transition-colors p-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-1 group-hover:shadow-md">
              <Upload size={18} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Upload</span>
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(field, e)} />
          </label>
        </div>
      </div>
    );
  };

  if (activeCameraFor) {
    return (
      <Modal isOpen={isOpen} onClose={stopCamera} title="Camera Capture" size="md">
        <div className="space-y-4">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="w-full h-full border-[4px] border-white/20 flex items-center justify-center">
                  {activeCameraFor === 'selfie' ? (
                     <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-full" />
                  ) : (
                     <div className="w-3/4 h-3/4 border-2 border-dashed border-white/50 rounded-xl" />
                  )}
               </div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Btn variant="outline" onClick={stopCamera}>Cancel</Btn>
            <Btn onClick={capturePhoto} className="!px-12">
              <Camera size={18} className="mr-2" /> Capture Photo
            </Btn>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="KYC Verification Wizard" size="lg">
      <div className="space-y-8 pb-4">
        
        {/* Progress Bar */}
        <div className="space-y-2">
           <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Verification Progress</span>
              <span className="text-primary">{progress}%</span>
           </div>
           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                 className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                 style={{ width: `${progress}%` }}
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
               <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</span>
               Identity Document
            </div>
            
            <FormField label="Document Type">
              <Select value={docType} onChange={e => setDocType(e.target.value)}>
                <option value="National ID">National ID Card</option>
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver's License</option>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
               <FormField label="Front Side">
                 {renderUploadBox('idFront', 'ID Front')}
               </FormField>
               <FormField label="Back Side">
                 {renderUploadBox('idBack', 'ID Back')}
               </FormField>
            </div>
          </div>

          {/* Additional Docs Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
               <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center text-[10px]">2</span>
               Additional Proofs
            </div>

            <FormField label="Selfie Verification">
              {renderUploadBox('selfie', 'Selfie Photo')}
            </FormField>

            <FormField label={`Proof of Address (${files.addressProofs.length}/2)`}>
              <div className="space-y-2">
                {files.addressProofs.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl group">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <FileText size={16} className="text-emerald-500 shrink-0" />
                       <span className="text-[11px] font-bold text-emerald-900 truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile('addressProofs', idx)} className="text-emerald-400 hover:text-rose-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                {files.addressProofs.length < 2 && (
                  <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-colors cursor-pointer bg-slate-50 hover:bg-primary/5">
                    <Upload size={14} className="mr-2" /> Upload Address Proof
                    <input type="file" className="hidden" multiple accept=".pdf,image/*" onChange={(e) => handleFileUpload('addressProofs', e)} />
                  </label>
                )}
                <p className="text-[9px] text-slate-400 font-medium">Utility bill, bank statement, or rental agreement. Max 5MB per file.</p>
              </div>
            </FormField>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
           <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle size={14} />
              <span className="text-[10px] font-medium">Ensure all documents are clear and readable.</span>
           </div>
           <div className="flex gap-3">
              <Btn variant="outline" onClick={onClose}>Cancel</Btn>
              <Btn 
                onClick={() => onSubmit({ docType, files })} 
                disabled={progress < 100}
                className={progress === 100 ? '!bg-emerald-500 hover:!bg-emerald-600 shadow-emerald-500/20' : ''}
              >
                {progress === 100 ? 'Submit Documents' : 'Complete All Steps'}
              </Btn>
           </div>
        </div>
      </div>
    </Modal>
  );
}
