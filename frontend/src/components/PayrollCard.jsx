import { motion } from "framer-motion";
import { IndianRupee, User, Calendar, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { formatCurrency, getMonthName } from "../utils/formatters";

const statusConfig = {
  PAID: {
    label: "Paid",
    icon: CheckCircle,
    textColor: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    textColor: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  PROCESSING: {
    label: "Processing",
    icon: Clock,
    textColor: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    textColor: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
};

export default function PayrollCard({ payroll, index = 0, onDownload }) {
  if (!payroll) return null;

  const config = statusConfig[payroll.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  const rows = [
    { label: "Basic Salary", value: formatCurrency(payroll.basicSalary), color: "text-white" },
    { label: "Bonus", value: `+ ${formatCurrency(payroll.bonus)}`, color: "text-emerald-400" },
    { label: "Deductions", value: `- ${formatCurrency(payroll.deductions)}`, color: "text-red-400" },
    { label: "Tax", value: `- ${formatCurrency(payroll.tax)}`, color: "text-orange-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-5 border border-slate-800/80 space-y-4 group hover:border-slate-700/60 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <IndianRupee size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              {getMonthName(payroll.month)} {payroll.year}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <User size={10} className="text-slate-500" />
              <p className="text-[11px] text-slate-400">
                {payroll.employeeName || "Employee"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.textColor}`}>
          <StatusIcon size={10} />
          {config.label}
        </span>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 py-3 border-t border-b border-slate-800/60">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{row.label}</span>
            <span className={`font-semibold tabular-nums ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Net Pay */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Net Pay</p>
          <p className="text-xl font-extrabold text-emerald-400 tabular-nums tracking-tight">
            {formatCurrency(payroll.netSalary)}
          </p>
        </div>

        {/* Meta info */}
        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
            <Calendar size={10} />
            <span>{payroll.workingDays} working days</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
            <CheckCircle size={10} />
            <span>{payroll.daysPresent} days present</span>
          </div>
          {onDownload && (
            <button
              onClick={() => onDownload(payroll)}
              className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              <Download size={11} />
              Download Payslip
            </button>
          )}
        </div>
      </div>

      {/* Remarks */}
      {payroll.remarks && (
        <p className="text-[10px] text-slate-600 pt-2 border-t border-slate-800/60 italic">
          {payroll.remarks}
        </p>
      )}
    </motion.div>
  );
}
