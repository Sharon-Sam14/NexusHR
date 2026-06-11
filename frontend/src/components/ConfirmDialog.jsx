import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WarningCircle } from "@phosphor-icons/react";
import Button from "./ui/Button";

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmLabel = "Delete", confirmVariant = "danger", confirmClass }) {
  // Translate legacy confirmClass to variant if passed
  const resolvedVariant = confirmVariant || (confirmClass?.includes("danger") ? "danger" : "primary");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[8px] p-5 shadow-[var(--shadow-modal)] z-[60]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-[4px] bg-[var(--brand-danger)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--brand-danger)]/15">
                <WarningCircle size={20} weight="fill" className="text-[var(--brand-danger)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <Button onClick={onCancel} variant="secondary">Cancel</Button>
              <Button onClick={onConfirm} variant={resolvedVariant}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
