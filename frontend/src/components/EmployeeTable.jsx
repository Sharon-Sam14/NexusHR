import { UsersThree, EnvelopeSimple, Phone, Briefcase, Calendar } from "@phosphor-icons/react";
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
        icon={UsersThree}
      />
    );
  }

  return (
    <div className="table-container font-body">
      <table className="table-base">
        <thead className="table-head">
          <tr className="font-body uppercase text-[10px] tracking-wider text-slate-500">
            <th className="table-th">Employee</th>
            <th className="table-th">Contact</th>
            <th className="table-th">Department</th>
            <th className="table-th">Joining Date</th>
            <th className="table-th">Salary</th>
            <th className="table-th">Status</th>
            {actions && <th className="table-th text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="text-xs text-slate-655 dark:text-slate-350">
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className={`table-row ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(emp)}
            >
              {/* Employee name + designation */}
              <td className="table-td">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-slate-100 dark:bg-slate-805 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-body font-bold text-slate-800 dark:text-slate-200 text-xs flex-shrink-0">
                    {emp.employeeName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-205 text-xs">{emp.employeeName || "—"}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-body uppercase tracking-wider">
                      <Briefcase size={10} />
                      {emp.designation || "—"}
                    </p>
                  </div>
                </div>
              </td>

              {/* Contact */}
              <td className="table-td">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <EnvelopeSimple size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[160px]">{emp.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-body">
                    <Phone size={12} className="text-slate-400 flex-shrink-0" />
                    <span>{emp.phone || "—"}</span>
                  </div>
                </div>
              </td>

              {/* Department */}
              <td className="table-td">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-650 dark:text-slate-350">
                  {emp.department || "—"}
                </span>
              </td>

              {/* Joining Date */}
              <td className="table-td">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-body">
                  <Calendar size={12} className="text-slate-400" />
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
                <span className="font-semibold text-[var(--brand-primary)] text-xs font-body">
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
