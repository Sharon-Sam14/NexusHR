import { motion } from "framer-motion";
import { CurrencyInr, User, Calendar, CheckCircle, Clock, XCircle, DownloadSimple } from "@phosphor-icons/react";
import { formatCurrency, getMonthName } from "../utils/formatters";
import Card from "./ui/Card";

const statusConfig = {
  PAID: {
    label: "Paid",
    icon: CheckCircle,
    textColor: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/15",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    textColor: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/15",
  },
  PROCESSING: {
    label: "Processing",
    icon: Clock,
    textColor: "text-[var(--brand-primary)]",
    bg: "bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/15",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    textColor: "text-red-500",
    bg: "bg-red-500/10 border-red-500/15",
  },
};

export default function PayrollCard({ payroll, index = 0, onDownload }) {
  if (!payroll) return null;

  const config = statusConfig[payroll.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  const rows = [
    { label: "Basic Salary", value: formatCurrency(payroll.basicSalary), color: "text-slate-805 dark:text-slate-100" },
    { label: "Bonus", value: `+ ${formatCurrency(payroll.bonus)}`, color: "text-emerald-500" },
    { label: "Deductions", value: `- ${formatCurrency(payroll.deductions)}`, color: "text-red-500" },
    { label: "Tax", value: `- ${formatCurrency(payroll.tax)}`, color: "text-amber-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="font-body text-xs"
    >
      <Card className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-550">
              <CurrencyInr size={16} />
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                {getMonthName(payroll.month)} {payroll.year}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 font-body text-[10px]">
                <User size={10} />
                <p>
                  {payroll.employeeName || "Employee"}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] border text-[9px] font-semibold uppercase tracking-wider font-body ${config.bg} ${config.textColor}`}>
            <StatusIcon size={10} />
            {config.label}
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 py-3 border-t border-b border-slate-100 dark:border-slate-850 font-body text-[11px]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-slate-500 font-body text-xs">{row.label}</span>
              <span className={`font-semibold ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Net Pay */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold font-body mb-0.5">Net Pay</p>
            <p className="text-lg font-normal text-emerald-500 tracking-tight font-display">
              {formatCurrency(payroll.netSalary)}
            </p>
          </div>

          {/* Meta info */}
          <div className="text-right space-y-1 font-body text-[10px] text-slate-500">
            <div className="flex items-center justify-end gap-1.5">
              <Calendar size={10} />
              <span>{payroll.workingDays} working days</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <CheckCircle size={10} />
              <span>{payroll.daysPresent} days present</span>
            </div>
            {onDownload && (
              <button
                onClick={() => onDownload(payroll)}
                className="mt-2 flex items-center justify-end gap-1 text-[10px] text-[var(--brand-primary)] hover:underline font-semibold font-body transition-colors"
              >
                <DownloadSimple size={11} />
                <span>Download Payslip</span>
              </button>
            )}
          </div>
        </div>

        {/* Remarks */}
        {payroll.remarks && (
          <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-850 italic">
            {payroll.remarks}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
