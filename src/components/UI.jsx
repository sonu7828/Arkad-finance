import React from 'react';
import { AlertCircle, ChevronRight, Loader2, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** ── Status Badge ── */
export function StatusBadge({ status, onClick }) {
  const specificMappings = {
    'approved': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' },
    'verified': { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' },
    'pending': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' },
    'rejected': { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' },
    'paid': { bg: '#eff6ff', text: '#3b82f6', border: '#dbeafe' },
    'late': { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' },
    'active': { bg: '#ecfdf5', text: '#10b981', border: '#d1fae5' },
    'identified': { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
    'terms_set': { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  };

  const s = specificMappings[status?.toLowerCase()] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
  const label = status?.toLowerCase() === 'terms_set' ? 'Pending Client Approval' : status;

  return (
    <motion.button
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.text }} />
      {label}
    </motion.button>
  );
}

/** ── Stat Card ── */
export function StatCard({ label, value, color = '#1e293b', icon: Icon, trend, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -8, scale: 1.02, backgroundColor: '#f8fafc' } : { y: -8, scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`pro-card p-6 group flex flex-col justify-between transition-all duration-300 ${onClick ? 'cursor-pointer border-transparent hover:border-primary/20 shadow-lg hover:shadow-2xl hover:shadow-primary/5' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-500 border border-slate-100 group-hover:border-primary/20 group-hover:rotate-6">
          {Icon ? <Icon size={20} /> : <Activity size={20} />}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-900 leading-none group-hover:text-primary transition-colors italic">{value}</p>
      </div>
    </motion.div>
  );
}

/** ── Buttons ── */
export function Btn({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled = false, ...props }) {
  const base = 'inline-flex items-center gap-2.5 justify-center font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 select-none cursor-pointer';

  const sizes = {
    sm: 'px-5 py-2.5 text-[9px] rounded-xl',
    md: 'px-7 py-3.5 text-[10px] rounded-2xl',
    lg: 'px-12 py-5 text-[11px] rounded-2xl'
  };

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:shadow-xl',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100 hover:shadow-lg hover:shadow-rose-100',
    success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100',
    ghost: 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    outline: 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary hover:shadow-xl hover:shadow-slate-200/50'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, y: 0 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </motion.button>
  );
}

/** ── Table System ── */
export function ProTable({ headers, columns, data, children, loading, onRowClick }) {
  const hasRows = (data && data.length > 0) || children;
  const finalHeaders = (headers || columns?.map(c => ({
    label: c.header,
    className: c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
  })) || []).map(h => typeof h === 'string' ? { label: h } : h);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pro-card overflow-hidden !rounded-xl"
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="saas-table">
          <thead>
            <tr>
              {finalHeaders.map((h, i) => (
                <th key={i} className={h.className || ''}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.tr
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={finalHeaders.length || 1} className="py-20 text-center"><Loader /></td>
                </motion.tr>
              ) : !hasRows ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={finalHeaders.length || 1} className="py-20 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                    No records found in database
                  </td>
                </motion.tr>
              ) : data && columns ? (
                data.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    onClick={() => onRowClick?.(row)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-slate-50/80 transition-colors`}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                      >
                        {col.render ? col.render(row) : (
                          <span className="text-sm font-medium text-slate-700">{row[col.key]}</span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                children
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

import { createPortal } from 'react-dom';

/** ── Modal ── */
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { 
    sm: 'max-w-[420px]', 
    md: 'max-w-[600px]', 
    lg: 'max-w-[800px]', 
    xl: 'max-w-[1100px]' 
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000000] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto py-8 sm:py-12">
      {/* Solid Pure Black Overlay */}
      <div 
        className="fixed inset-0 bg-[#000000] z-[100000001]" 
        onClick={onClose} 
      />
      
      {/* Premium Centered Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`bg-white rounded-[2rem] sm:rounded-[2.5rem] relative w-full ${sizes[size]} z-[100000002] flex flex-col max-h-[90vh] shadow-2xl my-auto shadow-black/20`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with persistent Close Button */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-slate-50 bg-white shrink-0">
          <h3 className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest italic truncate pr-4">
            {title || 'Information Overview'}
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar-minimal">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

/** ── Loader & Empty State ── */
export function Loader({ full = false }) {
  return (
    <div className={`flex items-center justify-center p-20 ${full ? 'h-screen w-full fixed inset-0 bg-white/80 backdrop-blur-md z-[100]' : ''}`}>
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Processing Data...</p>
      </div>
    </div>
  );
}

/** ── Page Layout Helpers ── */
export function PageTitle({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="w-full md:w-auto">{action}</div>}
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pro-card flex flex-col items-center justify-center text-center p-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
        {Icon ? <Icon size={32} /> : <AlertCircle size={32} />}
      </div>
      <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-8">{description}</p>}
      {action}
    </motion.div>
  );
}

export function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      {children}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-rose-500 ml-1 mt-1 overflow-hidden"
          >
            <AlertCircle size={12} />
            <p className="text-[11px] font-bold tracking-tight">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`premium-input focus:ring-4 focus:ring-primary/5 transition-all duration-300 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <div className="relative group">
      <select
        className={`premium-input appearance-none pr-10 focus:ring-4 focus:ring-primary/5 transition-all duration-300 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-primary group-hover:text-slate-400 transition-colors">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </div>
  );
}

export function Divider({ text, className = '' }) {
  return (
    <div className={`relative flex items-center py-8 ${className}`}>
      <div className="flex-grow border-t border-slate-100"></div>
      {text && <span className="flex-shrink mx-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest">{text}</span>}
      <div className="flex-grow border-t border-slate-100"></div>
    </div>
  );
}
