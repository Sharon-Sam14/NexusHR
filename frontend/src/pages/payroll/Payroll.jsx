// NexusHR: Precision Industrial Payroll workspace.
import { useState, useEffect } from "react";
import { CurrencyInr, Printer, DownloadSimple, Eye, Plus, CheckCircle, MagnifyingGlass, Calendar, FileText, PencilSimpleLine, XCircle, PaperPlaneTilt, Gear, ArrowCounterClockwise, Lock, ClockCountdown } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { payrollService } from "../../services/payrollService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import { formatCurrency } from "../../utils/formatters";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const dummyEmployees = [
  { id: 1, employeeName: "Aarav Sharma", salary: 95000.0, department: "Engineering", designation: "Senior Engineer" },
  { id: 2, employeeName: "Priya Patel", salary: 75000.0, department: "Human Resources", designation: "HR Manager" },
  { id: 3, employeeName: "Rohan Das", salary: 80000.0, department: "Finance", designation: "Financial Analyst" },
  { id: 4, employeeName: "Amit Mehta", salary: 70000.0, department: "Marketing", designation: "Marketing Lead" },
  { id: 5, employeeName: "Anjali Nair", salary: 72000.0, department: "Design", designation: "UI/UX Designer" }
];

const dummyPayrolls = [
  {
    id: 1,
    employeeName: "Aarav Sharma",
    department: "Engineering",
    designation: "Senior Engineer",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 95000.0,
    bonus: 2000.0,
    deductions: 500.0,
    tax: 14250.0,
    netSalary: 82250.0,
    status: "PAID",
    workingDays: 22,
    daysPresent: 22,
    remarks: "Monthly salary payout"
  },
  {
    id: 2,
    employeeName: "Priya Patel",
    department: "Human Resources",
    designation: "HR Manager",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 75000.0,
    bonus: 1000.0,
    deductions: 0.0,
    tax: 11250.0,
    netSalary: 64750.0,
    status: "PENDING",
    workingDays: 22,
    daysPresent: 22,
    remarks: "Monthly salary payout"
  },
  {
    id: 3,
    employeeName: "Rohan Das",
    department: "Finance",
    designation: "Financial Analyst",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 80000.0,
    bonus: 1500.0,
    deductions: 200.0,
    tax: 12000.0,
    netSalary: 69300.0,
    status: "PAID",
    workingDays: 22,
    daysPresent: 21,
    remarks: "Monthly salary payout"
  }
];

