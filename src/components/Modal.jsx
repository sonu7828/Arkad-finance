import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-[420px]',
    md: 'max-w-[600px]',
    lg: 'max-w-[800px]',
    xl: 'max-w-[1100px]',
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Solid Pure Black Overlay - Covering EVERYTHING on Mobile too */}
      <div 
        className="fixed inset-0 bg-[#000000] z-[100000000] opacity-100" 
        onClick={onClose} 
      />

      {/* Premium Sticky Centered Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`bg-white rounded-[2.5rem] shadow-none relative w-full ${sizes[size]} z-[100000001] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 sm:px-10 py-4 sm:py-5 border-b border-slate-50 shrink-0">
            <h3 className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest italic">{title}</h3>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-6 sm:p-10 overflow-hidden">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
