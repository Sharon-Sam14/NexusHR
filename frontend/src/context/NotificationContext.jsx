import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, WarningCircle, Info, X } from "@phosphor-icons/react";

const NotificationContext = createContext(null);

let toastId = 0;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (msg) => addToast(msg, "success");
  const error = (msg) => addToast(msg, "error");
  const warning = (msg) => addToast(msg, "warning");
  const info = (msg) => addToast(msg, "info");

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error:   <XCircle size={18} className="text-red-500" />,
    warning: <WarningCircle size={18} className="text-amber-500" />,
    info:    <Info size={18} className="text-[var(--brand-primary)]" />,
  };

  const colors = {
    success: "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.02] text-slate-800 dark:text-slate-200",
    error:   "border-red-500/20 bg-red-500/5 dark:bg-red-500/[0.02] text-slate-800 dark:text-slate-200",
    warning: "border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/[0.02] text-slate-800 dark:text-slate-200",
    info:    "border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5 dark:bg-[var(--brand-primary)]/[0.02] text-slate-800 dark:text-slate-200",
  };

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none font-body">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded border shadow-md bg-[var(--surface-card)] ${colors[toast.type]}`}
            >
              <span className="mt-0.5 flex-shrink-0">{icons[toast.type]}</span>
              <p className="text-xs flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}
