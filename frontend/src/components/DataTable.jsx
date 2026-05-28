import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns,
  data,
  loading = false,
  rowKey = "id",
  pageSize = 10,
  searchTerm = "",
  actions,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  // Sort logic
  let processed = [...(data || [])];

  if (sortKey) {
    processed.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  // Paginate logic
  const totalPages = Math.ceil(processed.length / pageSize);
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // Render Premium Skeleton Rows during loading states
  if (loading) {
    return (
      <div className="glass-card overflow-hidden border border-slate-800/60">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="table-th text-slate-500 uppercase tracking-widest text-[9px]">
                    {col.label}
                  </th>
                ))}
                {actions && <th className="table-th text-right text-slate-500 uppercase tracking-widest text-[9px]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="table-row border-t border-slate-900/50">
                  {columns.map((col, cIdx) => (
                    <td key={col.key} className="table-td py-5">
                      <div className={`h-3 rounded shimmer-bg ${
                        cIdx === 0 ? "w-32" : cIdx === 1 ? "w-44" : "w-20"
                      }`} />
                    </td>
                  ))}
                  {actions && (
                    <td className="table-td py-5 text-right">
                      <div className="h-3 w-14 rounded shimmer-bg ml-auto" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card py-16 border border-slate-800/60">
        <EmptyState message="No records found" />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border border-slate-800/60">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead className="table-head">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`table-th select-none ${col.sortable !== false ? "cursor-pointer hover:text-white transition-colors" : ""}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === "asc"
                        ? <ChevronUp size={12} className="text-cyan-400" />
                        : <ChevronDown size={12} className="text-cyan-400" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="table-th text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {paginated.map((row) => (
              <tr key={row[rowKey]} className="table-row">
                {columns.map(col => (
                  <td key={col.key} className="table-td text-xs font-medium py-3.5">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td className="table-td py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800/50 bg-slate-950/20">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, processed.length)} of {processed.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-icon disabled:opacity-30 p-1.5 rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-900"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (page > 3) p = page - 2 + i;
                p = Math.min(p, totalPages - 4 + i);
                p = Math.max(p, 1);
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${page === p
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-icon disabled:opacity-30 p-1.5 rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-900"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
