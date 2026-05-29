import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Filter, Briefcase, Mail, Phone, Calendar, IndianRupee, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { employeeService } from "../../services/employeeService";
import { departmentService } from "../../services/departmentService";
import { formatCurrency } from "../../utils/formatters";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";

export default function Employees() {
  const { isHR } = useAuth();
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
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400">
            {val.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">{val}</p>
            <p className="text-xs text-slate-400">{row.designation}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (val, row) => (
        <div className="space-y-0.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Mail size={12} className="text-slate-500" />
            <span>{val}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-slate-500" />
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
      <>
        <button
          onClick={() => handleOpenEdit(row)}
          className="btn-icon text-cyan-400 hover:text-cyan-300"
          title="Edit"
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={() => handleOpenDelete(row)}
          className="btn-icon text-red-400 hover:text-red-300"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees Directory</h1>
          <p className="page-subtitle">Manage employee profiles, contact details, and system roles.</p>
        </div>
        {isHR() && (
          <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
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
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Full Name *</label>
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
              <label className="input-label">Email Address *</label>
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
              <label className="input-label">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="9876543210"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Department *</label>
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
              <label className="input-label">Designation *</label>
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
              <label className="input-label">Monthly Salary *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <IndianRupee size={16} />
                </span>
                <input
                  type="number"
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || "" })}
                  className="input-field pl-9"
                  placeholder="6500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="input-label">Joining Date *</label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Gender</label>
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
              <label className="input-label">Status *</label>
              <select
                required
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
              <label className="input-label">Emergency Contact Name/Phone</label>
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
            <label className="input-label">Home Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="123 Smart St, City, Country"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Profile
            </button>
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
  );
}