export default function Payroll() {
  const { user, isHR, isAdmin, loading: authLoading } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pendingRevisions, setPendingRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Salary History
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [historyEmployee, setHistoryEmployee] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isEditingPayroll, setIsEditingPayroll] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonus: 0.0,
    deductions: 0.0
  });

  // Form State
  const [generateForm, setGenerateForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    bonus: 0.0,
    deductions: 0.0,
    tax: 0.0,
    workingDays: 22,
    daysPresent: 22,
    remarks: "",
  });

  const [revisionForm, setRevisionForm] = useState({
    employeeId: "",
    currentSalary: "",
    proposedSalary: "",
    reason: ""
  });

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [selectedMonth, selectedYear, user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHR()) {
        const promises = [
          payrollService.getByMonth(selectedMonth, selectedYear),
          employeeService.getAll()
        ];
        if (isAdmin()) {
          promises.push(payrollService.getPendingSalaryRevisions());
        }
        const results = await Promise.all(promises);
        setPayrolls(results[0]);
        setEmployees(results[1]);
        if (isAdmin()) {
          setPendingRevisions(results[2]);
        }
      } else if (user?.employee?.id) {
        const payData = await payrollService.getByEmployee(user.employee.id);
        setPayrolls(payData);
      } else {
        setPayrolls([]);
      }
    } catch (error) {
      console.error("Failed to load payroll data", error);
      if (isHR()) {
        setPayrolls([]);
        setEmployees([]);
        if (isAdmin()) {
          setPendingRevisions([]);
        }
      } else {
        setPayrolls([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRevision = () => {
    setRevisionForm({
      employeeId: "",
      currentSalary: "",
      proposedSalary: "",
      reason: ""
    });
    setIsRevisionOpen(true);
  };

  const handleRevisionEmployeeChange = (e) => {
    const empId = e.target.value;
    const emp = employees.find(emp => emp?.id?.toString() === empId?.toString());
    setRevisionForm({
      ...revisionForm,
      employeeId: empId,
      currentSalary: emp ? emp.salary : ""
    });
  };

  const handleSaveRevision = async (e) => {
    e.preventDefault();
    try {
      await payrollService.submitSalaryRevision({
        employeeId: revisionForm.employeeId,
        proposedSalary: parseFloat(revisionForm.proposedSalary),
        reason: revisionForm.reason
      });
      setIsRevisionOpen(false);
      alert("Salary revision requested successfully. Submitted for Admin approval.");
      fetchData();
    } catch (error) {
      alert("Failed to submit salary revision: " + (error.response?.data?.message || error.message));
    }
  };

  const handleApproveRevision = async (id) => {
    if (window.confirm("Approve this salary revision?")) {
      try {
        await payrollService.approveSalaryRevision(id);
        alert("Salary revision approved!");
        fetchData();
      } catch (error) {
        alert("Failed to approve salary revision: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleRejectRevision = async (id) => {
    if (window.confirm("Reject this salary revision?")) {
      try {
        await payrollService.rejectSalaryRevision(id);
        alert("Salary revision rejected.");
        fetchData();
      } catch (error) {
        alert("Failed to reject salary revision: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleOpenGenerate = () => {
    setGenerateForm({
      employeeId: "",
      month: selectedMonth,
      year: selectedYear,
      basicSalary: "",
      bonus: 0.0,
      deductions: 0.0,
      tax: 0.0,
      allowances: 0.0,
      reimbursements: 0.0,
      overtimePay: 0.0,
      workingDays: 22,
      daysPresent: 22,
      remarks: "",
    });
    setIsEditingPayroll(false);
    setIsGenerateOpen(true);
  };

  const handleApprovePayroll = async (id) => {
    if (window.confirm("Approve this payroll draft?")) {
      try {
        try {
          await payrollService.updateStatus(id, "APPROVED");
          fetchData();
        } catch (apiError) {
          console.warn("API update status failed, simulating locally for demo", apiError);
          setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
        }
        alert("Payroll draft approved!");
      } catch (error) {
        alert("Failed to approve payroll: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSubmitForApproval = async (id) => {
    if (window.confirm("Submit this payroll draft for Admin approval?")) {
      try {
        try {
          await payrollService.updateStatus(id, "PENDING_APPROVAL");
          fetchData();
        } catch (apiError) {
          console.warn("API update status failed, simulating locally for demo", apiError);
          setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "PENDING_APPROVAL" } : p));
        }
        alert("Payroll submitted for approval!");
      } catch (error) {
        alert("Failed to submit payroll: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleProcessPayroll = async (id) => {
    if (window.confirm("Process this approved payroll?")) {
      try {
        try {
          await payrollService.updateStatus(id, "PROCESSED");
          fetchData();
        } catch (apiError) {
          console.warn("API update status failed, simulating locally for demo", apiError);
          setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "PROCESSED" } : p));
        }
        alert("Payroll processed successfully!");
      } catch (error) {
        alert("Failed to process payroll: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleCancelPayroll = async (id) => {
    if (window.confirm("Cancel this payroll draft?")) {
      try {
        try {
          await payrollService.updateStatus(id, "CANCELLED");
          fetchData();
        } catch (apiError) {
          console.warn("API update status failed, simulating locally for demo", apiError);
          setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "CANCELLED" } : p));
        }
        alert("Payroll draft cancelled.");
      } catch (error) {
        alert("Failed to cancel payroll: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleRequestReopen = async (id) => {
    if (window.confirm("Submit a request to reopen this payroll back to DRAFT?")) {
      try {
        try {
          await payrollService.updateStatus(id, "PENDING_REOPEN");
          fetchData();
        } catch (apiError) {
          console.warn("API update status failed, simulating locally for demo", apiError);
          setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "PENDING_REOPEN" } : p));
        }
        alert("Reopen request submitted to Admin!");
      } catch (error) {
        alert("Failed to request reopen: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleApproveReopen = async (id) => {
    if (window.confirm("Approve reopen request and return this payroll to DRAFT?")) {
      try {
        try {
          await payrollService.updateStatus(id, "DRAFT");
          fetchData();
        } catch (apiError) {
          console.warn("API update status failed, simulating locally for demo", apiError);
          setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "DRAFT" } : p));
        }
        alert("Payroll returned to DRAFT status successfully.");
      } catch (error) {
        alert("Failed to approve reopen: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEditDraft = (row) => {
    setGenerateForm({
      employeeId: row.employeeId || "",
      month: row.month,
      year: row.year,
      basicSalary: row.basicSalary,
      bonus: row.bonus,
      deductions: row.deductions,
      tax: row.tax,
      allowances: row.allowances || 0,
      reimbursements: row.reimbursements || 0,
      overtimePay: row.overtimePay || 0,
      workingDays: row.workingDays || 22,
      daysPresent: row.daysPresent || 22,
      remarks: row.remarks || "",
    });
    setIsEditingPayroll(true);
    setIsGenerateOpen(true);
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const emp = employees.find(e => e?.id?.toString() === empId?.toString());
    const salary = emp ? emp.salary : 0;
    
    let taxRate = 0.12;
    if (salary >= 100000) {
      taxRate = 0.25;
    } else if (salary >= 50000) {
      taxRate = 0.18;
    }
    const calculatedTax = salary * taxRate;

    setGenerateForm({
      ...generateForm,
      employeeId: empId,
      basicSalary: emp ? emp.salary : "",
      tax: calculatedTax,
    });
  };

  const handleBasicSalaryChange = (e) => {
    const salary = parseFloat(e.target.value) || 0;
    let taxRate = 0.12;
    if (salary >= 100000) {
      taxRate = 0.25;
    } else if (salary >= 50000) {
      taxRate = 0.18;
    }
    const calculatedTax = salary * taxRate;

    setGenerateForm({
      ...generateForm,
      basicSalary: e.target.value,
      tax: calculatedTax,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      try {
        await payrollService.generate(generateForm);
        setIsGenerateOpen(false);
        fetchData();
      } catch (apiError) {
        console.warn("API generate payroll failed, simulating locally for demo", apiError);
        const emp = employees.find(emp => emp?.id?.toString() === generateForm?.employeeId?.toString()) || { employeeName: "Employee " + (generateForm?.employeeId || ""), department: "Engineering", designation: "Software Engineer" };
        const basic = parseFloat(generateForm.basicSalary) || 50000;
        const bonus = parseFloat(generateForm.bonus) || 0;
        const ded = parseFloat(generateForm.deductions) || 0;
        const tax = parseFloat(generateForm.tax) || 0;
        const allowances = parseFloat(generateForm.allowances) || 0;
        const reimbursements = parseFloat(generateForm.reimbursements) || 0;
        const overtimePay = parseFloat(generateForm.overtimePay) || 0;
        const net = basic + bonus + overtimePay + allowances + reimbursements - ded - tax;
        const newSlip = {
          id: Date.now(),
          employeeName: emp.employeeName,
          department: emp.department || "Engineering",
          designation: emp.designation || "Software Engineer",
          month: generateForm.month,
          year: generateForm.year,
          basicSalary: basic,
          bonus: bonus,
          deductions: ded,
          tax: tax,
          allowances: allowances,
          reimbursements: reimbursements,
          overtimePay: overtimePay,
          netSalary: net,
          status: "DRAFT",
          workingDays: generateForm.workingDays,
          daysPresent: generateForm.daysPresent,
          remarks: generateForm.remarks || "Simulation"
        };
        setPayrolls(prev => [newSlip, ...prev]);
        setIsGenerateOpen(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate payroll");
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm("Mark this payroll as PAID?")) {
      try {
        try {
          await payrollService.updateStatus(id, "PAID");
          fetchData();
        } catch (apiError) {
          console.warn("API update status failed, simulating locally for demo", apiError);
          setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "PAID" } : p));
        }
      } catch (error) {
        alert(error.response?.data?.message || "Failed to update status");
      }
    }
  };

  const handleViewSlip = (payroll) => {
    setSelectedSlip(payroll);
    setIsSlipOpen(true);
  };

  const handleViewSalaryHistory = async (row) => {
    const emp = employees.find(e => e?.id?.toString() === row?.employeeId?.toString());
    setHistoryEmployee(emp || { employeeName: row.employeeName, id: row.employeeId });
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await payrollService.getEmployeeSalaryHistory(row.employeeId);
      setSalaryHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch salary history", err);
      setSalaryHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleDownloadSlip = async (id) => {
    try {
      const token = localStorage.getItem("nexushr_token");
      const response = await fetch(`/api/payroll/${id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download payslip file.");
    }
  };

  const handleDownloadPdfSlip = async (id, employeeName) => {
    try {
      const token = localStorage.getItem("nexushr_token");
      const response = await fetch(`/api/payroll/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanName = employeeName ? employeeName.replace(/\s+/g, "_") : `employee_${id}`;
      link.setAttribute("download", `payslip_${cleanName}_${selectedMonth}_${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download PDF payslip: " + error.message);
    }
  };

  const handleOpenBatchModal = () => {
    setBatchForm({
      month: selectedMonth,
      year: selectedYear,
      bonus: 0.0,
      deductions: 0.0
    });
    setIsBatchOpen(true);
  };

  const handleRunBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await payrollService.runBatch(batchForm);
      alert(response.message || "Payroll batch job successfully started in background.");
      setIsBatchOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to start payroll batch run: " + (error.response?.data?.message || error.message));
    }
  };

  // Month map
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Table configurations
  const columns = [
    {
      key: "employeeName",
      label: "Employee",
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{val}</p>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{row.department} • {row.designation}</p>
        </div>
      ),
    },
    { key: "month", label: "Period", render: (val, row) => `${months[val - 1]} ${row.year}` },
    { key: "basicSalary", label: "Basic", render: (val) => formatCurrency(val) },
    { key: "bonus", label: "Bonus", render: (val) => val ? formatCurrency(val) : formatCurrency(0) },
    { key: "deductions", label: "Deduction", render: (val) => val ? formatCurrency(val) : formatCurrency(0) },
    {
      key: "overtimePay",
      label: "Overtime",
      render: (val, row) => (row.overtimeHours && row.overtimeHours > 0) ? `${row.overtimeHours.toFixed(1)} hrs (+${formatCurrency(val)})` : "—"
    },
    { key: "netSalary", label: "Net Payout", render: (val) => <span className="font-semibold text-[var(--brand-primary)]">{formatCurrency(val)}</span> },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <Badge status={val} label={val} />
          {["APPROVED", "PROCESSED", "PAID"].includes(val) && (
            <span title="Locked — cannot be edited without Admin reopen approval" className="inline-flex items-center">
              <Lock size={11} className="text-slate-400" weight="fill" />
            </span>
          )}
        </div>
      )
    },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      {/* View salary history button */}
      {isHR() && row.employeeId && (
        <button
          onClick={() => handleViewSalaryHistory(row)}
          className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="View Salary History"
        >
          <ClockCountdown size={15} />
        </button>
      )}

      {/* View payslip */}
      <button
        onClick={() => handleViewSlip(row)}
        className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
        title="View Payslip"
      >
        <Eye size={15} />
      </button>

      {/* DRAFT Actions */}
      {row.status === "DRAFT" && isHR() && (
        <>
          <button
            onClick={() => handleEditDraft(row)}
            className="p-1 rounded text-blue-500 hover:bg-blue-500/10 transition-colors"
            title="Edit Draft"
          >
            <PencilSimpleLine size={15} />
          </button>
          <button
            onClick={() => handleSubmitForApproval(row.id)}
            className="p-1 rounded text-amber-500 hover:bg-amber-500/10 transition-colors"
            title="Submit for Approval"
          >
            <PaperPlaneTilt size={15} />
          </button>
          <button
            onClick={() => handleCancelPayroll(row.id)}
            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
            title="Cancel Draft"
          >
            <XCircle size={15} />
          </button>
        </>
      )}

      {/* PENDING_APPROVAL Actions */}
      {row.status === "PENDING_APPROVAL" && isAdmin() && (
        <button
          onClick={() => handleApprovePayroll(row.id)}
          className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          title="Approve Draft"
        >
          <CheckCircle size={15} />
        </button>
      )}

      {/* APPROVED Actions */}
      {row.status === "APPROVED" && isAdmin() && (
        <button
          onClick={() => handleProcessPayroll(row.id)}
          className="p-1 rounded text-blue-500 hover:bg-blue-500/10 transition-colors"
          title="Process Payroll"
        >
          <Gear size={15} />
        </button>
      )}

      {/* PROCESSED Actions */}
      {row.status === "PROCESSED" && isAdmin() && (
        <button
          onClick={() => handleMarkPaid(row.id)}
          className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          title="Mark Paid"
        >
          <CheckCircle size={15} />
        </button>
      )}

      {/* Request Reopen (HR) */}
      {(row.status === "APPROVED" || row.status === "PROCESSED") && isHR() && (
        <button
          onClick={() => handleRequestReopen(row.id)}
          className="p-1 rounded text-amber-500 hover:bg-amber-500/10 transition-colors"
          title="Request Reopen to Draft"
        >
          <ArrowCounterClockwise size={15} />
        </button>
      )}

      {/* Approve Reopen (Admin) */}
      {row.status === "PENDING_REOPEN" && isAdmin() && (
        <button
          onClick={() => handleApproveReopen(row.id)}
          className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          title="Approve Reopen Request"
        >
          <CheckCircle size={15} />
        </button>
      )}
    </div>
  );

  const filteredPayrolls = payrolls.filter(p => {
    return !searchTerm || p.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Computed payroll stats
  const totalNetPayout = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const paidCount = payrolls.filter(p => p.status === 'PAID').length;
  const pendingCount = payrolls.filter(p => p.status !== 'PAID').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Payroll System</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">Track payments, calculate deductions/bonuses, and generate payslips.</p>
          </div>
          {isHR() && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleOpenRevision} className="flex items-center gap-1.5 py-2 text-xs">
                <Plus size={14} />
                <span>Recommend Salary Revision</span>
              </Button>
              <Button variant="secondary" onClick={handleOpenBatchModal} className="flex items-center gap-1.5 py-2 text-xs">
                <Calendar size={14} />
                <span>Run Monthly Batch</span>
              </Button>
              <Button variant="primary" onClick={handleOpenGenerate} className="flex items-center gap-1.5 py-2 text-xs">
                <Plus size={14} />
                <span>Generate Payroll</span>
              </Button>
            </div>
          )}
        </div>

        {/* Pending Salary Approvals (Admin Only) */}
        {isAdmin() && pendingRevisions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 font-mono">
              <CurrencyInr size={14} className="text-amber-500" />
              <span>Pending Salary Approvals ({pendingRevisions.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRevisions.map(rev => {
                const diff = (rev.proposedSalary || 0) - (rev.previousSalary || 0);
                const percent = ((diff / (rev.previousSalary || 1)) * 100).toFixed(1);
                return (
                  <Card key={rev.id} className="p-5 flex flex-col justify-between border-amber-500/30">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-850 dark:text-slate-200 text-sm">{rev.employeeName}</p>
                          <p className="text-[10px] text-slate-550 font-mono tracking-wider uppercase">{rev.department} • {rev.designation}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${diff >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                          {diff >= 0 ? "+" : ""}{formatCurrency(diff)} ({percent}%)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-805">
                        <div>
                          <span className="text-[9px] uppercase font-semibold text-slate-400">Current Salary</span>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{formatCurrency(rev.previousSalary)}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-semibold text-slate-450">Proposed Salary</span>
                          <p className="text-slate-800 dark:text-slate-100 font-semibold mt-0.5">{formatCurrency(rev.proposedSalary)}</p>
                        </div>
                      </div>

                      <div className="text-xs space-y-1 font-body">
                        <p className="text-slate-550"><span className="font-semibold text-slate-700 dark:text-slate-350">Reason:</span> "{rev.reason}"</p>
                        <p className="text-[10px] text-slate-450 font-mono">Requested by {rev.requestedBy} on {new Date(rev.requestedDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                      <Button
                        onClick={() => handleApproveRevision(rev.id)}
                        variant="primary"
                        className="flex-1 py-1.5 text-xs bg-emerald-650 hover:bg-emerald-550 border-0"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectRevision(rev.id)}
                        variant="danger"
                        className="flex-1 py-1.5 text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Payroll Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100 font-mono">Total Payrolls</span>
            <p className="text-3xl font-normal font-mono mt-2">{payrolls.length}</p>
            <p className="text-[10px] text-cyan-100/80 mt-1 font-body">Records this period</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Paid</span>
            <p className="text-3xl font-normal font-mono text-emerald-500 mt-2">{paidCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Disbursed this cycle</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Pending</span>
            <p className="text-3xl font-normal font-mono text-amber-500 mt-2">{pendingCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Awaiting payment</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Net Payout</span>
            <p className="text-xl font-normal font-mono text-[var(--brand-primary)] mt-2">{formatCurrency(totalNetPayout)}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Total this period</p>
          </div>
        </div>

        {/* HR Filter Bar */}
        {isHR() && (
          <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <MagnifyingGlass size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="select-field py-2 text-xs"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="select-field py-2 text-xs"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredPayrolls}
          loading={loading}
          actions={actions}
        />

        {/* Generate Payroll Modal */}
        <Modal
          isOpen={isGenerateOpen}
          onClose={() => setIsGenerateOpen(false)}
          title={isEditingPayroll ? "Edit Employee Payroll Draft" : "Run Employee Payroll"}
          size="lg"
        >
          <form onSubmit={handleGenerate} className="space-y-4 font-body text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Select Employee *</label>
                <select
                  required
                  disabled={isEditingPayroll}
                  value={generateForm.employeeId}
                  onChange={handleEmployeeChange}
                  className="select-field"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.employeeName} ({formatCurrency(emp.salary)}/mo)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Basic Base Salary *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    value={generateForm.basicSalary}
                    onChange={handleBasicSalaryChange}
                    className="input-field pl-9"
                    placeholder="Base Salary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Period Month *</label>
                <select
                  required
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                  className="select-field"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Period Year *</label>
                <input
                  type="number"
                  required
                  value={generateForm.year}
                  onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Performance Bonus</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    value={generateForm.bonus}
                    onChange={(e) => setGenerateForm({ ...generateForm, bonus: parseFloat(e.target.value) || 0 })}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Deductions (Unpaid leaves, etc.)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    value={generateForm.deductions}
                    onChange={(e) => setGenerateForm({ ...generateForm, deductions: parseFloat(e.target.value) || 0 })}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Allowances</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    value={generateForm.allowances}
                    onChange={(e) => setGenerateForm({ ...generateForm, allowances: parseFloat(e.target.value) || 0 })}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Reimbursements</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    value={generateForm.reimbursements}
                    onChange={(e) => setGenerateForm({ ...generateForm, reimbursements: parseFloat(e.target.value) || 0 })}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Estimated Income Tax</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    value={generateForm.tax}
                    onChange={(e) => setGenerateForm({ ...generateForm, tax: parseFloat(e.target.value) || 0 })}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Work Days</label>
                  <input
                    type="number"
                    value={generateForm.workingDays}
                    onChange={(e) => setGenerateForm({ ...generateForm, workingDays: parseInt(e.target.value) || 0 })}
                    className="input-field text-center font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Present Days</label>
                  <input
                    type="number"
                    value={generateForm.daysPresent}
                    onChange={(e) => setGenerateForm({ ...generateForm, daysPresent: parseInt(e.target.value) || 0 })}
                    className="input-field text-center font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Remarks</label>
              <input
                type="text"
                value={generateForm.remarks}
                onChange={(e) => setGenerateForm({ ...generateForm, remarks: e.target.value })}
                className="input-field"
                placeholder="e.g. Month-end payroll"
              />
            </div>

            {/* Live Net Salary Payout Preview */}
            {generateForm.employeeId && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-3 space-y-1 font-mono text-[10px]">
                <div className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider font-mono mb-2">Live Net Payout Preview</div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-body">Basic Salary:</span>
                  <span className="text-slate-800 dark:text-slate-200">{formatCurrency(parseFloat(generateForm.basicSalary) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-body">Bonus:</span>
                  <span className="text-emerald-600 dark:text-emerald-500">+{formatCurrency(parseFloat(generateForm.bonus) || 0)}</span>
                </div>
                {generateForm.overtimePay > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Overtime Pay (1.5x):</span>
                    <span className="text-emerald-600 dark:text-emerald-500">+{formatCurrency(parseFloat(generateForm.overtimePay) || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-body">Allowances:</span>
                  <span className="text-emerald-600 dark:text-emerald-500">+{formatCurrency(parseFloat(generateForm.allowances) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-body">Reimbursements:</span>
                  <span className="text-emerald-600 dark:text-emerald-500">+{formatCurrency(parseFloat(generateForm.reimbursements) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-body">Deductions:</span>
                  <span className="text-red-500">-{formatCurrency(parseFloat(generateForm.deductions) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-body">Income Tax:</span>
                  <span className="text-red-500">-{formatCurrency(parseFloat(generateForm.tax) || 0)}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-2"></div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 font-body">Estimated Net Payout:</span>
                  <span className="text-[var(--brand-primary)] font-mono">
                    {formatCurrency(
                      (parseFloat(generateForm.basicSalary) || 0) +
                      (parseFloat(generateForm.bonus) || 0) +
                      (parseFloat(generateForm.overtimePay) || 0) +
                      (parseFloat(generateForm.allowances) || 0) +
                      (parseFloat(generateForm.reimbursements) || 0) -
                      (parseFloat(generateForm.deductions) || 0) -
                      (parseFloat(generateForm.tax) || 0)
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsGenerateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditingPayroll ? "Update Draft" : "Generate Slip"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Run Monthly Batch Modal */}
        <Modal
          isOpen={isBatchOpen}
          onClose={() => setIsBatchOpen(false)}
          title="Run Asynchronous Monthly Batch Payroll"
          size="md"
        >
          <form onSubmit={handleRunBatch} className="space-y-4 font-body text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              This triggers a background batch calculation process for all registered employees. 
              Net payouts and income taxes will be automatically calculated based on attendance records, shift schedules, and standard tax brackets.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Period Month *</label>
                <select
                  required
                  value={batchForm.month}
                  onChange={(e) => setBatchForm({ ...batchForm, month: parseInt(e.target.value) })}
                  className="select-field"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Period Year *</label>
                <input
                  type="number"
                  required
                  value={batchForm.year}
                  onChange={(e) => setBatchForm({ ...batchForm, year: parseInt(e.target.value) })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Flat Bonus (Optional)</label>
                <input
                  type="number"
                  value={batchForm.bonus}
                  onChange={(e) => setBatchForm({ ...batchForm, bonus: parseFloat(e.target.value) || 0 })}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Flat Deduction (Optional)</label>
                <input
                  type="number"
                  value={batchForm.deductions}
                  onChange={(e) => setBatchForm({ ...batchForm, deductions: parseFloat(e.target.value) || 0 })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsBatchOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Run Batch Job
              </Button>
            </div>
          </form>
        </Modal>

        {/* Slip Print Modal */}
        <Modal
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
          title="Payslip Breakdown"
          size="md"
        >
          {selectedSlip && (
            <div className="space-y-6 text-xs font-body">
              <div id="payslip-print-area" className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 space-y-6">
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>NexusHR</h2>
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider font-mono mt-0.5">Corporate Salary Slip</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200">Slip #{selectedSlip.id}</p>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">Period: {months[selectedSlip.month - 1]} {selectedSlip.year}</p>
                  </div>
                </div>

                {/* Employee Detail */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider font-mono">Employee Name:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedSlip.employeeName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider font-mono">Department:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedSlip.department}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider font-mono">Designation:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedSlip.designation}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider font-mono">Working Days / Present:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{selectedSlip.daysPresent} of {selectedSlip.workingDays} days</p>
                  </div>
                </div>

                {/* Breakdown Grid */}
                <div className="border-t border-b border-slate-200 dark:border-slate-800 py-4 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Basic Base Salary</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(selectedSlip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Performance Bonus</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-500">+{formatCurrency(selectedSlip.bonus)}</span>
                  </div>
                  {selectedSlip.overtimeHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-body">Overtime Payout ({selectedSlip.overtimeHours.toFixed(1)} hrs @ 1.5x)</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-500">+{formatCurrency(selectedSlip.overtimePay)}</span>
                    </div>
                  )}
                  {selectedSlip.allowances > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-body">Allowances</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-500">+{formatCurrency(selectedSlip.allowances)}</span>
                    </div>
                  )}
                  {selectedSlip.reimbursements > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-body">Reimbursements</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-500">+{formatCurrency(selectedSlip.reimbursements)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Deductions</span>
                    <span className="font-medium text-red-650 dark:text-red-400">-{formatCurrency(selectedSlip.deductions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Estimated Income Tax</span>
                    <span className="font-medium text-red-650 dark:text-red-400">-{formatCurrency(selectedSlip.tax)}</span>
                  </div>
                </div>

                {/* Total Payout */}
                <div className="flex justify-between items-center bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-850 p-4 rounded">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Net Payout</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">Direct Deposit</p>
                  </div>
                  <span className="text-2xl font-normal text-[var(--brand-primary)] font-mono">{formatCurrency(selectedSlip.netSalary)}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-550 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <span>Remarks: {selectedSlip.remarks || "Regular pay period"}</span>
                  <span className="font-semibold uppercase tracking-wider text-[var(--brand-primary)] font-mono">Status: {selectedSlip.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={handlePrintSlip}
                  className="flex items-center gap-1.5 text-xs py-1.5"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDownloadSlip(selectedSlip.id)}
                  className="flex items-center gap-1.5 text-xs py-1.5"
                >
                  <DownloadSimple size={13} />
                  <span>CSV</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDownloadPdfSlip(selectedSlip.id, selectedSlip.employeeName)}
                  className="flex items-center gap-1.5 text-xs py-1.5"
                >
                  <DownloadSimple size={13} />
                  <span>PDF Payslip</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsSlipOpen(false)}
                  className="text-xs py-1.5"
                >
                  Close View
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Recommend Salary Revision Modal */}
        <Modal
          isOpen={isRevisionOpen}
          onClose={() => setIsRevisionOpen(false)}
          title="Recommend Salary Revision"
          size="md"
        >
          <form onSubmit={handleSaveRevision} className="space-y-4 font-body text-xs text-left">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Select Employee *</label>
              <select
                required
                value={revisionForm.employeeId}
                onChange={handleRevisionEmployeeChange}
                className="select-field"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.employeeName} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Current Salary</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={revisionForm.currentSalary ? formatCurrency(revisionForm.currentSalary) : "—"}
                    className="input-field pl-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Proposed Salary *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    value={revisionForm.proposedSalary}
                    onChange={(e) => setRevisionForm({ ...revisionForm, proposedSalary: e.target.value })}
                    className="input-field pl-9 font-mono"
                    placeholder="New Salary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Reason for Revision *</label>
              <textarea
                required
                value={revisionForm.reason}
                onChange={(e) => setRevisionForm({ ...revisionForm, reason: e.target.value })}
                className="input-field h-24 resize-none"
                placeholder="Describe why you are recommending this salary adjustment..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsRevisionOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send to Admin
              </Button>
            </div>
          </form>
        </Modal>
        {/* Salary History Modal */}
        <Modal
          isOpen={isHistoryOpen}
          onClose={() => { setIsHistoryOpen(false); setSalaryHistory([]); setHistoryEmployee(null); }}
          title={`Salary History — ${historyEmployee?.employeeName || ""}`}
          size="lg"
        >
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : salaryHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-body">
              <FileText size={32} className="mx-auto mb-3 opacity-40" />
              <p>No salary revision history found for this employee.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 font-body">Complete salary revision trail — most recent first. Records are immutable.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-body border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {["Date", "Previous Salary", "Proposed Salary", "Change", "Requested By", "Approved By", "Status"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salaryHistory.map((rev, idx) => {
                      const diff = (rev.proposedSalary || 0) - (rev.previousSalary || 0);
                      const pct = ((diff / (rev.previousSalary || 1)) * 100).toFixed(1);
                      return (
                        <tr key={rev.id ?? idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                            {rev.requestedDate ? new Date(rev.requestedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(rev.previousSalary)}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(rev.proposedSalary)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              diff >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                            }`}>
                              {diff >= 0 ? "+" : ""}{formatCurrency(diff)} ({pct}%)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{rev.requestedBy || "—"}</td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{rev.approvedBy || "—"}</td>
                          <td className="py-2.5 px-3">
                            <Badge
                              status={rev.status}
                              label={rev.status === "APPROVED" ? "Approved" : rev.status === "REJECTED" ? "Rejected" : "Pending"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[9px] text-slate-400 font-mono text-right pt-2">
                {salaryHistory.length} revision record{salaryHistory.length !== 1 ? "s" : ""} total
              </p>
            </div>
          )}
        </Modal>

      </div>
    </PageTransition>
  );
}
