import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Briefcase, Mail, Phone, Calendar, MapPin, KeyRound, Check, UploadCloud, Trash2, Download, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { employeeService } from "../../services/employeeService";
import LoadingSpinner from "../../components/LoadingSpinner";
import Badge from "../../components/Badge";
import { formatFileSize } from "../../utils/formatters";

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
      const response = await fetch(`http://localhost:8081/api/documents/${docId}/download`, {
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
      // Stub password update — can connect to user update endpoint if backend supports
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner Avatar card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/20 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl rounded-full" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-cyan-500/10">
          {initials}
        </div>
        <div className="text-center md:text-left flex-1 space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white">{profileName}</h2>
            {employee?.status && (
              <div className="inline-flex justify-center md:justify-start">
                <Badge status={employee.status} label={employee.status} />
              </div>
            )}
          </div>
          <p className="text-sm text-cyan-400 font-medium">{employee?.designation || user?.role}</p>
          <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1">
            <Mail size={12} className="text-slate-500" />
            <span>{profileEmail}</span>
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("PERSONAL")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === "PERSONAL"
            ? "border-cyan-500 text-white bg-slate-900/10"
            : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <User size={14} />
          <span>Personal Info</span>
        </button>
        <button
          onClick={() => setActiveTab("JOB")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === "JOB"
            ? "border-cyan-500 text-white bg-slate-900/10"
            : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Briefcase size={14} />
          <span>Job details</span>
        </button>
        <button
          onClick={() => setActiveTab("SECURITY")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === "SECURITY"
            ? "border-cyan-500 text-white bg-slate-900/10"
            : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Shield size={14} />
          <span>Security</span>
        </button>
        {user?.employee?.id && (
          <button
            onClick={() => setActiveTab("DOCUMENTS")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === "DOCUMENTS"
              ? "border-cyan-500 text-white bg-slate-900/10"
              : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <FileText size={14} />
            <span>Documents</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="glass-card p-6 border border-slate-700/50">
        {activeTab === "PERSONAL" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-semibold">Phone Number</span>
                <p className="text-slate-200 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                  <Phone size={13} className="text-slate-500" />
                  <span>{employee?.phone || "—"}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-semibold">Home Address</span>
                <p className="text-slate-200 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                  <MapPin size={13} className="text-slate-500" />
                  <span>{employee?.address || "—"}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-semibold">Date of Birth</span>
                <p className="text-slate-200 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                  <Calendar size={13} className="text-slate-500" />
                  <span>{employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "—"}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-semibold">Gender</span>
                <p className="text-slate-200 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                  <User size={13} className="text-slate-500" />
                  <span>{employee?.gender || "—"}</span>
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-slate-500 uppercase font-semibold">Emergency Contact</span>
                <p className="text-slate-200 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                  <Shield size={13} className="text-slate-500" />
                  <span>{employee?.emergencyContact || "—"}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "JOB" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Employment Information</h3>
            {employee ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 uppercase font-semibold">Department</span>
                  <p className="text-slate-200 text-sm font-medium mt-0.5">{employee.department}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 uppercase font-semibold">Designation</span>
                  <p className="text-slate-200 text-sm font-medium mt-0.5">{employee.designation}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 uppercase font-semibold">Joining Date</span>
                  <p className="text-slate-200 text-sm font-medium mt-0.5">{new Date(employee.joiningDate).toLocaleDateString()}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 uppercase font-semibold">Compensation Plan</span>
                  <p className="text-slate-200 text-sm font-medium mt-0.5">${employee.salary.toLocaleString()} / month</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No linked job information found.</p>
            )}
          </div>
        )}

        {activeTab === "SECURITY" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Account Security</h3>
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              {passwordStatus && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs font-semibold">
                  <Check size={16} />
                  <span>{passwordStatus}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-semibold">
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="input-label">Current Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-field pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="input-label">New Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="input-label">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Update Password
              </button>
            </form>
          </div>
        )}

        {activeTab === "DOCUMENTS" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Employee Documents</h3>
            {/* File Dropzone/Input */}
            <div className="p-6 border border-dashed border-slate-700 rounded-2xl bg-slate-900/40 text-center flex flex-col items-center justify-center space-y-3">
              <UploadCloud size={32} className="text-cyan-400 animate-pulse" />
              <div>
                <p className="text-xs text-white font-medium">Drag and drop file here, or click to upload</p>
                <p className="text-[10px] text-slate-505 mt-1">Supported files: PDF, Word, JPEG, PNG (max 10MB)</p>
              </div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => document.getElementById("file-upload").click()}
                className="btn-primary text-xs py-2 px-4"
              >
                Choose File
              </button>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Uploaded Files ({documents.length})</h4>
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800/40 flex items-center justify-center text-cyan-400">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {formatFileSize(doc.fileSize)} • Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadFile(doc.id, doc.fileName)}
                          className="btn-icon text-cyan-400 hover:text-cyan-300"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(doc.id)}
                          className="btn-icon text-red-400 hover:text-red-305"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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
      </div>
    </div>
  );
}
