// NexusHR: Precision Industrial Employees directory.
import { useState, useEffect } from "react";
import { Plus, PencilSimpleLine, Trash, MagnifyingGlass, Funnel, Briefcase, EnvelopeSimple, Phone, Calendar, CurrencyInr, User } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { employeeService } from "../../services/employeeService";
import { departmentService } from "../../services/departmentService";
import { formatCurrency } from "../../utils/formatters";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Employees() {
  const { isHR, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: "ACTIVE",
    gender: "Male",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empData, deptData] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll(),
      ]);
      setEmployees(empData);
      setDepartments(deptData);
    } catch (error) {
      console.error("Failed to load employee data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setCurrentEmp(null);
    setFormData({
      employeeName: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      salary: "",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      gender: "Male",
      address: "",
      dateOfBirth: "",
      emergencyContact: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setCurrentEmp(emp);
    setFormData({
      employeeName: emp.employeeName || "",
      email: emp.email || "",
      phone: emp.phone || "",
      department: emp.department || "",
      designation: emp.designation || "",
      salary: emp.salary || "",
      joiningDate: emp.joiningDate || "",
      status: emp.status || "ACTIVE",
      gender: emp.gender || "Male",
      address: emp.address || "",
      dateOfBirth: emp.dateOfBirth || "",
      emergencyContact: emp.emergencyContact || "",
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (emp) => {
    setCurrentEmp(emp);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentEmp) {
        await employeeService.update(currentEmp.id, formData);
      } else {
        await employeeService.create(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to save employee: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    try {
      await employeeService.delete(currentEmp.id);
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to delete employee: " + (error.response?.data?.message || error.message));
    }
  };

  // Columns Configuration
  const columns = [
    {
      key: "employeeName",
      label: "Name",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-slate-100 dark:bg-slate-805 flex items-center justify-center font-mono font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs">
            {val.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-850 dark:text-slate-200">{val}</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{row.designation}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (val, row) => (
        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-body">
          <div className="flex items-center gap-1.5">
            <EnvelopeSimple size={12} className="text-slate-400" />
            <span>{val}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <Phone size={12} className="text-slate-400" />
            <span>{row.phone || "—"}</span>
          </div>
        </div>
      ),
    },
    { key: "department", label: "Department" },
    {
      key: "joiningDate",
      label: "Joining Date",
      render: (val) => val ? new Date(val).toLocaleDateString() : "—",
    },
    {
      key: "salary",
      label: "Salary",
      render: (val) => typeof val === "number" ? formatCurrency(val) : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <Badge status={val} label={val} />,
    },
  ];

  // Actions renderer
  const actions = (row) => {
    if (!isHR()) return null;
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handleOpenEdit(row)}
          className="p-1 rounded text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
          title="Edit"
        >
          <PencilSimpleLine size={15} />
        </button>
        {isAdmin() && (
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash size={15} />
          </button>
        )}
      </div>
    );
  };

  // Client-side filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDept = !selectedDept || emp.department === selectedDept;
    const matchStatus = !selectedStatus || emp.status === selectedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Employees Directory</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">Manage employee profiles, contact details, and system roles.</p>
          </div>
          {isHR() && (
            <Button variant="primary" onClick={handleOpenAdd} className="flex items-center gap-1.5 py-2 text-xs">
              <Plus size={14} />
              <span>Add Employee</span>
            </Button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100 font-mono">Total Employees</span>
            <p className="text-3xl font-normal font-mono mt-2">{employees.length}</p>
            <p className="text-[10px] text-cyan-100/80 mt-1 font-body">In the directory</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Active</span>
            <p className="text-3xl font-normal font-mono text-emerald-500 mt-2">{employees.filter(e => e.status === 'ACTIVE').length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Currently working</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Departments</span>
            <p className="text-3xl font-normal font-mono text-[var(--brand-primary)] mt-2">{departments.length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Org structure</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Showing</span>
            <p className="text-3xl font-normal font-mono text-slate-800 dark:text-slate-100 mt-2">{filteredEmployees.length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">After filter</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center gap-4 font-body">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MagnifyingGlass size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Funnel size={14} className="text-slate-405" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="select-field py-2 text-xs"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select-field py-2 text-xs"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredEmployees}
          loading={loading}
          actions={actions}
        />

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={currentEmp ? "Edit Employee" : "Add New Employee"}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 font-body text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field font-mono"
                  placeholder="9876543210"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="select-field"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="input-field"
                  placeholder="Software Engineer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Monthly Salary *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    disabled={!isAdmin()}
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || "" })}
                    className="input-field pl-9 font-mono"
                    placeholder="6500"
                  />
                </div>
                {!isAdmin() && (
                  <p className="text-[10px] text-amber-500 mt-1 font-body">Salary revisions must be submitted via the Payroll page.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Joining Date *</label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="input-field font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input-field font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="select-field"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Status *</label>
                <select
                  required
                  disabled={!isAdmin()}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="select-field"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Emergency Contact Name/Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="input-field"
                  placeholder="Jane Doe - 9876543211"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Home Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="123 Smart St, City, Country"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Profile
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
          title="Delete Employee Profile"
          message={`Are you sure you want to delete ${currentEmp?.employeeName}'s profile? This will permanently remove their records from the directory.`}
        />
      </div>
    </PageTransition>
  );
}
