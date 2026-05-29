import { Users, Mail, Phone, Briefcase, Calendar } from "lucide-react";
import Badge from "./Badge";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import { formatCurrency } from "../utils/formatters";

export default function EmployeeTable({ employees = [], loading = false, actions, onRowClick }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!employees.length) {
    return (
      <EmptyState
        message="No Employees Found"
        description="No employees match your current search or filter criteria."
        icon={Users}
      />
    );
  }

  return (
    <div className="table-container">
      <table className="table-base">
        <thead className="table-head">
          <tr>
            <th className="table-th">Employee</th>
            <th className="table-th">Contact</th>
            <th className="table-th">Department</th>
            <th className="table-th">Joining Date</th>
            <th className="table-th">Salary</th>
            <th className="table-th">Status</th>
            {actions && <th className="table-th text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className={`table-row ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(emp)}
            >
              {/* Employee name + designation */}
              <td className="table-td">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs flex-shrink-0">
                    {emp.employeeName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs">{emp.employeeName || "—"}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Briefcase size={10} />
                      {emp.designation || "—"}
                    </p>
                  </div>
                </div>
              </td>

              {/* Contact */}
              <td className="table-td">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <Mail size={11} className="text-slate-500 flex-shrink-0" />
                    <span className="truncate max-w-[160px]">{emp.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Phone size={11} className="text-slate-500 flex-shrink-0" />
                    <span>{emp.phone || "—"}</span>
                  </div>
                </div>
              </td>

              {/* Department */}
              <td className="table-td">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  {emp.department || "—"}
                </span>
              </td>

              {/* Joining Date */}
              <td className="table-td">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Calendar size={12} className="text-slate-500" />
                  {emp.joiningDate
                    ? new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </td>

              {/* Salary */}
              <td className="table-td">
                <span className="font-semibold text-emerald-400 text-xs tabular-nums">
                  {typeof emp.salary === "number" ? formatCurrency(emp.salary) : "—"}
                </span>
              </td>

              {/* Status */}
              <td className="table-td">
                <Badge status={emp.status} label={emp.status} />
              </td>

              {/* Actions column */}
              {actions && (
                <td className="table-td text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {actions(emp)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
