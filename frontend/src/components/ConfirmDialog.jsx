import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmLabel = "Delete", confirmClass = "btn-danger" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 modal-backdrop"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="relative w-full max-w-sm bg-[#020617] border border-slate-800 rounded-2xl p-6 shadow-2xl z-50"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400 mt-1">{message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button onClick={onCancel} className="btn-secondary">Cancel</button>
              <button onClick={onConfirm} className={confirmClass}>{confirmLabel}</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
