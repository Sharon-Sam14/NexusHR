
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Pages
import Dashboard from "../pages/dashboard/Dashboard";
import Employees from "../pages/employees/Employees";
import Attendance from "../pages/attendance/Attendance";
import LeaveManagement from "../pages/leave/LeaveManagement";
import Payroll from "../pages/payroll/Payroll";
import Performance from "../pages/performance/Performance";
import Recruitment from "../pages/recruitment/Recruitment";
import Notifications from "../pages/notifications/Notifications";
import Profile from "../pages/profile/Profile";
import Departments from "../pages/departments/Departments";
import AiInsights from "../pages/insights/AiInsights";
import Schedule from "../pages/schedule/Schedule";
import UserManagement from "../pages/users/UserManagement";
import AuditLogs from "../pages/audit/AuditLogs";

export default function AppRoutes() {
  const { isHR, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Protected Routes inside MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/employees"
          element={isHR() ? <Employees /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<LeaveManagement />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/performance" element={<Performance />} />
        <Route
          path="/recruitment"
          element={isHR() ? <Recruitment /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/departments"
          element={isHR() ? <Departments /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/schedule" element={<Schedule />} />
        <Route
          path="/insights"
          element={isHR() ? <AiInsights /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/users"
          element={isAdmin() ? <UserManagement /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/audit-logs"
          element={isAdmin() ? <AuditLogs /> : <Navigate to="/dashboard" replace />}
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
