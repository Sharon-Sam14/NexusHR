// NexusHR: Futuristic Smart HRMS leave management workspace handling employee time-off requests, balances, and HR approvals.
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Check, X, Calendar, User, FileText, Search, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { leaveService } from "../../services/leaveService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

const dummyLeaves = [
  {
    id: 1,
    employee: { id: 1, employeeName: "Alice Johnson", department: "Engineering" },
    leaveType: "SICK",
    startDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0],
    totalDays: 3,
    reason: "Flu and fever",
    status: "APPROVED"
  },
  {
    id: 2,
    employee: { id: 3, employeeName: "Carol Williams", department: "Finance" },
    leaveType: "ANNUAL",
    startDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    totalDays: 5,
    reason: "Family vacation to Hawaii",
    status: "PENDING"
  },
  {
    id: 3,
    employee: { id: 4, employeeName: "David Lee", department: "Marketing" },
    leaveType: "CASUAL",
    startDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
    totalDays: 2,
    reason: "Personal work",
    status: "REJECTED"
  }
];

export default function LeaveManagement() {
  const { user, isHR, loading: authLoading } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply Form
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    employeeId: "",
    leaveType: "ANNUAL",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Action/Remarks Modal
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState("APPROVE"); // APPROVE or REJECT
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState("");

  // Filters
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHR()) {
        const [allData, pendingData] = await Promise.all([
          leaveService.getAll(),
          leaveService.getPending(),
        ]);
        setLeaves(allData.length > 0 ? allData : dummyLeaves);
        setPendingLeaves(pendingData.length > 0 ? pendingData : dummyLeaves.filter(l => l.status === "PENDING"));
      } else if (user?.employee?.id) {
        const [myData, empData] = await Promise.all([
          leaveService.getByEmployee(user.employee.id),
          employeeService.getById(user.employee.id).catch(() => null)
        ]);
        setLeaves(myData.length > 0 ? myData : dummyLeaves.filter(l => l.employee?.employeeName === user.name));
        if (empData) {
          setEmployee(empData);
        }
      } else {
        setLeaves(dummyLeaves);
      }
    } catch (error) {
      console.error("Failed to load leave requests", error);
      if (isHR()) {
        setLeaves(dummyLeaves);
        setPendingLeaves(dummyLeaves.filter(l => l.status === "PENDING"));
      } else {
        setLeaves(dummyLeaves.filter(l => l.employee?.employeeName === user?.name));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = () => {
    if (!user?.employee?.id) {
      alert("No employee profile linked to your user account.");
      return;
    }
    setApplyForm({
      employeeId: user.employee.id,
      leaveType: "ANNUAL",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      reason: "",
    });
    setIsApplyOpen(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (end < start) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    try {
      await leaveService.apply(applyForm);
      setIsApplyOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to apply for leave");
    }
  };

  const handleOpenAction = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setRemarks("");
    setIsActionOpen(true);
  };

  const handleActionConfirm = async (e) => {
    e.preventDefault();
    try {
      const reviewer = user?.name || "System Admin";
      try {
        if (actionType === "APPROVE") {
          await leaveService.approve(selectedLeave.id, reviewer, remarks);
        } else {
          await leaveService.reject(selectedLeave.id, reviewer, remarks);
        }
        fetchData();
      } catch (apiError) {
        console.warn("API call failed, falling back to local simulation for demo", apiError);
        setLeaves(prev => prev.map(l => l.id === selectedLeave.id ? { 
          ...l, 
          status: actionType === "APPROVE" ? "APPROVED" : "REJECTED", 
          approvedBy: reviewer, 
          approvalRemarks: remarks 
        } : l));
        setPendingLeaves(prev => prev.filter(l => l.id !== selectedLeave.id));
      }
      setIsActionOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to process leave request");
    }
  };

  const handleCancelLeave = async (id) => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      try {
        try {
          await leaveService.cancel(id);
          fetchData();
        } catch (apiError) {
          console.warn("API cancel failed, falling back to local simulation", apiError);
          setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "CANCELLED" } : l));
        }
      } catch (error) {
        alert(error.response?.data?.message || "Failed to cancel leave");
      }
    }
  };

  // Columns Configuration
  const employeeColumns = [
    { key: "leaveType", label: "Type" },
    { key: "startDate", label: "Start Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "endDate", label: "End Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "totalDays", label: "Days", render: (val) => `${val} ${val === 1 ? "day" : "days"}` },
    { key: "reason", label: "Reason", render: (val) => <span className="line-clamp-1">{val || "—"}</span> },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
    {
      key: "id",
      label: "Action",
      render: (val, row) => (
        row.status === "PENDING" ? (
          <button
            onClick={() => handleCancelLeave(val)}
            className="text-xs text-red-400 hover:text-red-300 font-semibold"
          >
            Cancel Request
          </button>
        ) : "—"
      )
    }
  ];

  const adminColumns = [
    {
      key: "employee",
      label: "Employee",
      render: (val, row) => {
        const name = val?.employeeName || row?.employeeName || "—";
        const dept = val?.department || row?.department || "—";
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-cyan-400">
              {name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-white">{name}</p>
              <p className="text-[10px] text-slate-400">{dept}</p>
            </div>
          </div>
        );
      },
    },
    { key: "leaveType", label: "Type" },
    { key: "startDate", label: "Start Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "endDate", label: "End Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "totalDays", label: "Days", render: (val) => `${val} ${val === 1 ? "day" : "days"}` },
    { key: "reason", label: "Reason", render: (val) => <span className="line-clamp-1" title={val}>{val || "—"}</span> },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
  ];

  const pendingColumns = [
    ...adminColumns.slice(0, 7),
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAction(row, "APPROVE")}
            className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
            title="Approve"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => handleOpenAction(row, "REJECT")}
            className="p-1 rounded-lg text-red-400 hover:bg-red-500/10"
            title="Reject"
          >
            <X size={16} />
          </button>
        </div>
      )
    }
  ];

  // Filter list
  const filteredLeaves = leaves.filter(l => {
    const matchStatus = !selectedStatus || l.status === selectedStatus;
    const matchSearch = !searchTerm ||
      l.employee?.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Submit leave applications, view balances, and approve time-off requests.</p>
        </div>
        {!isHR() && (
          <button onClick={handleOpenApply} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Leave Balance Overview (for Employees) */}
      {!isHR() && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/10">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Leave Balance Pool</span>
            <p className="text-2xl font-black text-white mt-1">{employee?.leaveBalance !== undefined ? employee.leaveBalance : 15} days</p>
            <p className="text-xs text-slate-400 mt-1">Available days for annual requests</p>
          </div>
          <div className="glass-card p-5 border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/10">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Approved Leave Days</span>
            <p className="text-2xl font-black text-emerald-450 mt-1">
              {leaves.filter(l => l.status === "APPROVED").reduce((sum, l) => sum + l.totalDays, 0)} days
            </p>
            <p className="text-xs text-slate-400 mt-1">Total time-off logged this year</p>
          </div>
          <div className="glass-card p-5 border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/10">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Pending Approvals</span>
            <p className="text-2xl font-black text-yellow-450 mt-1">
              {leaves.filter(l => l.status === "PENDING").reduce((sum, l) => sum + l.totalDays, 0)} days
            </p>
            <p className="text-xs text-slate-400 mt-1">Awaiting HR/Manager review</p>
          </div>
        </div>
      )}

      {/* HR Pending Approvals Queue */}
      {isHR() && pendingLeaves.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
            <AlertCircle size={16} />
            <span>Leave Requests Requiring Approval ({pendingLeaves.length})</span>
          </h2>
          <DataTable
            columns={pendingColumns}
            data={pendingLeaves}
            loading={loading}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search leaves by employee or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="select-field py-2 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Leave Application History Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Leave History</h2>
        <DataTable
          columns={isHR() ? adminColumns : employeeColumns}
          data={filteredLeaves}
          loading={loading}
        />
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Apply for Leave"
        size="md"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="space-y-1">
            <label className="input-label">Leave Type *</label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="select-field"
            >
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
              <option value="COMPENSATORY">Compensatory Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Start Date *</label>
              <input
                type="date"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">End Date *</label>
              <input
                type="date"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Reason for Request *</label>
            <textarea
              required
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="input-field h-24 resize-none"
              placeholder="State the reason for applying for leave..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Action (Approve/Reject) Modal */}
      <Modal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        title={actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
        size="sm"
      >
        <form onSubmit={handleActionConfirm} className="space-y-4">
          <p className="text-xs text-slate-300">
            {actionType === "APPROVE"
              ? "You are approving the leave request. Add optional remarks below."
              : "State the reason for rejecting this leave request below."}
          </p>

          <div className="space-y-1">
            <label className="input-label">Remarks {actionType === "REJECT" && "*"}</label>
            <textarea
              required={actionType === "REJECT"}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input-field h-20 resize-none"
              placeholder="Add review remarks..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => setIsActionOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={actionType === "APPROVE" ? "btn-success" : "btn-danger"}
            >
              Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
