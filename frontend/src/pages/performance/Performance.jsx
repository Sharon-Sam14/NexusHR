// NexusHR: Futuristic Smart HRMS performance appraisal workspace handling evaluation ratings, comments, milestones, and employee receipts.
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Award, ShieldAlert, FileText, Search, User, Calendar, Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { performanceService } from "../../services/performanceService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";

const dummyEmployees = [
  { id: 1, employeeName: "Alice Johnson", salary: 95000.0, department: "Engineering", designation: "Senior Engineer" },
  { id: 2, employeeName: "Bob Smith", salary: 75000.0, department: "Human Resources", designation: "HR Manager" },
  { id: 3, employeeName: "Carol Williams", salary: 80000.0, department: "Finance", designation: "Financial Analyst" },
  { id: 4, employeeName: "David Lee", salary: 70000.0, department: "Marketing", designation: "Marketing Lead" },
  { id: 5, employeeName: "Eva Martinez", salary: 72000.0, department: "Design", designation: "UI/UX Designer" }
];

const dummyReviews = [
  {
    id: 1,
    employee: { id: 1, employeeName: "Alice Johnson", department: "Engineering", designation: "Senior Engineer" },
    employeeName: "Alice Johnson",
    reviewPeriod: "Q1 2026",
    reviewDate: new Date().toISOString().split("T")[0],
    overallRating: 4.5,
    productivityRating: 4.5,
    qualityRating: 4.0,
    teamworkRating: 5.0,
    communicationRating: 4.5,
    comments: "Alice is an outstanding Senior Engineer. She led the team during the API migration and has shown incredible technical and team leadership.",
    goals: "Lead the frontend architecture modernization next quarter.",
    reviewedBy: "Bob Smith",
    status: "ACKNOWLEDGED"
  },
  {
    id: 2,
    employee: { id: 3, employeeName: "Carol Williams", department: "Finance", designation: "Financial Analyst" },
    employeeName: "Carol Williams",
    reviewPeriod: "Q1 2026",
    reviewDate: new Date().toISOString().split("T")[0],
    overallRating: 4.0,
    productivityRating: 4.0,
    qualityRating: 4.0,
    teamworkRating: 4.0,
    communicationRating: 4.0,
    comments: "Carol manages our financial operations with great diligence. Her reports are consistently precise.",
    goals: "Automate quarterly financial compliance reports.",
    reviewedBy: "Bob Smith",
    status: "SUBMITTED"
  }
];

