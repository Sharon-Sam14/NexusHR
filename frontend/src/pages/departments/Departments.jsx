// NexusHR: Premium Departments Workspace.
import { useState, useEffect } from "react";
import { Plus, PencilSimpleLine, Trash, Buildings, User, CaretRight } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { departmentService } from "../../services/departmentService";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

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
        <div className="w-6 h-6 border-2 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1
              className="text-[20px] font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Departments
            </h1>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Configure organization departments, heads, and description.
            </p>
          </div>
          {isHR() && (
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold"
            >
              <Plus size={15} weight="bold" />
              <span>Add Department</span>
            </Button>
          )}
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} hover padding="p-5">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'var(--brand-blue-soft)' }}
                >
                  <Buildings size={20} weight="light" style={{ color: 'var(--brand-blue)' }} />
                </div>
                <Badge
                  status={dept.active ? "ACTIVE" : "INACTIVE"}
                  label={dept.active ? "Active" : "Inactive"}
                />
              </div>

              <h3
                className="text-[15px] font-semibold mb-1"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                {dept.name}
              </h3>
              <p
                className="text-[12px] mb-4 min-h-[32px] line-clamp-2"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}
              >
                {dept.description || "No description provided."}
              </p>

              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--border-divider)' }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Head
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                    {dept.headName || 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[12px] mr-2"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {dept.employeeCount ?? dept.employeesCount ?? 0} members
                  </span>
                  {isHR() && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: 'var(--brand-blue)' }}
                        title="Edit Department"
                      >
                        <PencilSimpleLine size={16} weight="light" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(dept)}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer hover:bg-red-500/10"
                        style={{ color: 'var(--color-danger)' }}
                        title="Delete Department"
                      >
                        <Trash size={16} weight="light" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Add Department Dashed Card */}
          {isHR() && (
            <button
              onClick={handleOpenAdd}
              className="rounded-[16px] p-5 flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all duration-150 min-h-[160px] cursor-pointer"
              style={{ borderColor: 'var(--border-input)', color: 'var(--text-muted)', background: 'transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand-blue)';
                e.currentTarget.style.color = 'var(--brand-blue)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-input)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Plus size={24} weight="light" />
              <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-ui)' }}>
                Add Department
              </span>
            </button>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={currentDept ? "Edit Department" : "Add Department"}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs font-body">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Department Name *</label>
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
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Department Head</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={14} />
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
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Active Status</label>
              <div className="flex items-center gap-4 mt-2 font-body font-medium">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active === true}
                    onChange={() => setFormData({ ...formData, active: true })}
                    className="accent-[var(--brand-blue)]"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active === false}
                    onChange={() => setFormData({ ...formData, active: false })}
                    className="accent-[var(--brand-blue)]"
                  />
                  Inactive
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-24 resize-none"
                placeholder="Provide a brief description of the department's responsibilities..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-205 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Department
              </Button>
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
    </PageTransition>
  );
}
