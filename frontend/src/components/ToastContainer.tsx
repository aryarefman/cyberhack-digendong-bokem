'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, type ToastType } from '@/lib/toast';

function getToastStyles(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 border-green-200',
        icon: <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />,
        text: 'text-green-800',
      };
    case 'error':
      return {
        bg: 'bg-red-50 border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
        text: 'text-red-800',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 border-yellow-200',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />,
        text: 'text-yellow-800',
      };
    case 'info':
    default:
      return {
        bg: 'bg-blue-50 border-blue-200',
        icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
        text: 'text-blue-800',
      };
  }
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full ${styles.bg}`}
            >
              {styles.icon}
              <p className={`text-sm font-medium flex-1 ${styles.text}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
