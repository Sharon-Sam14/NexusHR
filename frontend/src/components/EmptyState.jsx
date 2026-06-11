import React from "react";
import { motion } from "framer-motion";
import { Tray } from "@phosphor-icons/react";

export default function EmptyState({ message = "No data found", description, action, icon: Icon = Tray }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-10 text-center px-4"
    >
      <div className="w-12 h-12 rounded-[4px] bg-[var(--surface-input)] border border-[var(--border-default)] flex items-center justify-center mb-4">
        <Icon size={20} weight="duotone" className="text-[var(--brand-primary)]" />
      </div>
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{message}</p>
      {description && (
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </motion.div>
  );
}