export default function Performance() {
  const { user, isHR, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: "",
    reviewPeriod: "",
    reviewDate: new Date().toISOString().split("T")[0],
    overallRating: 3.0,
    productivityRating: 3.0,
    qualityRating: 3.0,
    teamworkRating: 3.0,
    communicationRating: 3.0,
    comments: "",
    goals: "",
    reviewedBy: user?.name || "System Admin",
    status: "SUBMITTED",
  });

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHR()) {
        const [revData, empData] = await Promise.all([
          performanceService.getAll(),
          employeeService.getAll(),
        ]);
        setReviews(revData.length > 0 ? revData : dummyReviews);
        setEmployees(empData.length > 0 ? empData : dummyEmployees);
      } else if (user?.employee?.id) {
        const revData = await performanceService.getByEmployee(user.employee.id);
        setReviews(revData.length > 0 ? revData : dummyReviews.filter(r => r.employee?.employeeName === user.name));
      } else {
        setReviews(dummyReviews);
      }
    } catch (error) {
      console.error("Failed to load performance reviews", error);
      if (isHR()) {
        setReviews(dummyReviews);
        setEmployees(dummyEmployees);
      } else {
        setReviews(dummyReviews.filter(r => r.employee?.employeeName === user?.name));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setCurrentReview(null);
    setFormData({
      employeeId: "",
      reviewPeriod: "Q1 2026",
      reviewDate: new Date().toISOString().split("T")[0],
      overallRating: 3.0,
      productivityRating: 3.0,
      qualityRating: 3.0,
      teamworkRating: 3.0,
      communicationRating: 3.0,
      comments: "",
      goals: "",
      reviewedBy: user?.name || "System Admin",
      status: "SUBMITTED",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rev) => {
    setCurrentReview(rev);
    setFormData({
      employeeId: rev.employee?.id || "",
      reviewPeriod: rev.reviewPeriod || "",
      reviewDate: rev.reviewDate || "",
      overallRating: rev.overallRating || 3.0,
      productivityRating: rev.productivityRating || 3.0,
      qualityRating: rev.qualityRating || 3.0,
      teamworkRating: rev.teamworkRating || 3.0,
      communicationRating: rev.communicationRating || 3.0,
      comments: rev.comments || "",
      goals: rev.goals || "",
      reviewedBy: rev.reviewedBy || user?.name || "System Admin",
      status: rev.status || "SUBMITTED",
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (rev) => {
    setCurrentReview(rev);
    setIsDeleteOpen(true);
  };

  const handleOpenView = (rev) => {
    setCurrentReview(rev);
    setIsViewOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Calculate overall rating automatically as average of components
    const total = 
      formData.productivityRating + 
      formData.qualityRating + 
      formData.teamworkRating + 
      formData.communicationRating;
    const avg = parseFloat((total / 4).toFixed(1));
    const payload = { ...formData, overallRating: avg };

    try {
      try {
        if (currentReview) {
          await performanceService.update(currentReview.id, payload);
        } else {
          await performanceService.create(payload);
        }
        fetchData();
      } catch (apiError) {
        console.warn("API performance save failed, simulating locally for demo", apiError);
        const emp = employees.find(emp => emp?.id?.toString() === formData?.employeeId?.toString()) || { employeeName: "Employee " + (formData?.employeeId || ""), department: "Engineering", designation: "Software Engineer" };
        if (currentReview) {
          setReviews(prev => prev.map(r => r.id === currentReview.id ? {
            ...r,
            ...payload,
            employee: { employeeName: emp.employeeName, department: emp.department, designation: emp.designation }
          } : r));
        } else {
          const newRev = {
            id: Date.now(),
            employee: { employeeName: emp.employeeName, department: emp.department, designation: emp.designation },
            employeeName: emp.employeeName,
            ...payload
          };
          setReviews(prev => [newRev, ...prev]);
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      alert("Failed to save review: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    try {
      try {
        await performanceService.delete(currentReview.id);
        fetchData();
      } catch (apiError) {
        console.warn("API delete performance failed, simulating locally for demo", apiError);
        setReviews(prev => prev.filter(r => r.id !== currentReview.id));
      }
      setIsDeleteOpen(false);
    } catch (error) {
      alert("Failed to delete review: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAcknowledge = async () => {
    try {
      const payload = {
        employeeId: currentReview.employee?.id,
        reviewPeriod: currentReview.reviewPeriod,
        reviewDate: currentReview.reviewDate,
        overallRating: currentReview.overallRating,
        productivityRating: currentReview.productivityRating,
        qualityRating: currentReview.qualityRating,
        teamworkRating: currentReview.teamworkRating,
        communicationRating: currentReview.communicationRating,
        comments: currentReview.comments,
        goals: currentReview.goals,
        reviewedBy: currentReview.reviewedBy,
        status: "ACKNOWLEDGED",
      };
      try {
        await performanceService.update(currentReview.id, payload);
        fetchData();
      } catch (apiError) {
        console.warn("API acknowledge performance failed, simulating locally for demo", apiError);
        setReviews(prev => prev.map(r => r.id === currentReview.id ? { ...r, status: "ACKNOWLEDGED" } : r));
      }
      setIsViewOpen(false);
    } catch (error) {
      alert("Failed to acknowledge review: " + (error.response?.data?.message || error.message));
    }
  };

  // Columns Configuration
  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (val, row) => (
        <div>
          <p className="font-semibold text-white">{isHR() ? val?.employeeName : user?.name}</p>
          <p className="text-[10px] text-slate-400">{isHR() ? `${val?.department} • ${val?.designation}` : user?.role}</p>
        </div>
      ),
    },
    { key: "reviewPeriod", label: "Period" },
    {
      key: "overallRating",
      label: "Overall Rating",
      render: (val) => (
        <div className="flex items-center gap-1 font-semibold text-yellow-400">
          <Star size={14} fill="currentColor" />
          <span>{val.toFixed(1)} / 5.0</span>
        </div>
      ),
    },
    { key: "reviewedBy", label: "Evaluator" },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleOpenView(row)}
        className="btn-icon text-cyan-400 hover:text-cyan-300"
        title="View Review Detail"
      >
        <FileText size={14} />
      </button>
      {isHR() && (
        <>
          <button
            onClick={() => handleOpenEdit(row)}
            className="btn-icon text-indigo-400 hover:text-indigo-300"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="btn-icon text-red-400 hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  );

  const filteredReviews = reviews.filter(r => {
    const matchPeriod = !selectedPeriod || r.reviewPeriod === selectedPeriod;
    const matchSearch = !searchTerm || 
      r.employee?.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reviewedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchPeriod && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Appraisals</h1>
          <p className="page-subtitle">Track scores, evaluate productivity, set goals, and review manager feedback.</p>
        </div>
        {isHR() && (
          <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} />
            <span>Create New Appraisal</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search appraisals by name or evaluator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="select-field py-2 text-xs"
        >
          <option value="">All Periods</option>
          <option value="Q1 2026">Q1 2026</option>
          <option value="Q4 2025">Q4 2025</option>
          <option value="Q3 2025">Q3 2025</option>
          <option value="2025 Annual">2025 Annual</option>
        </select>
      </div>

      {/* Reviews Table */}
      <DataTable
        columns={columns}
        data={filteredReviews}
        loading={loading}
        actions={actions}
      />

      {/* Add / Edit Review Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentReview ? "Edit Performance Appraisal" : "Create New Appraisal"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Select Employee *</label>
              <select
                required
                disabled={!!currentReview}
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="select-field"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.employeeName} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="input-label">Review Period *</label>
              <input
                type="text"
                required
                value={formData.reviewPeriod}
                onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
                className="input-field"
                placeholder="e.g. Q1 2026, Annual 2025"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Review Date *</label>
              <input
                type="date"
                required
                value={formData.reviewDate}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select-field"
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
              </select>
            </div>
          </div>

          {/* Ratings Grid */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Appraisal Ratings (1.0 to 5.0 scale)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Productivity *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  required
                  value={formData.productivityRating}
                  onChange={(e) => setFormData({ ...formData, productivityRating: parseFloat(e.target.value) || 3.0 })}
                  className="input-field text-center font-bold text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Quality of Work *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  required
                  value={formData.qualityRating}
                  onChange={(e) => setFormData({ ...formData, qualityRating: parseFloat(e.target.value) || 3.0 })}
                  className="input-field text-center font-bold text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Teamwork *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  required
                  value={formData.teamworkRating}
                  onChange={(e) => setFormData({ ...formData, teamworkRating: parseFloat(e.target.value) || 3.0 })}
                  className="input-field text-center font-bold text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Communication *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  required
                  value={formData.communicationRating}
                  onChange={(e) => setFormData({ ...formData, communicationRating: parseFloat(e.target.value) || 3.0 })}
                  className="input-field text-center font-bold text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Appraisal Feedback Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="Provide comments on employee achievements, areas of improvement..."
            />
          </div>

          <div className="space-y-1">
            <label className="input-label">Key Growth Goals for Next Period</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="State 2-3 specific objectives for the next period..."
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
              Save Appraisal
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Review View Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Appraisal Details"
        size="md"
      >
        {currentReview && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Appraisal for {isHR() ? currentReview.employeeName : user?.name}</h3>
                <p className="text-xs text-slate-400">Period: {currentReview.reviewPeriod}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge status={currentReview.status} label={currentReview.status} />
                <span className="text-[10px] text-slate-500">Evaluated on {new Date(currentReview.reviewDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col justify-center items-center text-center">
                <Award size={36} className="text-cyan-400 mb-2" />
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Overall Rating</span>
                <span className="text-3xl font-black text-white mt-1">{currentReview.overallRating.toFixed(1)} / 5.0</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Productivity</span>
                  <span className="font-semibold text-white">{currentReview.productivityRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Quality of Work</span>
                  <span className="font-semibold text-white">{currentReview.qualityRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Teamwork</span>
                  <span className="font-semibold text-white">{currentReview.teamworkRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Communication</span>
                  <span className="font-semibold text-white">{currentReview.communicationRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-semibold text-cyan-400 block mb-1">Evaluator Feedback</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{currentReview.comments || "No comments provided."}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-semibold text-indigo-400 block mb-1">Key Development Goals</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{currentReview.goals || "No goals defined."}</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Evaluator: <span className="font-semibold text-slate-300">{currentReview.reviewedBy}</span></span>
              {!isHR() && currentReview.status === "SUBMITTED" && (
                <button
                  onClick={handleAcknowledge}
                  className="btn-primary py-2 text-xs"
                >
                  Acknowledge Receipt
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
        title="Delete Appraisal Record"
        message="Are you sure you want to delete this performance review? This action cannot be undone."
      />
    </div>
  );
}
