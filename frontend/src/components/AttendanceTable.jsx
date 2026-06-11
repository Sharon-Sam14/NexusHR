import { Clock } from "@phosphor-icons/react";
import { formatTime, formatWorkHours } from "../utils/formatters";
import Badge from "./Badge";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

export default function AttendanceTable({ records = [], loading = false, showEmployee = false }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!records.length) {
    return (
      <EmptyState
        message="No Attendance Records"
        description="No attendance records found for the selected filters."
        icon={Clock}
      />
    );
  }

  return (
    <div className="table-container font-body">
      <table className="table-base">
        <thead className="table-head">
          <tr className="font-body uppercase text-[10px] tracking-wider text-slate-500">
            <th className="table-th">Date</th>
            {showEmployee && <th className="table-th">Employee</th>}
            <th className="table-th">Status</th>
            <th className="table-th">Check In</th>
            <th className="table-th">Check Out</th>
            <th className="table-th">Work Hours</th>
            <th className="table-th">Remarks</th>
          </tr>
        </thead>
        <tbody className="text-xs text-slate-650 dark:text-slate-350">
          {records.map((record, idx) => {
            return (
              <tr key={record.id || idx} className="table-row">
                <td className="table-td font-medium text-slate-850 dark:text-slate-100 font-body">
                  {record.date
                    ? new Date(record.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                {showEmployee && (
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-805 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 font-body font-bold text-xs flex-shrink-0">
                        {record.employeeName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{record.employeeName}</p>
                        <p className="text-[10px] text-slate-500 font-body tracking-wider uppercase">{record.department}</p>
                      </div>
                    </div>
                  </td>
                )}
                <td className="table-td">
                  <Badge status={record.status} label={record.status?.replace("_", " ")} />
                </td>
                <td className="table-td font-body text-slate-800 dark:text-slate-200">
                  {record.checkIn ? formatTime(record.checkIn) : <span className="text-slate-500 font-body">—</span>}
                </td>
                <td className="table-td font-body text-slate-800 dark:text-slate-200">
                  {record.checkOut ? formatTime(record.checkOut) : <span className="text-slate-500 font-body">—</span>}
                </td>
                <td className="table-td font-body">
                  {record.workHours != null ? (
                    <span className="font-semibold text-slate-805 dark:text-slate-200">{formatWorkHours(record.workHours)}</span>
                  ) : (
                    <span className="text-slate-500 font-body">—</span>
                  )}
                </td>
                <td className="table-td text-slate-500 max-w-[180px] truncate" title={record.remarks}>
                  {record.remarks || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
