// NexusHR: Precision Industrial Payroll workspace.
import { useState, useEffect } from "react";
import { CurrencyInr, Printer, DownloadSimple, Eye, Plus, CheckCircle, MagnifyingGlass, Calendar, FileText } from "@phosphor-icons/react";
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
  const { user, isHR, loading: authLoading } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
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

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [selectedMonth, selectedYear, user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHR()) {
        const [payData, empData] = await Promise.all([
          payrollService.getByMonth(selectedMonth, selectedYear),
          employeeService.getAll(),
        ]);
        setPayrolls(payData);
        setEmployees(empData);
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
      } else {
        setPayrolls([]);
      }
    } finally {
      setLoading(false);
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
      workingDays: 22,
      daysPresent: 22,
      remarks: "",
    });
    setIsGenerateOpen(true);
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const emp = employees.find(e => e?.id?.toString() === empId?.toString());
    setGenerateForm({
      ...generateForm,
      employeeId: empId,
      basicSalary: emp ? emp.salary : "",
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
        const net = basic + bonus - ded - tax;
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
          netSalary: net,
          status: "PENDING",
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
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleViewSlip(row)}
        className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
        title="View Payslip"
      >
        <Eye size={15} />
      </button>
      {isHR() && row.status !== "PAID" && (
        <button
          onClick={() => handleMarkPaid(row.id)}
          className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          title="Mark Paid"
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
          title="Run Employee Payroll"
          size="lg"
        >
          <form onSubmit={handleGenerate} className="space-y-4 font-body text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Select Employee *</label>
                <select
                  required
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
                    onChange={(e) => setGenerateForm({ ...generateForm, basicSalary: parseFloat(e.target.value) || "" })}
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

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsGenerateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Generate Slip
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
      </div>
    </PageTransition>
  );
}
