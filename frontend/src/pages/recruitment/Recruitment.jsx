// NexusHR: Precision Industrial Recruitment workspace.
import { useState, useEffect } from "react";
import { Plus, PencilSimpleLine, Trash, Briefcase, MapPin, CurrencyInr, Calendar, MagnifyingGlass, Users, ArrowSquareOut, FileText } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { recruitmentService } from "../../services/recruitmentService";
import { departmentService } from "../../services/departmentService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";
import { formatCurrency } from "../../utils/formatters";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Recruitment() {
  const { user, isHR } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    jobDescription: "",
    requirements: "",
    location: "Remote",
    jobType: "Full-Time",
    salaryMin: "",
    salaryMax: "",
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    resumeUrl: "",
    openings: 1,
    postedDate: new Date().toISOString().split("T")[0],
    closingDate: "",
    status: "OPEN",
    postedBy: user?.name || "HR Manager",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobData, deptData] = await Promise.all([
        recruitmentService.getAll(),
        departmentService.getAll(),
      ]);
      setJobs(jobData);
      setDepartments(deptData);
    } catch (error) {
      console.error("Failed to load recruitment data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setCurrentJob(null);
    setFormData({
      jobTitle: "",
      department: "",
      jobDescription: "",
      requirements: "",
      location: "Remote",
      jobType: "Full-Time",
      salaryMin: 4000,
      salaryMax: 8000,
      applicantName: "",
      applicantEmail: "",
      applicantPhone: "",
      resumeUrl: "",
      openings: 1,
      postedDate: new Date().toISOString().split("T")[0],
      closingDate: "",
      status: "OPEN",
      postedBy: user?.name || "HR Manager",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (job) => {
    setCurrentJob(job);
    setFormData({
      jobTitle: job.jobTitle || "",
      department: job.department || "",
      jobDescription: job.jobDescription || "",
      requirements: job.requirements || "",
      location: job.location || "Remote",
      jobType: job.jobType || "Full-Time",
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
      applicantName: job.applicantName || "",
      applicantEmail: job.applicantEmail || "",
      applicantPhone: job.applicantPhone || "",
      resumeUrl: job.resumeUrl || "",
      openings: job.openings || 1,
      postedDate: job.postedDate || "",
      closingDate: job.closingDate || "",
      status: job.status || "OPEN",
      postedBy: job.postedBy || user?.name || "HR Manager",
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (job) => {
    setCurrentJob(job);
    setIsDeleteOpen(true);
  };

  const handleOpenView = (job) => {
    setCurrentJob(job);
    setIsViewOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentJob) {
        await recruitmentService.update(currentJob.id, formData);
      } else {
        await recruitmentService.create(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to save job posting: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    try {
      await recruitmentService.delete(currentJob.id);
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to delete job: " + (error.response?.data?.message || error.message));
    }
  };

  // Columns Configuration
  const columns = [
    {
      key: "jobTitle",
      label: "Role",
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{val}</p>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{row.jobType} • {row.location}</p>
        </div>
      ),
    },
    { key: "department", label: "Department" },
    {
      key: "openings",
      label: "Openings",
      render: (val) => `${val} ${val === 1 ? "position" : "positions"}`,
    },
    {
      key: "salaryMin",
      label: "Salary Range",
      render: (val, row) => row.salaryMax ? `${formatCurrency(val)} – ${formatCurrency(row.salaryMax)}` : formatCurrency(val),
    },
    {
      key: "postedDate",
      label: "Posted Date",
      render: (val) => val ? new Date(val).toLocaleDateString() : "—",
    },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleOpenView(row)}
        className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
        title="View Details"
      >
        <FileText size={15} />
      </button>
      {isHR() && (
        <>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
            title="Edit"
          >
            <PencilSimpleLine size={15} />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1 rounded text-red-505 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash size={15} />
          </button>
        </>
      )}
    </div>
  );

  const filteredJobs = jobs.filter(j => {
    const matchDept = !selectedDept || j.department === selectedDept;
    const matchSearch = !searchTerm ||
      j.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.requirements.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Recruitment & Job Board</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">Publish job vacancies, manage applicants, and oversee the hiring pipelines.</p>
          </div>
          {isHR() && (
            <Button variant="primary" onClick={handleOpenAdd} className="flex items-center gap-1.5 py-2 text-xs">
              <Plus size={14} />
              <span>Create Job Opening</span>
            </Button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100 font-mono">Total Jobs</span>
            <p className="text-3xl font-normal font-mono mt-2">{jobs.length}</p>
            <p className="text-[10px] text-cyan-100/80 mt-1 font-body">Postings created</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Open</span>
            <p className="text-3xl font-normal font-mono text-emerald-500 mt-2">{jobs.filter(j => j.status === 'OPEN').length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Active vacancies</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">In Review</span>
            <p className="text-3xl font-normal font-mono text-amber-500 mt-2">{jobs.filter(j => j.status === 'IN_REVIEW').length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Being evaluated</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Closed</span>
            <p className="text-3xl font-normal font-mono text-slate-500 mt-2">{jobs.filter(j => j.status === 'CLOSED').length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Filled positions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MagnifyingGlass size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by job title or requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="select-field py-2 text-xs md:w-48"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Jobs list */}
        <DataTable
          columns={columns}
          data={filteredJobs}
          loading={loading}
          actions={actions}
        />

        {/* Add / Edit Job Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={currentJob ? "Edit Job Vacancy" : "Create New Job vacancy"}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 font-body text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Lead Software Architect"
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
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Remote, Dallas Office, Hybrid"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Job Type *</label>
                <select
                  required
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="select-field"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Min Salary (Monthly) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: parseFloat(e.target.value) || "" })}
                    className="input-field pl-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Max Salary (Monthly) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CurrencyInr size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: parseFloat(e.target.value) || "" })}
                    className="input-field pl-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Number of Openings</label>
                <input
                  type="number"
                  value={formData.openings}
                  onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                  className="input-field font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Recruitment Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="select-field"
                >
                  <option value="OPEN">Open</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFER_EXTENDED">Offer Extended</option>
                  <option value="HIRED">Hired</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Job Description *</label>
              <textarea
                required
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                className="input-field h-24 resize-none"
                placeholder="Provide a comprehensive job description..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Key Requirements / Skills (Comma-separated) *</label>
              <textarea
                required
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="e.g. Java 21, Spring Boot, React, PostgreSQL"
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
                Save Vacancy
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Job Info Modal */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Job Opening Details"
          size="md"
        >
          {currentJob && (
            <div className="space-y-6 font-body text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-normal text-slate-900 dark:text-slate-150 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{currentJob.jobTitle}</h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">{currentJob.department} • {currentJob.location}</p>
                </div>
                <Badge status={currentJob.status} label={currentJob.status} />
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Job Type</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1 font-body">{currentJob.jobType}</p>
                </div>
                <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Open Vacancies</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{currentJob.openings} positions</p>
                </div>
                <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Offered Compensation</span>
                  <p className="font-medium text-[var(--brand-primary)] mt-1">{formatCurrency(currentJob.salaryMin)} – {formatCurrency(currentJob.salaryMax)} / mo</p>
                </div>
                <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Published Date</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{new Date(currentJob.postedDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-550 block font-mono tracking-wider">Description</span>
                  <p className="text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/10 p-3 rounded border border-slate-200 dark:border-slate-800/60 font-body">{currentJob.jobDescription}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-550 block font-mono tracking-wider">Requirements & Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 font-mono text-[10px]">
                    {currentJob.requirements.split(",").map(req => (
                      <span key={req} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-805 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {req.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-[10px] text-slate-500 flex justify-between items-center font-mono">
                <span>Published By: <span className="font-body text-slate-700 dark:text-slate-300 font-medium">{currentJob.postedBy}</span></span>
                {!isHR() && (
                  <a
                    href={`mailto:hr@nexushr.com?subject=Application for ${encodeURIComponent(currentJob.jobTitle)}`}
                  >
                    <Button variant="primary" className="py-1 px-3 text-xs flex items-center gap-1">
                      <span>Apply internally</span>
                      <ArrowSquareOut size={12} />
                    </Button>
                  </a>
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
          title="Delete Job vacancy"
          message="Are you sure you want to delete this job posting? This will remove it from the recruitment directory."
        />
      </div>
    </PageTransition>
  );
}
