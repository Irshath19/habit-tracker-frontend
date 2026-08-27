import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg'
}) => {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className={`relative w-full ${maxWidth} bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto`}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between pb-4 border-b border-slate-800/80 mb-5">
                <div>
                  {title && <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>}
                  {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
