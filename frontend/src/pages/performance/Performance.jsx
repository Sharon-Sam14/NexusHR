// NexusHR: Precision Industrial Performance workspace.
import { useState, useEffect } from "react";
import { Star, Medal, WarningCircle, FileText, MagnifyingGlass, User, Calendar, Plus, PencilSimpleLine, Trash } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { performanceService } from "../../services/performanceService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";
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

const dummyReviews = [
  {
    id: 1,
    employee: { id: 1, employeeName: "Aarav Sharma", department: "Engineering", designation: "Senior Engineer" },
    employeeName: "Aarav Sharma",
    reviewPeriod: "Q1 2026",
    reviewDate: new Date().toISOString().split("T")[0],
    overallRating: 4.5,
    productivityRating: 4.5,
    qualityRating: 4.0,
    teamworkRating: 5.0,
    communicationRating: 4.5,
    comments: "Aarav is an outstanding Senior Engineer. He successfully led the engineering team during the API migration and has shown incredible technical leadership.",
    goals: "Modernize the frontend routing and layout hierarchy next quarter.",
    reviewedBy: "Priya Patel",
    status: "ACKNOWLEDGED"
  },
  {
    id: 2,
    employee: { id: 3, employeeName: "Rohan Das", department: "Finance", designation: "Financial Analyst" },
    employeeName: "Rohan Das",
    reviewPeriod: "Q1 2026",
    reviewDate: new Date().toISOString().split("T")[0],
    overallRating: 4.0,
    productivityRating: 4.0,
    qualityRating: 4.0,
    teamworkRating: 4.0,
    communicationRating: 4.0,
    comments: "Rohan manages our financial operations with great diligence. His reports are consistently precise.",
    goals: "Automate quarterly compliance metrics and audits.",
    reviewedBy: "Priya Patel",
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

  // Tabs
  const [activeTab, setActiveTab] = useState("appraisals");

  // Goals State
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [selectedGoalEmployee, setSelectedGoalEmployee] = useState("");
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isGoalProgressOpen, setIsGoalProgressOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [goalForm, setGoalForm] = useState({
    employeeId: "",
    title: "",
    description: "",
    reviewPeriod: "Q1 2026",
    targetDate: new Date().toISOString().split("T")[0],
    setBy: user?.name || "HR"
  });

  const [progressForm, setProgressForm] = useState({
    progressPercent: 0,
    status: "NOT_STARTED"
  });

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
        setReviews(revData);
        setEmployees(empData);
      } else if (user?.employee?.id) {
        const revData = await performanceService.getByEmployee(user.employee.id);
        setReviews(revData);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Failed to load performance reviews", error);
      if (isHR()) {
        setReviews([]);
        setEmployees([]);
      } else {
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async (employeeId) => {
    if (!employeeId) return;
    setGoalsLoading(true);
    try {
      const data = await performanceService.getGoalsByEmployee(employeeId);
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
      setGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "goals") {
      const defaultEmpId = selectedGoalEmployee || user?.employee?.id || (employees[0]?.id ? employees[0].id.toString() : "");
      if (defaultEmpId) {
        setSelectedGoalEmployee(defaultEmpId);
        fetchGoals(defaultEmpId);
      }
    }
  }, [activeTab, selectedGoalEmployee, employees, user]);

  const handleOpenAddGoal = () => {
    setGoalForm({
      employeeId: selectedGoalEmployee || user?.employee?.id || "",
      title: "",
      description: "",
      reviewPeriod: "Q1 2026",
      targetDate: new Date().toISOString().split("T")[0],
      setBy: user?.name || "HR"
    });
    setIsGoalFormOpen(true);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await performanceService.createGoal(goalForm);
      setIsGoalFormOpen(false);
      fetchGoals(selectedGoalEmployee);
    } catch (error) {
      alert("Failed to create goal: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenEditGoalProgress = (goal) => {
    setSelectedGoal(goal);
    setProgressForm({
      progressPercent: goal.progressPercent,
      status: goal.status
    });
    setIsGoalProgressOpen(true);
  };

  const handleUpdateGoalProgress = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      await performanceService.updateGoalProgress(selectedGoal.id, progressForm.progressPercent);
      await performanceService.updateGoalStatus(selectedGoal.id, progressForm.status);
      setIsGoalProgressOpen(false);
      fetchGoals(selectedGoalEmployee);
    } catch (error) {
      alert("Failed to update goal: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await performanceService.deleteGoal(id);
        fetchGoals(selectedGoalEmployee);
      } catch (error) {
        alert("Failed to delete goal: " + (error.response?.data?.message || error.message));
      }
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
      render: (val, row) => {
        const name = isHR() ? (val?.employeeName || row?.employeeName || "—") : user?.name;
        const dept = isHR() ? (val?.department || row?.department || "—") : "";
        const desig = isHR() ? (val?.designation || row?.designation || "") : "";
        return (
          <div>
            <p className="font-medium text-slate-850 dark:text-slate-200">{name}</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
              {isHR() ? `${dept}${desig ? ` • ${desig}` : ""}` : user?.role}
            </p>
          </div>
        );
      },
    },
    { key: "reviewPeriod", label: "Period" },
    {
      key: "overallRating",
      label: "Overall Rating",
      render: (val) => (
        <div className="flex items-center gap-1 font-semibold text-amber-500 font-mono">
          <Star size={13} weight="fill" />
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
        className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
        title="View Review Detail"
      >
        <FileText size={15} />
      </button>
      {isHR() && (
        <>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
            title="Edit"
          >
            <PencilSimpleLine size={15} />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash size={15} />
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
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Performance Appraisals</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">Track scores, evaluate productivity, set goals, and review manager feedback.</p>
          </div>
          {isHR() && activeTab === "appraisals" && (
            <Button variant="primary" onClick={handleOpenAdd} className="flex items-center gap-1.5 py-2 text-xs">
              <Plus size={14} />
              <span>Create New Appraisal</span>
            </Button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100 font-mono">Total Reviews</span>
            <p className="text-3xl font-normal font-mono mt-2">{reviews.length}</p>
            <p className="text-[10px] text-cyan-100/80 mt-1 font-body">Appraisals on record</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Avg Rating</span>
            <p className="text-3xl font-normal font-mono text-amber-500 mt-2">
              {reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.overallRating || 0), 0) / reviews.length).toFixed(1) : '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Out of 5.0</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Goals Set</span>
            <p className="text-3xl font-normal font-mono text-[var(--brand-primary)] mt-2">{goals.length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Active milestones</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Acknowledged</span>
            <p className="text-3xl font-normal font-mono text-emerald-500 mt-2">{reviews.filter(r => r.status === 'ACKNOWLEDGED').length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Confirmed reviews</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("appraisals")}
            className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-all ${
              activeTab === "appraisals"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-250"
            }`}
          >
            Appraisals
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-all ${
              activeTab === "goals"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-250"
            }`}
          >
            Goals & Milestones
          </button>
        </div>

        {activeTab === "appraisals" ? (
          <>
            {/* Filter Bar */}
            <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MagnifyingGlass size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search appraisals by name or evaluator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-9"
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
          </>
        ) : (
          <div className="space-y-4">
            {/* Goals Control Panel */}
            {isHR() ? (
              <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={14} className="text-slate-400" />
                  <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">Select Employee:</span>
                  <select
                    value={selectedGoalEmployee}
                    onChange={(e) => setSelectedGoalEmployee(e.target.value)}
                    className="select-field py-1.5 px-3 text-xs w-48"
                  >
                    <option value="">Choose Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.employeeName} ({emp.department})</option>
                    ))}
                  </select>
                </div>
                <Button variant="primary" onClick={handleOpenAddGoal} disabled={!selectedGoalEmployee} className="flex items-center gap-1.5 text-xs py-2">
                  <Plus size={14} />
                  <span>Create Growth Goal</span>
                </Button>
              </div>
            ) : (
              <div className="p-5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Your Assigned Growth Goals</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-body">Review development milestone expectations and track progress with your manager.</p>
              </div>
            )}

            {/* Goals List */}
            {goalsLoading ? (
              <div className="flex justify-center py-10">
                <span className="w-6 h-6 border-2 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
              </div>
            ) : goals.length === 0 ? (
              <div className="p-10 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 rounded">
                {selectedGoalEmployee ? "No goals assigned to this employee." : "Please select an employee to view goals."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(goal => (
                  <Card key={goal.id} className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-mono">
                          Period: {goal.reviewPeriod}
                        </span>
                        {isHR() && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenEditGoalProgress(goal)}
                              className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
                              title="Update Status/Progress"
                            >
                              <PencilSimpleLine size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete Goal"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-250 mt-2 font-body">{goal.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-body">{goal.description}</p>
                    </div>
                    
                    <div className="mt-5 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-mono uppercase">Progress:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{goal.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded overflow-hidden">
                          <div 
                            className="h-full bg-[var(--brand-primary)] transition-all duration-300 rounded" 
                            style={{ width: `${goal.progressPercent}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-200 dark:border-slate-800 font-mono">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar size={12} />
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 mr-1 uppercase">Status:</span>
                          <Badge status={goal.status} label={goal.status.replace("_", " ")} />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Review Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={currentReview ? "Edit Performance Appraisal" : "Create New Appraisal"}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 font-body text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Select Employee *</label>
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
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Review Period *</label>
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
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Review Date *</label>
                <input
                  type="date"
                  required
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Status *</label>
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
            <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 space-y-4">
              <h4 className="text-[10px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider font-mono">Appraisal Ratings (1.0 to 5.0 scale)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-500">Productivity *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={formData.productivityRating}
                    onChange={(e) => setFormData({ ...formData, productivityRating: parseFloat(e.target.value) || 3.0 })}
                    className="input-field text-center font-mono font-medium text-slate-850 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-500">Quality of Work *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={formData.qualityRating}
                    onChange={(e) => setFormData({ ...formData, qualityRating: parseFloat(e.target.value) || 3.0 })}
                    className="input-field text-center font-mono font-medium text-slate-850 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-500">Teamwork *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={formData.teamworkRating}
                    onChange={(e) => setFormData({ ...formData, teamworkRating: parseFloat(e.target.value) || 3.0 })}
                    className="input-field text-center font-mono font-medium text-slate-850 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-500">Communication *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={formData.communicationRating}
                    onChange={(e) => setFormData({ ...formData, communicationRating: parseFloat(e.target.value) || 3.0 })}
                    className="input-field text-center font-mono font-medium text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Appraisal Feedback Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="Provide comments on employee achievements, areas of improvement..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Key Growth Goals for Next Period</label>
              <textarea
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="State 2-3 specific objectives for the next period..."
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
                Save Appraisal
              </Button>
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
            <div className="space-y-6 font-body text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-normal text-slate-900 dark:text-slate-150 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Appraisal for {isHR() ? currentReview.employeeName : user?.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">Period: {currentReview.reviewPeriod}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge status={currentReview.status} label={currentReview.status} />
                  <span className="text-[9px] text-slate-400 font-mono">Evaluated: {new Date(currentReview.reviewDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10 flex flex-col justify-center items-center text-center">
                  <Medal size={32} className="text-[var(--brand-primary)] mb-2" />
                  <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-500 font-mono">Overall Rating</span>
                  <span className="text-2xl font-normal text-slate-850 dark:text-white mt-1 font-mono">{currentReview.overallRating.toFixed(1)} / 5.0</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    <span className="text-slate-500 font-body">Productivity</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentReview.productivityRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    <span className="text-slate-500 font-body">Quality of Work</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentReview.qualityRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    <span className="text-slate-500 font-body">Teamwork</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentReview.teamworkRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Communication</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentReview.communicationRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[10px] uppercase font-semibold text-[var(--brand-primary)] block mb-1 font-mono tracking-wider">Evaluator Feedback</span>
                  <p className="text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line font-body">{currentReview.comments || "No comments provided."}</p>
                </div>

                <div className="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[10px] uppercase font-semibold text-[var(--brand-primary)] block mb-1 font-mono tracking-wider">Key Development Goals</span>
                  <p className="text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line font-body">{currentReview.goals || "No goals defined."}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Evaluator: <span className="font-semibold text-slate-700 dark:text-slate-300 font-body">{currentReview.reviewedBy}</span></span>
                {!isHR() && currentReview.status === "SUBMITTED" && (
                  <Button
                    onClick={handleAcknowledge}
                    variant="primary"
                    className="py-1.5 text-xs"
                  >
                    Acknowledge Receipt
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        <ConfirmDialog
          isOpen={isDeleteOpen}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
          title="Delete Appraisal Record"
          message="Are you sure you want to delete this performance review? This action cannot be undone."
        />

        {/* Create Goal Modal */}
        <Modal
          isOpen={isGoalFormOpen}
          onClose={() => setIsGoalFormOpen(false)}
          title="Assign Performance Goal"
          size="md"
        >
          <form onSubmit={handleCreateGoal} className="space-y-4 font-body text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Goal Title *</label>
              <input
                type="text"
                required
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                className="input-field"
                placeholder="e.g. Lead the frontend architecture modernization"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Goal Description *</label>
              <textarea
                required
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                className="input-field h-24 resize-none"
                placeholder="State the specific objectives and key results expected..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Review Period *</label>
                <input
                  type="text"
                  required
                  value={goalForm.reviewPeriod}
                  onChange={(e) => setGoalForm({ ...goalForm, reviewPeriod: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Q1 2026"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Target Date *</label>
                <input
                  type="date"
                  required
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsGoalFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Assign Goal
              </Button>
            </div>
          </form>
        </Modal>

        {/* Update Progress/Status Modal */}
        <Modal
          isOpen={isGoalProgressOpen}
          onClose={() => setIsGoalProgressOpen(false)}
          title="Update Goal Progress"
          size="md"
        >
          {selectedGoal && (
            <form onSubmit={handleUpdateGoalProgress} className="space-y-4 font-body text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Goal Title</label>
                <p className="text-xs font-semibold text-slate-805 dark:text-white mt-1">{selectedGoal.title}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Progress Percentage ({progressForm.progressPercent}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressForm.progressPercent}
                  onChange={(e) => setProgressForm({ ...progressForm, progressPercent: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-[var(--brand-primary)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Goal Status *</label>
                <select
                  required
                  value={progressForm.status}
                  onChange={(e) => setProgressForm({ ...progressForm, status: e.target.value })}
                  className="select-field"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DEFERRED">Deferred</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsGoalProgressOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Update Goal
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}
