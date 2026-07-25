// NexusHR: Precision Industrial Leave Management workspace.
import { useState, useEffect, useRef } from "react";
import {
  Plus, Check, X, Calendar, User, FileText, MagnifyingGlass, WarningCircle,
  UploadSimple, FilePdf, Image, Eye, DownloadSimple, Trash, Spinner, CheckCircle, Warning
} from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { leaveService } from "../../services/leaveService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

// ─── Constants ────────────────────────────────────────────────────────────────
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─── Medical Document Upload Zone ─────────────────────────────────────────────
function MedicalDocUpload({ employeeId, onDocumentUploaded, onDocumentRemoved, uploadedDoc }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: PDF, JPG, JPEG, PNG.`;
    }
    if (file.size === 0) return "File is empty. Please select a valid document.";
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed: ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFile = async (file) => {
    setError("");
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const doc = await leaveService.uploadMedicalDocument(
        employeeId,
        file,
        (pct) => setUploadProgress(pct)
      );
      onDocumentUploaded(doc);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed. Please try again.";
      setError(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset input so same file can be re-selected
  };

  const handleRemove = () => {
    setError("");
    onDocumentRemoved();
  };

  const isImage = uploadedDoc?.fileType?.startsWith("image/");
  const isPdf = uploadedDoc?.fileType === "application/pdf";
  const fileSizeMb = uploadedDoc ? (uploadedDoc.fileSize / 1024 / 1024).toFixed(2) : null;

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono flex items-center gap-1">
        <span className="text-red-500">*</span>
        Medical Certificate / Supporting Document
      </label>

      {/* Already uploaded */}
      {uploadedDoc ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            {isPdf ? (
              <FilePdf size={18} className="text-red-500" />
            ) : (
              <Image size={18} className="text-emerald-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate font-body">
              {uploadedDoc.fileName}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {fileSizeMb} MB · {uploadedDoc.fileType}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Remove and re-upload"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all select-none ${
              dragOver
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                : "border-slate-200 dark:border-slate-700 hover:border-[var(--brand-primary)]/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            } ${uploading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {uploading ? (
              <div className="space-y-2">
                <Spinner size={24} className="text-[var(--brand-primary)] mx-auto animate-spin" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-body">Uploading… {uploadProgress}%</p>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <UploadSimple size={24} className="text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-body">
                  <span className="text-[var(--brand-primary)] font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  PDF, JPG, PNG · Max {MAX_SIZE_MB} MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleChange}
            className="hidden"
          />
        </>
      )}

      {/* Validation error */}
      {error && (
        <div className="flex items-start gap-1.5 text-red-500 text-[11px] font-body">
          <Warning size={13} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info banner */}
      {!uploadedDoc && !error && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-body flex items-start gap-1">
          <WarningCircle size={12} className="flex-shrink-0 mt-0.5" />
          Medical / Sick Leave requires a supporting document (doctor's note, prescription, or medical certificate).
        </p>
      )}
    </div>
  );
}

// ─── Document Preview/Download Cell (HR view) ─────────────────────────────────
function DocumentCell({ leave }) {
  if (leave.leaveType !== "SICK" && leave.leaveType !== "MEDICAL") return <span className="text-slate-400 text-xs">—</span>;

  if (!leave.medicalCertificateId) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-mono">
        <Warning size={11} />
        Missing
      </span>
    );
  }

  const previewUrl = `http://localhost:8081/api/documents/${leave.medicalCertificateId}/preview`;
  const downloadUrl = `http://localhost:8081/api/documents/${leave.medicalCertificateId}/download`;

  return (
    <div className="flex items-center gap-1">
      <a
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 rounded text-blue-500 hover:bg-blue-500/10 transition-colors"
        title={`Preview: ${leave.medicalCertificateFileName || "document"}`}
      >
        <Eye size={14} />
      </a>
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
        title="Download"
      >
        <DownloadSimple size={14} />
      </a>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [uploadedMedDoc, setUploadedMedDoc] = useState(null); // DocumentDTO from backend
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");

  // Action/Remarks Modal
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState("APPROVE");
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
        setLeaves(results[0]);
        setPendingLeaves(results[1]);
        if (user?.employee?.id) {
          setPersonalLeaves(results[2]);
          if (results[3]) setEmployee(results[3]);
        }
      } else if (user?.employee?.id) {
        const [myData, empData] = await Promise.all([
          leaveService.getByEmployee(user.employee.id).catch(() => []),
          employeeService.getById(user.employee.id).catch(() => null)
        ]);
        setLeaves(myData);
        setPersonalLeaves(myData);
        if (empData) setEmployee(empData);
      } else {
        setLeaves([]);
        setPersonalLeaves([]);
      }
    } catch (error) {
      console.error("Failed to load leave requests", error);
      setLeaves([]);
      setPendingLeaves([]);
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
    setUploadedMedDoc(null);
    setApplyError("");
    setIsApplyOpen(true);
  };

  const handleLeaveTypeChange = (e) => {
    const newType = e.target.value;
    setApplyForm(prev => ({ ...prev, leaveType: newType }));
    // Clear medical doc when switching away from SICK
    if (newType !== "SICK") {
      setUploadedMedDoc(null);
    }
    setApplyError("");
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError("");

    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (end < start) {
      setApplyError("End date cannot be earlier than start date.");
      return;
    }

    // SICK leave requires medical document
    if (applyForm.leaveType === "SICK" && !uploadedMedDoc) {
      setApplyError("Medical / Sick Leave requires a supporting document. Please upload a medical certificate.");
      return;
    }

    const payload = {
      ...applyForm,
      medicalCertificateId: uploadedMedDoc ? uploadedMedDoc.id : null,
    };

    setApplyLoading(true);
    try {
      await leaveService.apply(payload);
      setIsApplyOpen(false);
      setUploadedMedDoc(null);
      fetchData();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to apply for leave.";
      setApplyError(msg);
    } finally {
      setApplyLoading(false);
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
        console.warn("API call failed, simulating locally", apiError);
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
      alert(error?.response?.data?.message || "Failed to process leave request");
    }
  };

  const handleCancelLeave = async (id) => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      try {
        try {
          await leaveService.cancel(id);
          fetchData();
        } catch (apiError) {
          console.warn("API cancel failed, simulating locally", apiError);
          setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "CANCELLED" } : l));
        }
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to cancel leave");
      }
    }
  };

  // ─── Column Configs ──────────────────────────────────────────────────────────
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
            Cancel
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
    { key: "startDate", label: "Start", render: (val) => new Date(val).toLocaleDateString() },
    { key: "endDate", label: "End", render: (val) => new Date(val).toLocaleDateString() },
    { key: "totalDays", label: "Days", render: (val) => `${val}d` },
    { key: "reason", label: "Reason", render: (val) => <span className="line-clamp-1" title={val}>{val || "—"}</span> },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
    {
      key: "medicalCertificateId",
      label: "Document",
      sortable: false,
      render: (val, row) => <DocumentCell leave={row} />,
    },
  ];

  const pendingColumns = [
    ...adminColumns.slice(0, 8),
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

  // Filter
  const leavesToFilter = (isHR() && viewMode === "manage") ? leaves : personalLeaves;
  const filteredLeaves = leavesToFilter.filter(l => {
    const matchStatus = !selectedStatus || l.status === selectedStatus;
    const name = l.employee?.employeeName || l.employeeName || "";
    const matchSearch = !searchTerm ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeColumns = (isHR() && viewMode === "manage") ? adminColumns : employeeColumns;
  const isSickLeave = applyForm.leaveType === "SICK";

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
              placeholder="Search by employee name or leave type..."
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

        {/* ── Apply Leave Modal ─────────────────────────────────────────────── */}
        <Modal
          isOpen={isApplyOpen}
          onClose={() => { setIsApplyOpen(false); setUploadedMedDoc(null); setApplyError(""); }}
          title="Apply for Leave"
          size="md"
        >
          <form onSubmit={handleApply} className="space-y-4 font-body text-xs">

            {/* Leave Type */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Leave Type *</label>
              <select
                value={applyForm.leaveType}
                onChange={handleLeaveTypeChange}
                className="select-field"
              >
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick / Medical Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="PATERNITY">Paternity Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="COMPENSATORY">Compensatory Leave</option>
              </select>

              {/* SICK leave indicator */}
              {isSickLeave && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-body bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800/40">
                  <WarningCircle size={12} className="flex-shrink-0" />
                  <span>Sick Leave requires a supporting medical document. Upload below before submitting.</span>
                </div>
              )}
            </div>

            {/* Date Range */}
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

            {/* Reason */}
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

            {/* Medical Document Upload — ONLY for SICK leave */}
            {isSickLeave && (
              <MedicalDocUpload
                employeeId={applyForm.employeeId}
                uploadedDoc={uploadedMedDoc}
                onDocumentUploaded={(doc) => {
                  setUploadedMedDoc(doc);
                  setApplyError("");
                }}
                onDocumentRemoved={() => setUploadedMedDoc(null)}
              />
            )}

            {/* Form-level error */}
            {applyError && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-body">
                <Warning size={14} className="flex-shrink-0 mt-0.5" />
                <span>{applyError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setIsApplyOpen(false); setUploadedMedDoc(null); setApplyError(""); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={applyLoading || (isSickLeave && !uploadedMedDoc)}
              >
                {applyLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Spinner size={13} className="animate-spin" />
                    Submitting…
                  </span>
                ) : "Submit Application"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── Review Action Modal (Approve / Reject) ────────────────────────── */}
        <Modal
          isOpen={isActionOpen}
          onClose={() => setIsActionOpen(false)}
          title={actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
          size="sm"
        >
          <form onSubmit={handleActionConfirm} className="space-y-4 font-body text-xs">
            {/* Document preview for SICK leave */}
            {selectedLeave?.leaveType === "SICK" && selectedLeave?.medicalCertificateId && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2">
                  <FilePdf size={16} className="text-blue-500" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-body">
                    {selectedLeave.medicalCertificateFileName || "Medical Certificate"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <a
                    href={`http://localhost:8081/api/documents/${selectedLeave.medicalCertificateId}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono"
                  >
                    <Eye size={12} />
                    Preview
                  </a>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <a
                    href={`http://localhost:8081/api/documents/${selectedLeave.medicalCertificateId}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                  >
                    <DownloadSimple size={12} />
                    Download
                  </a>
                </div>
              </div>
            )}

            <p className="text-slate-550 dark:text-slate-400">
              {actionType === "APPROVE"
                ? "You are approving the leave request. Add optional remarks below."
                : "State the reason for rejecting this leave request."}
            </p>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">
                Remarks {actionType === "REJECT" && "*"}
              </label>
              <textarea
                required={actionType === "REJECT"}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input-field h-20 resize-none"
                placeholder="Add review remarks..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setIsActionOpen(false)}>
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
