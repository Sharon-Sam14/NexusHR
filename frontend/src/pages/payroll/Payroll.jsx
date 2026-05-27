// NexusHR: Futuristic Smart HRMS payroll hub managing monthly basic salaries, allowances, deductions, taxes, and direct deposit slips.
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Printer, Download, Eye, Plus, CheckCircle2, Search, Calendar, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { payrollService } from "../../services/payrollService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

const dummyEmployees = [
  { id: 1, employeeName: "Alice Johnson", salary: 95000.0, department: "Engineering", designation: "Senior Engineer" },
  { id: 2, employeeName: "Bob Smith", salary: 75000.0, department: "Human Resources", designation: "HR Manager" },
  { id: 3, employeeName: "Carol Williams", salary: 80000.0, department: "Finance", designation: "Financial Analyst" },
  { id: 4, employeeName: "David Lee", salary: 70000.0, department: "Marketing", designation: "Marketing Lead" },
  { id: 5, employeeName: "Eva Martinez", salary: 72000.0, department: "Design", designation: "UI/UX Designer" }
];

const dummyPayrolls = [
  {
    id: 1,
    employeeName: "Alice Johnson",
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
    employeeName: "Bob Smith",
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
    employeeName: "Carol Williams",
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
        setPayrolls(payData.length > 0 ? payData : dummyPayrolls);
        setEmployees(empData.length > 0 ? empData : dummyEmployees);
      } else if (user?.employee?.id) {
        const payData = await payrollService.getByEmployee(user.employee.id);
        setPayrolls(payData.length > 0 ? payData : dummyPayrolls.filter(p => p.employeeName === user.name));
      } else {
        setPayrolls(dummyPayrolls);
      }
    } catch (error) {
      console.error("Failed to load payroll data", error);
      if (isHR()) {
        setPayrolls(dummyPayrolls);
        setEmployees(dummyEmployees);
      } else {
        setPayrolls(dummyPayrolls.filter(p => p.employeeName === user?.name));
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
          <p className="font-semibold text-white">{val}</p>
          <p className="text-[10px] text-slate-400">{row.department} • {row.designation}</p>
        </div>
      ),
    },
    { key: "month", label: "Period", render: (val, row) => `${months[val - 1]} ${row.year}` },
    { key: "basicSalary", label: "Basic", render: (val) => `$${val.toLocaleString()}` },
    { key: "bonus", label: "Bonus", render: (val) => val ? `$${val.toLocaleString()}` : "$0" },
    { key: "deductions", label: "Deduction", render: (val) => val ? `$${val.toLocaleString()}` : "$0" },
    { key: "netSalary", label: "Net Payout", render: (val) => <span className="font-bold text-cyan-400">${val.toLocaleString()}</span> },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleViewSlip(row)}
        className="btn-icon text-cyan-400 hover:text-cyan-300"
        title="View Payslip"
      >
        <Eye size={14} />
      </button>
      {isHR() && row.status !== "PAID" && (
        <button
          onClick={() => handleMarkPaid(row.id)}
          className="btn-icon text-emerald-400 hover:text-emerald-300"
          title="Mark Paid"
        >
          <CheckCircle2 size={14} />
        </button>
      )}
    </div>
  );

  const filteredPayrolls = payrolls.filter(p => {
    return !searchTerm || p.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll System</h1>
          <p className="page-subtitle">Track payments, calculate deductions/bonuses, and generate payslips.</p>
        </div>
        {isHR() && (
          <button onClick={handleOpenGenerate} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} />
            <span>Generate Payroll</span>
          </button>
        )}
      </div>

      {/* HR Filter Bar */}
      {isHR() && (
        <div className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
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
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Select Employee *</label>
              <select
                required
                value={generateForm.employeeId}
                onChange={handleEmployeeChange}
                className="select-field"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.employeeName} (${emp.salary}/mo)</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="input-label">Basic Base Salary *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <DollarSign size={16} />
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
              <label className="input-label">Period Month *</label>
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
              <label className="input-label">Period Year *</label>
              <input
                type="number"
                required
                value={generateForm.year}
                onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Performance Bonus</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <DollarSign size={16} />
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
              <label className="input-label">Deductions (Unpaid leaves, etc.)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <DollarSign size={16} />
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
              <label className="input-label">Estimated Income Tax</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <DollarSign size={16} />
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
                <label className="input-label">Work Days</label>
                <input
                  type="number"
                  value={generateForm.workingDays}
                  onChange={(e) => setGenerateForm({ ...generateForm, workingDays: parseInt(e.target.value) || 0 })}
                  className="input-field text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="input-label">Present Days</label>
                <input
                  type="number"
                  value={generateForm.daysPresent}
                  onChange={(e) => setGenerateForm({ ...generateForm, daysPresent: parseInt(e.target.value) || 0 })}
                  className="input-field text-center"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Remarks</label>
            <input
              type="text"
              value={generateForm.remarks}
              onChange={(e) => setGenerateForm({ ...generateForm, remarks: e.target.value })}
              className="input-field"
              placeholder="e.g. Month-end payroll"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Generate Slip
            </button>
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
          <div className="space-y-6">
            <div id="payslip-print-area" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 space-y-6 font-sans">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">NexusHR</h2>
                  <p className="text-xs text-slate-500">Corporate Salary Slip</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-white">Slip #{selectedSlip.id}</p>
                  <p className="text-slate-500">Period: {months[selectedSlip.month - 1]} {selectedSlip.year}</p>
                </div>
              </div>

              {/* Employee Detail */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Employee Name:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedSlip.employeeName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Department:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedSlip.department}</p>
                </div>
                <div>
                  <span className="text-slate-500">Designation:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedSlip.designation}</p>
                </div>
                <div>
                  <span className="text-slate-500">Working Days / Present:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedSlip.daysPresent} of {selectedSlip.workingDays} days</p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="border-t border-b border-slate-800 py-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Basic Base Salary</span>
                  <span className="font-semibold text-white">${selectedSlip.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Performance Bonus</span>
                  <span className="font-semibold text-emerald-400">+${selectedSlip.bonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deductions</span>
                  <span className="font-semibold text-red-400">-${selectedSlip.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Income Tax</span>
                  <span className="font-semibold text-red-400">-${selectedSlip.tax.toLocaleString()}</span>
                </div>
              </div>

              {/* Total Payout */}
              <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Net Payout</span>
                  <p className="text-xs text-slate-600 mt-0.5">Direct Deposit</p>
                </div>
                <span className="text-2xl font-black text-cyan-400 font-mono">${selectedSlip.netSalary.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-600 border-t border-slate-800 pt-4">
                <span>Remarks: {selectedSlip.remarks || "Regular pay period"}</span>
                <span className="font-semibold uppercase tracking-wider text-cyan-500">Status: {selectedSlip.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handlePrintSlip}
                className="btn-secondary flex items-center gap-1.5 text-xs py-2"
              >
                <Printer size={14} />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setIsSlipOpen(false)}
                className="btn-primary text-xs py-2"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
