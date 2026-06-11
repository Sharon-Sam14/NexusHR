// NexusHR: Precision Industrial Profile workspace.
import { useState, useEffect } from "react";
import { User, Shield, Briefcase, EnvelopeSimple, Phone, Calendar, MapPin, Key, Check, CloudArrowUp, Trash, DownloadSimple, FileText } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { employeeService } from "../../services/employeeService";
import LoadingSpinner from "../../components/LoadingSpinner";
import Badge from "../../components/Badge";
import { formatFileSize, formatCurrency } from "../../utils/formatters";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Profile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PERSONAL"); // PERSONAL, JOB, SECURITY, DOCUMENTS
  const [documents, setDocuments] = useState([]);

  // Security Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user?.employee?.id) {
      fetchEmployeeDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDocuments = async (empId) => {
    try {
      const docs = await employeeService.getDocuments(empId);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents", error);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const data = await employeeService.getById(user.employee.id);
      setEmployee(data);
      await fetchDocuments(user.employee.id);
    } catch (error) {
      console.error("Failed to load employee details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await employeeService.uploadDocument(user.employee.id, formData);
      fetchDocuments(user.employee.id);
    } catch (error) {
      alert("Failed to upload file: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDownloadFile = async (docId, fileName) => {
    try {
      const token = localStorage.getItem("nexushr_token");
      const response = await fetch(`/api/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download document");
    }
  };

  const handleDeleteFile = async (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await employeeService.deleteDocument(docId);
        fetchDocuments(user.employee.id);
      } catch (error) {
        alert("Failed to delete document");
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordStatus("Password changed successfully (mocked).");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError("Failed to update password.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Display name/details fallback if employee is not linked
  const profileName = employee?.employeeName || user?.name || "System User";
  const profileEmail = employee?.email || user?.email || "—";
  const initials = profileName.split(" ").map(w => w[0]).join("").substring(0, 2);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner Avatar card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-cyan-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[var(--brand-primary)]/20 relative z-10 flex-shrink-0 select-none">
            {initials}
          </div>
          <div className="text-center md:text-left flex-1 space-y-1 z-10 font-body">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{profileName}</h2>
              {employee?.status && (
                <div className="inline-flex justify-center md:justify-start">
                  <Badge status={employee.status} label={employee.status} />
                </div>
              )}
            </div>
            <p className="text-xs text-[var(--brand-primary)] uppercase tracking-wider font-semibold font-mono">{employee?.designation || user?.role}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1 font-mono">
              <EnvelopeSimple size={12} />
              <span>{profileEmail}</span>
            </p>
            {employee?.department && (
              <p className="text-[10px] text-slate-400 font-body flex items-center gap-1">
                <Briefcase size={11} />
                <span>{employee.department}</span>
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 font-body">
          <button
            onClick={() => setActiveTab("PERSONAL")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase border-b-2 transition-all ${activeTab === "PERSONAL"
              ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <User size={14} />
            <span>Personal Info</span>
          </button>
          <button
            onClick={() => setActiveTab("JOB")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase border-b-2 transition-all ${activeTab === "JOB"
              ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Briefcase size={14} />
            <span>Job details</span>
          </button>
          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase border-b-2 transition-all ${activeTab === "SECURITY"
              ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Shield size={14} />
            <span>Security</span>
          </button>
          {user?.employee?.id && (
            <button
              onClick={() => setActiveTab("DOCUMENTS")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase border-b-2 transition-all ${activeTab === "DOCUMENTS"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileText size={14} />
              <span>Documents</span>
            </button>
          )}
        </div>

        {/* Tab Panels */}
        <Card className="p-6 font-body">
          {activeTab === "PERSONAL" && (
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2 font-mono">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Phone Number</span>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1.5 mt-0.5 font-mono">
                    <Phone size={13} className="text-slate-400" />
                    <span>{employee?.phone || "—"}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Home Address</span>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{employee?.address || "—"}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Date of Birth</span>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1.5 mt-0.5 font-mono">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "—"}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Gender</span>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                    <User size={13} className="text-slate-400" />
                    <span>{employee?.gender || "—"}</span>
                  </p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Emergency Contact</span>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                    <Shield size={13} className="text-slate-400" />
                    <span>{employee?.emergencyContact || "—"}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "JOB" && (
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2 font-mono">Employment Information</h3>
              {employee ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Department</span>
                    <p className="text-slate-850 dark:text-slate-200 text-sm font-medium mt-0.5">{employee.department}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Designation</span>
                    <p className="text-slate-850 dark:text-slate-200 text-sm font-medium mt-0.5">{employee.designation}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Joining Date</span>
                    <p className="text-slate-850 dark:text-slate-200 text-sm font-medium mt-0.5 font-mono">{new Date(employee.joiningDate).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Compensation Plan</span>
                    <p className="text-slate-850 dark:text-slate-200 text-sm font-medium mt-0.5 font-mono">{formatCurrency(employee.salary)} / month</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No linked job information found.</p>
              )}
            </div>
          )}

          {activeTab === "SECURITY" && (
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2 font-mono">Account Security</h3>
              <form onSubmit={handlePasswordChange} className="max-w-md space-y-4 text-xs font-body">
                {passwordStatus && (
                  <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-600 dark:text-emerald-450 font-semibold">
                    <Check size={16} />
                    <span>{passwordStatus}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="p-3.5 rounded bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-600 dark:text-red-400 font-semibold">
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Current Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Key size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="input-field pl-9 font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">New Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Key size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="input-field pl-9 font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Key size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="input-field pl-9 font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full py-2.5">
                  Update Password
                </Button>
              </form>
            </div>
          )}

          {activeTab === "DOCUMENTS" && (
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2 font-mono">Employee Documents</h3>
              {/* File Dropzone/Input */}
              <div className="p-6 border border-dashed border-slate-355 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/10 text-center flex flex-col items-center justify-center space-y-3">
                <CloudArrowUp size={28} className="text-[var(--brand-primary)]" />
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">Drag and drop file here, or click to upload</p>
                  <p className="text-[10px] text-slate-500 mt-1">Supported files: PDF, Word, JPEG, PNG (max 10MB)</p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => document.getElementById("file-upload").click()}
                  className="text-xs py-1.5 px-4"
                >
                  Choose File
                </Button>
              </div>

              {/* Documents List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Uploaded Files ({documents.length})</h4>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center text-[var(--brand-primary)] border border-slate-200 dark:border-slate-800">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md">{doc.fileName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                              {formatFileSize(doc.fileSize)} • Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadFile(doc.id, doc.fileName)}
                            className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
                            title="Download"
                          >
                            <DownloadSimple size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(doc.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No documents uploaded yet.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
