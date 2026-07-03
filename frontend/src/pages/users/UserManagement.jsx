import { useState, useEffect } from "react";
import { Plus, PencilSimpleLine, Lock, LockOpen, Key, EnvelopeSimple, User, ShieldCheck } from "@phosphor-icons/react";
import { userService } from "../../services/userService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import PageTransition from "../../layouts/PageTransition";
import Button from "../../components/ui/Button";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Selected User
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });
  const [roleForm, setRoleForm] = useState({ role: "EMPLOYEE" });
  const [passwordForm, setPasswordForm] = useState({ password: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHrModal = () => {
    setHrForm({ name: "", email: "", password: "" });
    setIsHrModalOpen(true);
  };

  const handleCreateHr = async (e) => {
    e.preventDefault();
    try {
      await userService.createHr(hrForm);
      setIsHrModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert("Failed to create HR user: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setRoleForm({ role: user.role });
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await userService.updateRole(selectedUser.id, roleForm.role);
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordForm({ password: "" });
    setIsPasswordModalOpen(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await userService.resetPassword(selectedUser.id, passwordForm.password);
      setIsPasswordModalOpen(false);
      alert("Password reset successfully!");
    } catch (err) {
      alert("Failed to reset password: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleLock = async (user) => {
    const action = user.active ? "lock" : "unlock";
    if (window.confirm(`Are you sure you want to ${action} the account for ${user.name}?`)) {
      try {
        await userService.lockAccount(user.id, !user.active);
        fetchUsers();
      } catch (err) {
        alert("Failed to lock/unlock user: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-slate-105 dark:bg-slate-805 flex items-center justify-center font-mono font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs">
            {val.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-850 dark:text-slate-200">{val}</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "System Role",
      render: (val) => (
        <Badge
          status={val === "ADMIN" ? "PAID" : val === "HR" ? "PENDING" : "ON_LEAVE"}
          label={val}
        />
      ),
    },
    {
      key: "active",
      label: "Account Status",
      render: (val) => (
        <Badge
          status={val ? "PRESENT" : "ABSENT"}
          label={val ? "ACTIVE" : "LOCKED"}
        />
      ),
    },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleOpenRoleModal(row)}
        className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
        title="Change Role"
      >
        <PencilSimpleLine size={15} />
      </button>
      <button
        onClick={() => handleOpenPasswordModal(row)}
        className="p-1 rounded text-amber-500 hover:bg-amber-500/10 transition-colors"
        title="Reset Password"
      >
        <Key size={15} />
      </button>
      <button
        onClick={() => handleToggleLock(row)}
        className={`p-1 rounded transition-colors ${row.active ? "text-emerald-500 hover:bg-emerald-500/10" : "text-red-500 hover:bg-red-500/10"}`}
        title={row.active ? "Lock Account" : "Unlock Account"}
      >
        {row.active ? <LockOpen size={15} /> : <Lock size={15} />}
      </button>
    </div>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>User Management</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">Onboard HR users, assign roles, reset credentials, and audit active users.</p>
          </div>
          <Button variant="primary" onClick={handleOpenHrModal} className="flex items-center gap-1.5 py-2 text-xs">
            <Plus size={14} />
            <span>Create HR User</span>
          </Button>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          actions={actions}
        />

        {/* Create HR User Modal */}
        <Modal
          isOpen={isHrModalOpen}
          onClose={() => setIsHrModalOpen(false)}
          title="Create HR Account"
          size="md"
        >
          <form onSubmit={handleCreateHr} className="space-y-4 font-body text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Full Name *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  required
                  value={hrForm.name}
                  onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })}
                  className="input-field pl-9"
                  placeholder="HR Name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Email Address *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <EnvelopeSimple size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={hrForm.email}
                  onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })}
                  className="input-field pl-9"
                  placeholder="hr@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Password *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Key size={14} />
                </span>
                <input
                  type="password"
                  required
                  value={hrForm.password}
                  onChange={(e) => setHrForm({ ...hrForm, password: e.target.value })}
                  className="input-field pl-9"
                  placeholder="Password (minimum 6 characters)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsHrModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Onboard HR
              </Button>
            </div>
          </form>
        </Modal>

        {/* Change User Role Modal */}
        <Modal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          title="Change System Role"
          size="sm"
        >
          {selectedUser && (
            <form onSubmit={handleUpdateRole} className="space-y-4 font-body text-xs">
              <p className="text-slate-500">
                Updating role for <span className="font-semibold">{selectedUser.name}</span> ({selectedUser.email}).
              </p>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">System Role *</label>
                <select
                  required
                  value={roleForm.role}
                  onChange={(e) => setRoleForm({ role: e.target.value })}
                  className="select-field"
                >
                  <option value="EMPLOYEE">Employee (Limited Self-Service)</option>
                  <option value="HR">HR Manager (Workforce Operations)</option>
                  <option value="ADMIN">System Administrator (Full System Control)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsRoleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Role
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Reset User Password"
          size="sm"
        >
          {selectedUser && (
            <form onSubmit={handleResetPassword} className="space-y-4 font-body text-xs">
              <p className="text-slate-500">
                Set a new password for <span className="font-semibold">{selectedUser.name}</span>.
              </p>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">New Password *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ password: e.target.value })}
                    className="input-field pl-9"
                    placeholder="New Secure Password"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}
