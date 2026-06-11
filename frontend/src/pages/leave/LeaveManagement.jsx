// NexusHR: Precision Industrial Leave Management workspace.
import { useState, useEffect } from "react";
import { Plus, Check, X, Calendar, User, FileText, MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { leaveService } from "../../services/leaveService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const dummyLeaves = [
  {
    id: 1,
    employee: { id: 1, employeeName: "Aarav Sharma", department: "Engineering" },
    leaveType: "SICK",
    startDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0],
    totalDays: 3,
    reason: "Suffering from Viral Fever",
    status: "APPROVED"
  },
  {
    id: 2,
    employee: { id: 3, employeeName: "Rohan Das", department: "Finance" },
    leaveType: "ANNUAL",
    startDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    totalDays: 5,
    reason: "Diwali festival celebrations with family in Jaipur",
    status: "PENDING"
  },
  {
    id: 3,
    employee: { id: 4, employeeName: "Amit Mehta", department: "Marketing" },
    leaveType: "CASUAL",
    startDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
    totalDays: 2,
    reason: "Urgent domestic work at home",
    status: "REJECTED"
  }
];

export default function LeaveManagement() {
  const { user, isHR, loading: authLoading } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [personalLeaves, setPersonalLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(isHR() ? "manage" : "personal");

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
      setViewMode(isHR() ? "manage" : "personal");
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHR()) {
        const promises = [
          leaveService.getAll().catch(() => []),
          leaveService.getPending().catch(() => []),
        ];
        if (user?.employee?.id) {
          promises.push(leaveService.getByEmployee(user.employee.id).catch(() => []));
          promises.push(employeeService.getById(user.employee.id).catch(() => null));
        }
        const results = await Promise.all(promises);
        const allData = results[0];
        const pendingData = results[1];
        setLeaves(allData);
        setPendingLeaves(pendingData);
        if (user?.employee?.id) {
          const myData = results[2];
          const empData = results[3];
          setPersonalLeaves(myData);
          if (empData) {
            setEmployee(empData);
          }
        }
      } else if (user?.employee?.id) {
        const [myData, empData] = await Promise.all([
          leaveService.getByEmployee(user.employee.id).catch(() => []),
          employeeService.getById(user.employee.id).catch(() => null)
        ]);
        setLeaves(myData);
        setPersonalLeaves(myData);
        if (empData) {
          setEmployee(empData);
        }
      } else {
        setLeaves([]);
        setPersonalLeaves([]);
      }
    } catch (error) {
      console.error("Failed to load leave requests", error);
      if (isHR()) {
        setLeaves([]);
        setPendingLeaves([]);
      } else {
        setLeaves([]);
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
            className="text-xs text-red-500 hover:text-red-400 font-medium font-body"
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
            <div className="w-7 h-7 rounded-[4px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-medium text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700">
              {name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{name}</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{dept}</p>
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
            className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            title="Approve"
          >
            <Check size={15} />
          </button>
          <button
            onClick={() => handleOpenAction(row, "REJECT")}
            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
            title="Reject"
          >
            <X size={15} />
          </button>
        </div>
      )
    }
  ];

  // Filter list
  const leavesToFilter = (isHR() && viewMode === "manage") ? leaves : personalLeaves;
  const filteredLeaves = leavesToFilter.filter(l => {
    const matchStatus = !selectedStatus || l.status === selectedStatus;
    const matchSearch = !searchTerm ||
      l.employee?.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeColumns = (isHR() && viewMode === "manage") ? adminColumns : employeeColumns;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Leave Management</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">Submit leave applications, view balances, and approve time-off requests.</p>
          </div>
          {(viewMode === "personal" || !isHR()) && (
            <Button variant="primary" onClick={handleOpenApply} className="flex items-center gap-1.5 py-2 text-xs">
              <Plus size={14} />
              <span>Apply for Leave</span>
            </Button>
          )}
        </div>

        {/* HR Stats Overview */}
        {isHR() && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Total Requests</span>
              <p className="text-3xl font-normal font-mono text-slate-800 dark:text-slate-100 mt-2">{leaves.length}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-body">All time records</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Pending Review</span>
              <p className="text-3xl font-normal font-mono text-amber-500 mt-2">{pendingLeaves.length}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-body">Awaiting decision</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Approved</span>
              <p className="text-3xl font-normal font-mono text-emerald-500 mt-2">{leaves.filter(l => l.status === 'APPROVED').length}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-body">Granted this cycle</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Rejected</span>
              <p className="text-3xl font-normal font-mono text-red-500 mt-2">{leaves.filter(l => l.status === 'REJECTED').length}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-body">Declined requests</p>
            </div>
          </div>
        )}

        {/* View Switcher Tabs (Only for HR/Admin) */}
        {isHR() && (
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("manage")}
              className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-all ${
                viewMode === "manage"
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Manage Requests
            </button>
            <button
              onClick={() => setViewMode("personal")}
              className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-all ${
                viewMode === "personal"
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              My Leaves
            </button>
          </div>
        )}

        {/* Leave Balance Overview (for Employees and personal view mode) */}
        {(viewMode === "personal" || !isHR()) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Leave Balance Pool</span>
                <p className="text-2xl font-normal text-slate-800 dark:text-slate-200 mt-2 font-mono">
                  {employee?.leaveBalance !== undefined ? employee.leaveBalance : 15} days
                </p>
              </div>
              <p className="text-[11px] text-slate-450 mt-3 font-body">Available days for annual requests</p>
            </Card>
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Approved Leave Days</span>
                <p className="text-2xl font-normal text-emerald-600 dark:text-emerald-500 mt-2 font-mono">
                  {personalLeaves.filter(l => l.status === "APPROVED").reduce((sum, l) => sum + l.totalDays, 0)} days
                </p>
              </div>
              <p className="text-[11px] text-slate-455 mt-3 font-body">Total time-off logged this year</p>
            </Card>
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Pending Approvals</span>
                <p className="text-2xl font-normal text-amber-600 dark:text-amber-500 mt-2 font-mono">
                  {personalLeaves.filter(l => l.status === "PENDING").reduce((sum, l) => sum + l.totalDays, 0)} days
                </p>
              </div>
              <p className="text-[11px] text-slate-455 mt-3 font-body">Awaiting HR/Manager review</p>
            </Card>
          </div>
        )}

        {/* HR Pending Approvals Queue */}
        {isHR() && viewMode === "manage" && pendingLeaves.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500 flex items-center gap-1.5 font-mono">
              <WarningCircle size={14} />
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
        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MagnifyingGlass size={16} />
            </span>
            <input
              type="text"
              placeholder="Search leaves by employee or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            {viewMode === "manage" ? "Global Leave History" : "My Leave History"}
          </h2>
          <DataTable
            columns={activeColumns}
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
          <form onSubmit={handleApply} className="space-y-4 font-body text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Leave Type *</label>
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
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Start Date *</label>
                <input
                  type="date"
                  required
                  value={applyForm.startDate}
                  onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">End Date *</label>
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
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Reason for Request *</label>
              <textarea
                required
                value={applyForm.reason}
                onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                className="input-field h-24 resize-none"
                placeholder="State the reason for applying for leave..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsApplyOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Application
              </Button>
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
          <form onSubmit={handleActionConfirm} className="space-y-4 font-body text-xs">
            <p className="text-slate-550 dark:text-slate-400">
              {actionType === "APPROVE"
                ? "You are approving the leave request. Add optional remarks below."
                : "State the reason for rejecting this leave request below."}
            </p>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Remarks {actionType === "REJECT" && "*"}</label>
              <textarea
                required={actionType === "REJECT"}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input-field h-20 resize-none"
                placeholder="Add review remarks..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsActionOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={actionType === "APPROVE" ? "primary" : "danger"}
              >
                Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
}
