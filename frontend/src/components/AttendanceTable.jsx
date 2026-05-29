import { Clock, CheckCircle, XCircle, AlertTriangle, MinusCircle } from "lucide-react";
import { formatTime, formatWorkHours } from "../utils/formatters";
import Badge from "./Badge";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

const statusConfig = {
  PRESENT: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ABSENT: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  LATE: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  HALF_DAY: { icon: MinusCircle, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  ON_LEAVE: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
};

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
    <div className="table-container">
      <table className="table-base">
        <thead className="table-head">
          <tr>
            <th className="table-th">Date</th>
            {showEmployee && <th className="table-th">Employee</th>}
            <th className="table-th">Status</th>
            <th className="table-th">Check In</th>
            <th className="table-th">Check Out</th>
            <th className="table-th">Work Hours</th>
            <th className="table-th">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => {
            const config = statusConfig[record.status] || statusConfig.PRESENT;
            const Icon = config.icon;
            return (
              <tr key={record.id || idx} className="table-row">
                <td className="table-td font-medium text-white">
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
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        {record.employeeName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs">{record.employeeName}</p>
                        <p className="text-slate-500 text-[10px]">{record.department}</p>
                      </div>
                    </div>
                  </td>
                )}
                <td className="table-td">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color}`}>
                    <Icon size={11} />
                    {record.status?.replace("_", " ")}
                  </span>
                </td>
                <td className="table-td tabular-nums">
                  {record.checkIn ? formatTime(record.checkIn) : <span className="text-slate-600">—</span>}
                </td>
                <td className="table-td tabular-nums">
                  {record.checkOut ? formatTime(record.checkOut) : <span className="text-slate-600">—</span>}
                </td>
                <td className="table-td tabular-nums">
                  {record.workHours != null ? (
                    <span className="font-semibold text-slate-200">{formatWorkHours(record.workHours)}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="table-td text-slate-400 max-w-[180px] truncate" title={record.remarks}>
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
