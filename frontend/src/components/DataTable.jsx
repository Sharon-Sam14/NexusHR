import { useState } from "react";
import { CaretUp, CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns,
  data,
  loading = false,
  rowKey = "id",
  pageSize = 10,
  actions,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  let processed = [...(data || [])];
  if (sortKey) {
    processed.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  const totalPages = Math.ceil(processed.length / pageSize);
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const tableWrapper = {
    overflow: "hidden",
    borderRadius: "16px",
    border: "1px solid var(--border-card)",
    boxShadow: "var(--shadow-card)",
    background: "var(--bg-card)",
  };

  const theadStyle = {
    background: "var(--bg-card-alt)",
    borderBottom: "1px solid var(--border-divider)",
  };

  const isMonoCol = (key) =>
    ["id","date","salary","amount","payout","days","hours","percent","rating","period","time","score","phone","code","number"].some((k) =>
      key.toLowerCase().includes(k)
    );

  if (loading) {
    return (
      <div style={tableWrapper}>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead style={theadStyle}>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="table-th">
                    {col.label}
                  </th>
                ))}
                {actions && <th className="table-th text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: "1px solid var(--border-divider)" }}>
                  {columns.map((col, cIdx) => (
                    <td key={col.key} className="table-td">
                      <div
                        className={`h-3 rounded-full shimmer-bg ${
                          cIdx === 0 ? "w-32" : cIdx === 1 ? "w-44" : "w-20"
                        }`}
                      />
                    </td>
                  ))}
                  {actions && (
                    <td className="table-td text-right">
                      <div className="h-3 w-14 rounded-full shimmer-bg ml-auto" />
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
      <div style={{ ...tableWrapper, padding: "4rem 0" }}>
        <EmptyState message="No records found" />
      </div>
    );
  }

  return (
    <div style={tableWrapper}>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead style={theadStyle} className="table-head">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`table-th select-none ${
                    col.sortable !== false ? "cursor-pointer" : ""
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === "asc"
                        ? <CaretUp size={12} weight="bold" style={{ color: "var(--brand-blue)" }} />
                        : <CaretDown size={12} weight="bold" style={{ color: "var(--brand-blue)" }} />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="table-th text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr
                key={row[rowKey]}
                className="table-row group"
                style={{ borderBottom: "1px solid var(--border-divider)" }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="table-td"
                    style={{
                      fontFamily: isMonoCol(col.key) ? "var(--font-mono)" : "var(--font-ui)",
                      color: isMonoCol(col.key) ? "var(--text-muted)" : "var(--text-secondary)",
                      fontSize: "13px",
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--border-divider)", background: "var(--bg-card-alt)" }}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
          >
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, processed.length)} of {processed.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all disabled:opacity-30"
              style={{ border: "1px solid var(--border-card)", background: "var(--bg-card)" }}
            >
              <CaretLeft size={13} style={{ color: "var(--text-secondary)" }} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5 && page > 3) p = page - 2 + i;
              p = Math.min(Math.max(p, 1), totalPages);
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-[8px] text-[12px] font-semibold transition-all"
                  style={{
                    background: page === p ? "var(--brand-blue)" : "transparent",
                    color: page === p ? "#fff" : "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all disabled:opacity-30"
              style={{ border: "1px solid var(--border-card)", background: "var(--bg-card)" }}
            >
              <CaretRight size={13} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
