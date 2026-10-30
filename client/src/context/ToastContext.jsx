import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let borderClass = 'border-gold-500/30';
          let bgClass = 'bg-zinc-950/90 text-white';
          let icon = <Info className="w-5 h-5 text-gold-400 shrink-0" />;

          if (toast.type === 'success') {
            borderClass = 'border-emerald-500/40';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            borderClass = 'border-maroon-600/60';
            icon = <AlertCircle className="w-5 h-5 text-maroon-400 shrink-0" />;
          } else if (toast.type === 'warning') {
            borderClass = 'border-amber-500/50';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border ${borderClass} ${bgClass} backdrop-blur-xl shadow-2xl flex items-start space-x-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                {toast.title && <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-0.5">{toast.title}</h5>}
                <p className="text-sm text-slate-200 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
