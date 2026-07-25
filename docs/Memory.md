# NexusHR AI Developer Memory & Context Manifest

This document serves as the master context memory block for the **NexusHR** platform. Load this file into your LLM prompt window before adding features, modifying entities, writing tests, or updating configuration files.

---

## 1. System DNA & Architecture

NexusHR is a modular monolith backend written in Spring Boot 3.2.5 (Java 21) paired with a React 18 frontend bundled via Vite.

```
                             ┌─────────────────────────────────┐
                             │       Vite React Client         │
                             │         (Port 5173)             │
                             └────────────────┬────────────────┘
                                              │ REST / HTTPS
                                              ▼
                             ┌─────────────────────────────────┐
                             │    Spring Boot Monolith         │
                             │         (Port 8081)             │
                             └────────────────┬────────────────┘
                                              │ JDBC
                                              ▼
                             ┌─────────────────────────────────┐
                             │      PostgreSQL Database        │
                             │         (Port 5432)             │
                             └─────────────────────────────────┘
```

### Key Ports:
*   **Frontend client**: `http://localhost:5173`
*   **Backend server**: `http://localhost:8081`
*   **Database server**: `http://localhost:5432` (database: `nexushr`)

---

## 2. Shared Domain Models & Tables (PostgreSQL)

The system manages 14 primary database tables, mapped using Spring Data JPA in the `common` submodule.

| Table Name | Entity Class | Primary Responsibility | Key Columns |
| :--- | :--- | :--- | :--- |
| `users` | `User.java` | Credentials, JWT logins, reset mappings | `id`, `email` (unique), `password` (BCrypt), `role` (`ADMIN`/`HR`/`EMPLOYEE`), `employee_id` |
| `employees` | `Employee.java` | Identity, base salary, details, leave pool | `id`, `email` (unique), `salary`, `leave_balance` (default 15), `status` (`ACTIVE`/`INACTIVE`/etc.) |
| `departments` | `Department.java` | Company structural departments | `id`, `name` (unique), `description`, `head_name` |
| `attendance` | `Attendance.java` | Daily check-in/out records | `id`, `employee_id`, `date`, `check_in`, `check_out`, `work_hours`, `status` |
| `leave_requests` | `LeaveRequest.java` | Applications for leave | `id`, `employee_id`, `start_date`, `end_date`, `total_days`, `status` |
| `payrolls` | `Payroll.java` | Monthly salary calculations | `id`, `employee_id`, `month`, `year`, `net_salary`, `status` |
| `salary_approval_requests` | `SalaryApprovalRequest.java` | Salary adjustment history | `id`, `employee_id`, `proposed_salary`, `status` |
| `goals` | `Goal.java` | Employee performance goals | `id`, `employee_id`, `title`, `progress_percent` |
| `performance_reviews` | `Performance.java` | Employee appraisal ratings | `id`, `employee_id`, `overall_rating` |
| `recruitment` | `Recruitment.java` | Job listings and applicant details | `id`, `job_title`, `status` |
| `employee_documents` | `EmployeeDocument.java` | Uploaded document metadata | `id`, `employee_id`, `file_name`, `file_path` |
| `notifications` | `Notification.java` | System alerts and notifications | `id`, `user_email`, `read`, `type` |
| `refresh_tokens` | `RefreshToken.java` | Long-lived user sessions | `id`, `token` (unique), `user_id`, `revoked` |
| `audit_logs` | `AuditLog.java` | Security audit trail | `id`, `actor`, `action`, `timestamp` |

---

## 3. Strict Rules & Constraints

Before implementing any modifications, you must adhere to the following rules:
1.  **Direct Salary Changes Blocked**: Users with the `HR` role cannot modify base salaries directly. Salary changes must be requested through `SalaryApprovalRequest` and approved by Admin.
2.  **Clock-In Constraints**: Employees can only check in once per day.
3.  **Leave Verification**: Leave requests must be verified against the employee's leave balance before submission.
4.  **Ownership Verification**: Methods annotated with `@PreAuthorize("@securityHelper.isOwner(#id)")` verify that the user's role has permission to access the endpoint.
5.  **Audit Logs**: Major system actions must create log entries using the audit logs module.

---

## 4. API Endpoints

*   `POST /api/auth/login`: Authenticates a user and returns credentials and tokens.
*   `POST /api/auth/refresh`: Rotates the user's refresh token.
*   `POST /api/attendance/check-in/{employeeId}`: Logs check-ins and broadcasts punch events over SSE.
*   `POST /api/leave/apply`: Verifies leave balance and submits leave requests.
*   `POST /api/payroll/batch/run`: Runs monthly payroll calculations asynchronously.
*   `POST /api/payroll/salary-approval/{id}/approve`: Updates employee salaries and recalculates unpaid payroll records.
