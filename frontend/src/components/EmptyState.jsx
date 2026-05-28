import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export default function EmptyState({ message = "No data found", description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-14 text-center px-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-inner relative group">
        <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-sm group-hover:blur-md transition-all" />
        <Inbox size={20} className="text-slate-500 group-hover:text-cyan-400/80 transition-colors z-10" />
      </div>
      <p className="text-xs font-bold text-slate-350 uppercase tracking-wider">{message}</p>
      {description && (
        <p className="text-xs text-slate-550 mt-1.5 max-w-xs leading-relaxed font-medium">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
