import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
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

  // Sort
  let processed = [...(data || [])];

  if (sortKey) {
    processed.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  // Paginate
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

  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card py-16">
        <EmptyState message="No records found" />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead className="table-head">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`table-th ${col.sortable !== false ? "cursor-pointer select-none hover:text-slate-200" : ""}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
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
          <tbody className="divide-y divide-slate-700/30">
            {paginated.map((row) => (
              <tr key={row[rowKey]} className="table-row">
                {columns.map(col => (
                  <td key={col.key} className="table-td">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, processed.length)} of {processed.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-icon disabled:opacity-30"
            >
              <ChevronLeft size={16} />
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
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === p
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-icon disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
