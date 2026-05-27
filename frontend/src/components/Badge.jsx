import { STATUS_COLORS } from "../utils/constants";

export default function Badge({ status, label }) {
  const colors = STATUS_COLORS[status] || {
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    border: "border-slate-500/30",
  };

  const displayLabel = label || status?.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
      {displayLabel}
    </span>
  );
}
