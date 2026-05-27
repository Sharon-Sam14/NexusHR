import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Briefcase, MapPin, DollarSign, Calendar, Search, Users, ExternalLink, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { recruitmentService } from "../../services/recruitmentService";
import { departmentService } from "../../services/departmentService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Badge from "../../components/Badge";

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
          <p className="font-semibold text-white">{val}</p>
          <p className="text-[10px] text-slate-400">{row.jobType} • {row.location}</p>
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
      render: (val, row) => row.salaryMax ? `$${val.toLocaleString()} - $${row.salaryMax.toLocaleString()}` : `$${val.toLocaleString()}`,
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
        className="btn-icon text-cyan-400 hover:text-cyan-300"
        title="View Details"
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

  const filteredJobs = jobs.filter(j => {
    const matchDept = !selectedDept || j.department === selectedDept;
    const matchSearch = !searchTerm ||
      j.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.requirements.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruitment & Job Board</h1>
          <p className="page-subtitle">Publish job vacancies, manage applicants, and oversee the hiring pipelines.</p>
        </div>
        {isHR() && (
          <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} />
            <span>Create Job Opening</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by job title or requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
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
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="input-label">Job Title *</label>
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
              <label className="input-label">Department *</label>
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
              <label className="input-label">Location *</label>
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
              <label className="input-label">Job Type *</label>
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
              <label className="input-label">Min Salary (Monthly) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <DollarSign size={16} />
                </span>
                <input
                  type="number"
                  required
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: parseFloat(e.target.value) || "" })}
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="input-label">Max Salary (Monthly) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <DollarSign size={16} />
                </span>
                <input
                  type="number"
                  required
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: parseFloat(e.target.value) || "" })}
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="input-label">Number of Openings</label>
              <input
                type="number"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Recruitment Status *</label>
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
            <label className="input-label">Job Description *</label>
            <textarea
              required
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              className="input-field h-24 resize-none"
              placeholder="Provide a comprehensive job description..."
            />
          </div>

          <div className="space-y-1">
            <label className="input-label">Key Requirements / Skills (Comma-separated) *</label>
            <textarea
              required
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="e.g. Java 21, Spring Boot, React, PostgreSQL"
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
              Save Vacancy
            </button>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{currentJob.jobTitle}</h3>
                <p className="text-xs text-slate-400">{currentJob.department} • {currentJob.location}</p>
              </div>
              <Badge status={currentJob.status} label={currentJob.status} />
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase font-semibold">Job Type</span>
                <p className="font-semibold text-white mt-1">{currentJob.jobType}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase font-semibold">Open Vacancies</span>
                <p className="font-semibold text-white mt-1">{currentJob.openings} positions</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase font-semibold">Offered Compensation</span>
                <p className="font-semibold text-cyan-400 mt-1">${currentJob.salaryMin.toLocaleString()} - ${currentJob.salaryMax.toLocaleString()} / mo</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase font-semibold">Published Date</span>
                <p className="font-semibold text-white mt-1">{new Date(currentJob.postedDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-cyan-400">Description</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">{currentJob.jobDescription}</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-indigo-400">Requirements & Skills</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentJob.requirements.split(",").map(req => (
                    <span key={req} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50">
                      {req.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-600 flex justify-between">
              <span>Published By: {currentJob.postedBy}</span>
              {!isHR() && (
                <a
                  href={`mailto:hr@nexushr.com?subject=Application for ${encodeURIComponent(currentJob.jobTitle)}`}
                  className="btn-primary text-xs py-1.5 flex items-center gap-1"
                >
                  Apply internally <ExternalLink size={12} />
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
  );
}
