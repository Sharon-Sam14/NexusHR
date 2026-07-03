// NexusHR: Immutable Audit Log Workspace — Admin Only
import { useState, useEffect, useCallback } from "react";
import {
  Shield, MagnifyingGlass, FunnelSimple, Download, ClockCountdown,
  ArrowCounterClockwise, User, CurrencyDollar, CalendarCheck, Warning, Gear,
  ArrowRight, UserCircle
} from "@phosphor-icons/react";
import { auditService } from "../../services/auditService";
import PageTransition from "../../layouts/PageTransition";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

// ── Category tabs ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "ALL",      label: "All Logs",  icon: Shield },
  { id: "PAYROLL",  label: "Payroll",   icon: CurrencyDollar },
  { id: "SALARY",   label: "Salary",    icon: CurrencyDollar },
  { id: "EMPLOYEE", label: "Employee",  icon: User },
  { id: "LEAVE",    label: "Leave",     icon: CalendarCheck },
  { id: "USER",     label: "User",      icon: UserCircle },
];

// ── Action badge colour map ───────────────────────────────────────────────────
const ACTION_STYLE = {
  PAYROLL_DRAFT_CREATED:   { bg: "bg-blue-500/10",    text: "text-blue-400",    label: "Draft Created" },
  PAYROLL_DRAFT_UPDATED:   { bg: "bg-blue-500/10",    text: "text-blue-400",    label: "Draft Updated" },
  PAYROLL_STATUS_UPDATE:   { bg: "bg-violet-500/10",  text: "text-violet-400",  label: "Status Updated" },
  SALARY_REVISION_APPROVED:{ bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Salary Approved" },
  SALARY_REVISION_REJECTED:{ bg: "bg-red-500/10",     text: "text-red-400",     label: "Salary Rejected" },
  EMPLOYEE_CREATED:        { bg: "bg-cyan-500/10",    text: "text-cyan-400",    label: "Employee Created" },
  EMPLOYEE_UPDATED:        { bg: "bg-cyan-500/10",    text: "text-cyan-400",    label: "Employee Updated" },
  EMPLOYEE_DELETED:        { bg: "bg-red-500/10",     text: "text-red-400",     label: "Employee Deleted" },
  LEAVE_APPROVED:          { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Leave Approved" },
  LEAVE_REJECTED:          { bg: "bg-amber-500/10",   text: "text-amber-400",   label: "Leave Rejected" },
  USER_LOCKED:             { bg: "bg-red-500/10",     text: "text-red-400",     label: "User Locked" },
  UNKNOWN:                 { bg: "bg-slate-500/10",   text: "text-slate-400",   label: "System Event" },
};

function getActionStyle(action) {
  return ACTION_STYLE[action] || {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    label: action?.replace(/_/g, " ") || "Unknown",
  };
}

function formatTimestamp(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCsv(logs) {
  const header = "Timestamp,Actor,Action,Target,Details";
  const rows = logs.map((l) =>
    [
      `"${l.timestamp || ""}"`,
      `"${l.actor || ""}"`,
      `"${l.action || ""}"`,
      `"${l.target || ""}"`,
      `"${(l.details || "").replace(/"/g, "'")}"`,
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ── Audit Log Row ─────────────────────────────────────────────────────────────
function AuditRow({ log, index }) {
  const style = getActionStyle(log.action);
  return (
    <div
      className="grid gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-xs font-body"
      style={{ gridTemplateColumns: "160px 1fr 160px 1fr 1fr" }}
    >
      {/* Timestamp */}
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
        <ClockCountdown size={12} className="flex-shrink-0 text-slate-400" />
        <span className="truncate">{formatTimestamp(log.timestamp)}</span>
      </div>

      {/* Actor */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/15 flex items-center justify-center flex-shrink-0">
          <User size={11} className="text-[var(--brand-primary)]" />
        </div>
        <span className="truncate text-slate-700 dark:text-slate-200 font-medium">{log.actor || "SYSTEM"}</span>
      </div>

      {/* Action Badge */}
      <div className="flex items-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono tracking-wide ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      </div>

      {/* Target */}
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 min-w-0">
        <ArrowRight size={11} className="flex-shrink-0 text-slate-400" />
        <span className="truncate">{log.target || "—"}</span>
      </div>

      {/* Details */}
      <div className="flex items-center text-slate-500 dark:text-slate-400 min-w-0">
        <span className="truncate italic text-[11px]">{log.details || "—"}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditService.getAll({
        search: debouncedSearch || undefined,
        action: category !== "ALL" ? category : undefined,
      });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1
                className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Audit Log
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">
              Immutable record of all sensitive actions across the platform. Admins only.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLogs()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-body"
            >
              <ArrowCounterClockwise size={14} />
              Refresh
            </button>
            <button
              onClick={() => exportCsv(logs)}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-body"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: logs.length, color: "text-[var(--brand-primary)]" },
            { label: "Payroll Events", value: logs.filter(l => l.action?.startsWith("PAYROLL")).length, color: "text-violet-500" },
            { label: "Salary Events", value: logs.filter(l => l.action?.startsWith("SALARY")).length, color: "text-emerald-500" },
            { label: "Employee Events", value: logs.filter(l => l.action?.startsWith("EMPLOYEE")).length, color: "text-cyan-500" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 text-left shadow-sm"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">{label}</span>
              <p className={`text-2xl font-normal font-mono mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 shadow-sm space-y-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor, action, target, details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 font-body"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            <div className="flex items-center gap-1 mr-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <FunnelSimple size={11} />
              Filter:
            </div>
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all font-body ${
                  category === id
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div
            className="grid gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/40"
            style={{ gridTemplateColumns: "160px 1fr 160px 1fr 1fr" }}
          >
            {["Timestamp", "Actor", "Action", "Target", "Details"].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                {h}
              </span>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="md" />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No audit events found"
              description={
                search || category !== "ALL"
                  ? "No records match your current filters. Try adjusting the search or category."
                  : "No events have been recorded yet. Actions will appear here as they occur."
              }
            />
          ) : (
            <div className="max-h-[520px] overflow-y-auto">
              {logs.map((log, i) => (
                <AuditRow key={log.id ?? i} log={log} index={i} />
              ))}
            </div>
          )}

          {/* Footer count */}
          {!loading && logs.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Showing <strong className="text-slate-600 dark:text-slate-300">{logs.length}</strong> event{logs.length !== 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1">
                <Shield size={10} />
                Immutable — records cannot be modified or deleted
              </span>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
