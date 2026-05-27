import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Building2, User, FileText, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { departmentService } from "../../services/departmentService";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";

export default function Departments() {
  const { isHR } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headName: "",
    active: true,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setCurrentDept(null);
    setFormData({
      name: "",
      description: "",
      headName: "",
      active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setCurrentDept(dept);
    setFormData({
      name: dept.name || "",
      description: dept.description || "",
      headName: dept.headName || "",
      active: dept.active ?? true,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (dept) => {
    setCurrentDept(dept);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentDept) {
        await departmentService.update(currentDept.id, formData);
      } else {
        await departmentService.create(formData);
      }
      setIsFormOpen(false);
      fetchDepartments();
    } catch (error) {
      alert("Failed to save department: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    try {
      await departmentService.delete(currentDept.id);
      setIsDeleteOpen(false);
      fetchDepartments();
    } catch (error) {
      alert("Failed to delete department: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Configure organization departments, heads, and descriptions.</p>
        </div>
        {isHR() && (
          <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="glass-card p-6 flex flex-col justify-between relative overflow-hidden border border-slate-700/50 hover:border-cyan-500/30 group"
          >
            <div>
              {/* Icon & Title */}
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shadow-inner">
                  <Building2 size={20} />
                </div>
                <Badge
                  status={dept.active ? "ACTIVE" : "INACTIVE"}
                  label={dept.active ? "Active" : "Inactive"}
                />
              </div>

              <h3 className="text-lg font-bold text-white mt-4 tracking-tight group-hover:text-cyan-400 transition-colors">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {dept.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User size={13} className="text-slate-500" />
                <span>Head: <span className="text-slate-200 font-medium">{dept.headName || "Not assigned"}</span></span>
              </div>

              {isHR() && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
                    title="Edit Department"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(dept)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    title="Delete Department"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentDept ? "Edit Department" : "Add Department"}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="input-label">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Engineering"
            />
          </div>

          <div className="space-y-1">
            <label className="input-label">Department Head</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User size={16} />
              </span>
              <input
                type="text"
                value={formData.headName}
                onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                className="input-field pl-9"
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Active Status</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="active"
                  checked={formData.active === true}
                  onChange={() => setFormData({ ...formData, active: true })}
                  className="accent-cyan-500"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="active"
                  checked={formData.active === false}
                  onChange={() => setFormData({ ...formData, active: false })}
                  className="accent-cyan-500"
                />
                Inactive
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field h-24 resize-none"
              placeholder="Provide a brief description of the department's responsibilities..."
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
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
        title="Delete Department"
        message={`Are you sure you want to delete the ${currentDept?.name} department? All employee references to this department might need to be manually updated.`}
      />
    </div>
  );
}
