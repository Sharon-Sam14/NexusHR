# NexusHR: Exhaustive Enterprise AI Knowledge Base & Handoff Specification

This document provides a complete technical reference for **NexusHR**, an enterprise-grade AI-powered Smart HR Management System. This knowledge base has been written to allow other AI coding assistants (e.g., Gemini, Claude, ChatGPT, Cursor, Codex) to immediately understand, maintain, debug, and expand the entire repository without having to read each source file manually.

---

# 1. Complete Architecture Summary

NexusHR uses a split client-server architecture. It features a React 18 Single Page Application (SPA) client and a Spring Boot 3.2.5 Java 21 backend.

## 1.1 Backend Architecture
The backend is structured as a multi-module Maven project. Although it has separate submodules, it functions as a modular monolith running in a single JVM. All submodules share a PostgreSQL database (port `5432`) and run on port `8081`. 

```
                                  [ Maven Root POM ]
                                          │
    ┌──────────────┬──────────────┬───────┴──────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼              ▼
[ common ]  [ auth-service ] [ employee- ] [ attendance- ]  [ payroll- ]  [ performance- ]
                                service ]     service ]      service ]       service ]
```
*   **`common`**: Shared enums, domain DTOs, audit logger aspect, and the global exception handler.
*   **`auth-service`**: Handles user login, BCrypt hashing, JWT creation, and session management using opaque refresh tokens.
*   **`employee-service`**: Manages the employee directory, departments, recruitment, onboarding checklist workflows, and local document uploads.
*   **`attendance-service`**: Records check-ins and check-outs, handles manual corrections, manages leave applications, and maintains the `LeaveBalanceEngine`.
*   **`payroll-service`**: Performs salary calculations, processes progressive tax brackets, computes overtime, and manages bulk monthly payroll runs and revisions.
*   **`performance-service`**: Manages performance appraisal cycles, tracks progress goals, and aggregates performance feedback.
*   **`ai-service`**: Performs rule-based attrition forecasting, maps skill gaps, and runs the simulated RAG co-pilot chatbot.
*   **`notification-service`**: Dispatches system alerts and runs SMTP email and Twilio SMS simulators.
*   **`app`**: The application entry point. Hosts the central Spring Boot configuration, seeds default data, and calculates dashboard statistics.

## 1.2 Frontend Architecture
The client is a React SPA built with Vite. It uses Tailwind CSS for styling, Framer Motion for UI animations, Recharts for dashboard charts, and the Phosphor Icons library.
*   **Routing**: React Router v6 manages application routes. Protected routes are protected by a client-side role guard (`ProtectedRoute.jsx`).
*   **State Management**: React Context handles global states, including `AuthContext` (session details), `ThemeContext` (persisting dark/light mode configurations to local storage), and `NotificationContext` (polling for system alerts).
*   **API Layer**: The application uses Axios. A request interceptor appends the JWT access token to every request. A response interceptor automatically handles `401 Unauthorized` errors by calling `/api/auth/refresh` to rotate credentials and retry the failed request.

---

# 2. Complete Folder-by-Folder Explanation

## 2.1 Backend Folder Layout
*   `backend/pom.xml`: Root POM file. Declares module dependencies, build plugins, and packages (`common`, `auth-service`, `employee-service`, `attendance-service`, `payroll-service`, `performance-service`, `ai-service`, `notification-service`, `app`).
*   `backend/common/src/main/java/com/nexushr/`:
    *   `common/aspect/`: `AuditLogAspect.java` intercepts controller methods to log user actions.
    *   `dto/`: Houses DTOs like `LoginRequest`, `EmployeeDTO`, `LeaveRequestDTO`, and `SalaryApprovalRequestDTO`.
    *   `entity/`: Contains domain enums including `Role`, `EmployeeStatus`, `AttendanceStatus`, `LeaveStatus`, and `PayrollStatus`.
    *   `exception/`: `GlobalExceptionHandler.java` catches exceptions and formats them into standardized JSON error responses.
    *   `util/`: `AuditLogger.java` sends REST requests to log system events.
*   `backend/auth-service/src/main/java/com/nexushr/`:
    *   `controller/`: `AuthController.java` (login/logout/refresh) and `UserController.java` (user directory).
    *   `entity/`: `User.java` (login credentials) and `RefreshToken.java` (session tokens).
    *   `security/`: Contains Spring Security files, including `JwtFilter.java` (request interceptor), `JwtTokenProvider.java` (claims mapping), and `SecurityHelper.java` (ownership verification helper).
    *   `service/`: `AuthService.java` (BCrypt password validation) and `RefreshTokenService.java` (token generation and rotation).
*   `backend/employee-service/src/main/java/com/nexushr/`:
    *   `controller/`: Handles CRUD operations for employees, departments, recruitment listings, onboarding workflows, and document uploads.
    *   `entity/`: Defines entities for employees, departments, recruitment postings, and documents.
    *   `service/`: `OrgChartService.java` (generates the organizational structure tree) and `OnboardingWorkflow.java` (tracks employee onboarding progress).
*   `backend/attendance-service/src/main/java/com/nexushr/`:
    *   `controller/`: Handles check-ins/outs, manual corrections, SSE streams, and leave requests.
    *   `entity/`: `Attendance.java` and `LeaveRequest.java`.
    *   `service/`: `LeaveBalanceEngine.java` (manages leave balances) and `AttendanceEventPublisher.java` (manages active SSE connections).
*   `backend/payroll-service/src/main/java/com/nexushr/`:
    *   `controller/`: Handles payroll calculations, CSV exports, batch runs, and salary revisions.
    *   `entity/`: `Payroll.java` and `SalaryApprovalRequest.java`.
    *   `payroll/`: `PayrollCalculator.java` (computes tax brackets and overtime pay) and `PayslipGenerator.java` (creates payslip PDFs).
*   `backend/performance-service/src/main/java/com/nexushr/`:
    *   `controller/`: Handles goals, reviews, and progress tracking.
    *   `entity/`: `Performance.java` and `Goal.java`.
    *   `service/`: `FeedbackAggregator.java` (computes rating averages) and `ReviewCycleService.java` (manages appraisal cycles).
*   `backend/ai-service/src/main/java/com/nexushr/`:
    *   `ai/`: `AttritionPredictionService.java` (predicts attrition risk) and `SkillGapAnalyser.java` (maps competencies).
    *   `controller/`: `AiInsightsController.java` (exposes insights, attrition predictions, and chatbot operations).
*   `backend/notification-service/src/main/java/com/nexushr/`:
    *   `notification/`: `NotificationDispatcher.java` (sends in-app, email, and SMS notifications) and simulators for SMTP email and Twilio SMS.
*   `backend/app/src/main/java/com/nexushr/`:
    *   `BackendApplication.java`: Application entry point.
    *   `config/`: `DataSeeder.java` seeds the database with demo accounts and records on startup.
    *   `controller/`: `DashboardController.java` fetches operational statistics.

## 2.2 Frontend Folder Layout
*   `frontend/src/api/`: `axiosInstance.js` handles requests, appends access tokens, and rotates refresh tokens.
*   `frontend/src/context/`: Context hooks for `AuthContext` (logins and roles), `ThemeContext` (dark/light themes), and `NotificationContext` (unread alert polling).
*   `frontend/src/components/`: Reusable components like tables, loaders, badges, search fields, and the command palette.
*   `frontend/src/layouts/`: Page containers like `MainLayout.jsx` (includes the sidebar and topbar) and `PageTransition.jsx` (Framer Motion transitions).
*   `frontend/src/pages/`: Feature pages including `Login`, `Dashboard`, `Employees`, `Attendance`, `LeaveManagement`, `Payroll`, `Performance`, `Recruitment`, `AiInsights`, `Schedule`, and `AuditLogs`.
*   `frontend/src/services/`: Services mapping backend API endpoints to the frontend.
*   `frontend/src/routes/`: `AppRoutes.jsx` manages routing, and `ProtectedRoute.jsx` checks user authorization roles.

---

# 3. Exhaustive File-by-File Explanation (Key Files)

*   `backend/pom.xml`: The root project descriptor. Configures dependencies like `jjwt` (JWT tokens), `spring-boot-starter-security`, and `postgresql`, and maps the build order for all submodules.
*   [application.properties](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/resources/application.properties): Houses backend environment settings, including database URLs, credentials, server port (`8081`), and security configurations.
*   [SecurityConfig.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityConfig.java): Configures Spring Security. It disables CSRF, opens public endpoints (`/api/auth/**`, `/api/audit-logs` POST), enforces stateless sessions, and registers `JwtFilter`.
*   [JwtFilter.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/JwtFilter.java): Intercepts HTTP requests, parses the JWT token from the `Authorization` header or query parameters, and authenticates the user in Spring Security's context.
*   [SecurityHelper.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityHelper.java): Security component. Exposes SpEL methods (like `isOwner(employeeId)`, `isPayrollOwner(payrollId)`, and `isLeaveOwner(leaveId)`) to verify that employees only access their own records.
*   [OnboardingWorkflow.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/OnboardingWorkflow.java): Tracks employee onboarding progress across 5 steps: profile photo upload, completed personal details, at least one uploaded document, emergency contact registration, and active account status.
*   [OrgChartService.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/OrgChartService.java): Grouping service. It builds a company org chart, automatically assigning the highest-salaried employee in each department as the department head.
*   [LeaveBalanceEngine.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/attendance-service/src/main/java/com/nexushr/service/LeaveBalanceEngine.java): Manages employee leave balances, including checks before leave submission and restoring balances when requests are rejected or cancelled.
*   [AttendanceEventPublisher.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/attendance-service/src/main/java/com/nexushr/service/AttendanceEventPublisher.java): Manages Server-Sent Events (SSE) for real-time check-in and check-out logs. It stores active `SseEmitter` connections and broadcasts punch events to subscribers.
*   [PayrollCalculator.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/payroll-service/src/main/java/com/nexushr/payroll/PayrollCalculator.java): Contains formulas for tax brackets, overtime hours (1.5x pay rate), allowances, reimbursements, deductions, and net salary.
*   [PayslipGenerator.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/payroll-service/src/main/java/com/nexushr/payroll/PayslipGenerator.java): Uses the `iText 5` library to generate payslip PDFs, styling them with headers, employee details, pay breakdown tables, and audit footers.
*   [AttritionPredictionService.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/ai-service/src/main/java/com/nexushr/ai/AttritionPredictionService.java): Estimates employee attrition risk based on factors like compensation, attendance rates, tardiness, performance ratings, and tenure.
*   [HRChatbotService.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/ai-service/src/main/java/com/nexushr/ai/HRChatbotService.java): Runs the simulated RAG HR chatbot. It queries live database statistics and maps user queries to markdown answers.
*   [DataSeeder.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/java/com/nexushr/config/DataSeeder.java): Seeds departments, default users, attendance logs, leaves, goals, reviews, and notifications on startup.
*   [axiosInstance.js](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/api/axiosInstance.js): Configures Axios with interceptors. Appends JWT tokens to requests, intercepts `401` errors, calls `/api/auth/refresh` to rotate tokens, and retries failed calls.
*   [AppRoutes.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/routes/AppRoutes.jsx): Configures the React Router routing map. Protects private routes with role guards.

---

# 4. Detailed Module Analysis

---

## 4.1 Authentication Module

### 1. Purpose
Manages user registration, login, and token rotation to secure the application.

### 2. Functional Requirements
*   Register new users with default or specified roles.
*   Encrypt passwords with BCrypt.
*   Authenticate users and issue JWT access tokens and database-backed refresh tokens.
*   Implement refresh token rotation on every validation request.
*   Provide a secure password reset flow using UUID tokens.
*   Revoke sessions when a user logs out.

### 3. User Workflow
```
[User Register/Login] ──► [Submit Credentials] ──► [Receive Tokens] ──► [Access Protected Pages]
```
1.  User enters credentials on the login page (`/`).
2.  If login succeeds, the system saves the access and refresh tokens in `localStorage`.
3.  The client appends the access token to the headers of subsequent API requests.
4.  If the access token expires, the client requests a token refresh in the background.

### 4. Frontend Architecture
*   **Page**: [Login.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/pages/auth/Login.jsx) houses form fields for email and password, displays validation errors, and handles login requests.
*   **State Management**: `AuthContext.jsx` manages user state (`user`, `token`, `role`, `employeeId`, `loading`), registers logged-in sessions, and clears credentials on logout.
*   **API Calls**: `authService.js` maps endpoints like `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/forgot-password`, and `/auth/reset-password`.
*   **Validation**: Client-side validation checks for valid email formats and minimum password lengths.

### 5. Backend Architecture
*   **Controller**: `AuthController.java` handles authentication endpoints.
*   **Services**: `AuthServiceImpl.java` (authenticates credentials and creates tokens) and `RefreshTokenService.java` (manages refresh tokens).
*   **Security Config**: `SecurityConfig.java` defines access rules.
*   **Helper**: `SecurityHelper.java` verifies records ownership before processing request.

### 6. Database Schema
*   `users` table:
    *   `id` (BIGINT, PK, Auto-increment)
    *   `name` (VARCHAR, Nullable = false)
    *   `email` (VARCHAR, Unique, Nullable = false)
    *   `password` (VARCHAR, Nullable = false)
    *   `role` (VARCHAR, Nullable = false)
    *   `employee_id` (BIGINT, FK to `employees.id`, Nullable = true)
    *   `active` (BOOLEAN, default = true)
    *   `reset_token` (VARCHAR, Nullable = true)
    *   `reset_token_expiry` (TIMESTAMP, Nullable = true)
*   `refresh_tokens` table:
    *   `id` (BIGINT, PK, Auto-increment)
    *   `token` (VARCHAR, Unique, Nullable = false)
    *   `user_id` (BIGINT, FK to `users.id`, Nullable = false)
    *   `expires_at` (TIMESTAMP, Nullable = false)
    *   `revoked` (BOOLEAN, default = false)
    *   `created_at` (TIMESTAMP, default = now())

### 7. API Documentation

#### `POST /api/auth/login`
Authenticates user login credentials.
*   **Authentication**: Public.
*   **Request Body**:
    ```json
    {
      "email": "employee@nexushr.com",
      "password": "emp12345"
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "refreshToken": "8f8373b9-1d9c-4861-b4ef-f993d0fca8fb",
      "name": "Aarav Sharma",
      "email": "employee@nexushr.com",
      "role": "EMPLOYEE",
      "userId": 3,
      "employeeId": 1
    }
    ```
*   **Execution Flow**:
    1. Passes credentials to `authenticationManager.authenticate()`.
    2. Compares password hash against the stored hash in the database.
    3. Revokes all previous refresh tokens for the user ID.
    4. Generates a new access token and saves a new refresh token to the database.
    5. Returns user metadata and tokens.
*   **Errors**: Returns `401 Unauthorized` for invalid email or password.

#### `POST /api/auth/refresh`
Rotates the user's refresh token.
*   **Request Body**:
    ```json
    {
      "refreshToken": "8f8373b9-1d9c-4861-b4ef-f993d0fca8fb"
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJI...",
      "refreshToken": "9d9382b3-2b2c-4d4e-a5f6-a993d0fca2cc"
    }
    ```
*   **Execution Flow**:
    1. Verifies the old refresh token is not revoked or expired.
    2. Revokes the old token.
    3. Generates a new access token and a new refresh token.
    4. Returns the new token pair.
*   **Errors**: Returns `400 Bad Request` or throws an error if the refresh token is missing, expired, or already revoked.

### 8. Security Considerations
*   Passwords are encrypted with BCrypt.
*   Refresh token rotation helps detect and prevent replay attacks.
*   Calling the logout endpoint revokes all refresh tokens in the database.

---

## 4.2 Attendance Module

### 1. Purpose
Logs daily check-in / check-out times, calculates daily work hours, and supports manual logs and real-time streaming updates.

### 2. Functional Requirements
*   Log employee check-ins and check-outs.
*   Limit clock-ins to one per employee per day.
*   Calculate decimal work hours on check-out.
*   Support manual attendance logging and edits by HR.
*   Manage real-time status updates (like `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `ON_LEAVE`).
*   Stream punches to HR dashboards via SSE.

### 3. User Workflow
```
[Dashboard Clock Component] ──► [Click Check In] ──► [Status changes to Checked In] 
                             ──► [Click Check Out] ──► [Work hours calculated and logged]
```
1.  An employee checks in on the dashboard.
2.  The UI displays "Checked In" and shows the check-in time.
3.  At the end of the shift, the employee checks out.
4.  The system calculates and displays the day's total work hours.

### 4. Frontend Architecture
*   **Page**: [Attendance.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/pages/attendance/Attendance.jsx) lists logs, displays check-in/out buttons, and handles manual entries for HR.
*   **Components**: `AttendanceTable.jsx` displays employee list records, and clock widgets show real-time shift details.
*   **State Management**: Manages state for attendance logs, employee details, load states, and active SSE streams.
*   **Real-time SSE Connection**:
    HR dashboards connect to `/api/attendance/stream/{email}?token={jwt}` to listen for check-in events and update the UI in real-time.

### 5. Backend Architecture
*   **Controllers**: `AttendanceController.java` (CRUD APIs) and `AttendanceSseController.java` (streams punches).
*   **Services**: `AttendanceServiceImpl.java` (business logic) and `AttendanceEventPublisher.java` (manages SSE emitters).
*   **Entity**: `Attendance.java`.
*   **Repository**: `AttendanceRepository.java` (handles database operations).

### 6. Database Schema
*   `attendance` table:
    *   `id` (BIGINT, PK, Auto-increment)
    *   `employee_id` (BIGINT, FK referencing `employees.id`, Nullable = false)
    *   `date` (DATE, Nullable = false)
    *   `check_in` (TIME, Nullable = true)
    *   `check_out` (TIME, Nullable = true)
    *   `work_hours` (DOUBLE, Nullable = true)
    *   `status` (VARCHAR, Nullable = false, ENUM: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `ON_LEAVE`)
    *   `remarks` (VARCHAR, Nullable = true)

### 7. API Documentation

#### `POST /api/attendance/check-in/{employeeId}`
Records a check-in log for today.
*   **Authentication**: Bearer JWT. Gated by `@securityHelper.isOwner(#employeeId)`.
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "id": 150,
      "employeeId": 1,
      "employeeName": "Aarav Sharma",
      "department": "Engineering",
      "date": "2026-07-25",
      "checkIn": "09:00:00",
      "checkOut": null,
      "workHours": null,
      "status": "PRESENT",
      "remarks": null
    }
    ```
*   **Execution Flow**:
    1. Verifies the employee exists and has not checked in today.
    2. Creates an `Attendance` record with the current time and status `PRESENT`.
    3. Saves the record to the database.
    4. Broadcasts a "CHECK_IN" event to active SSE emitters.
    5. Writes an entry to the system audit logs.
*   **Errors**: Returns `500 Internal Server Error` if the user is already checked in.

#### `POST /api/attendance/check-out/{employeeId}`
Records a check-out log for today.
*   **Authentication**: Bearer JWT. Gated by `@securityHelper.isOwner(#employeeId)`.
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "id": 150,
      "employeeId": 1,
      "employeeName": "Aarav Sharma",
      "department": "Engineering",
      "date": "2026-07-25",
      "checkIn": "09:00:00",
      "checkOut": "18:00:00",
      "workHours": 9.00,
      "status": "PRESENT",
      "remarks": "Checked out, total hours: 9.0"
    }
    ```
*   **Execution Flow**:
    1. Fetches today's check-in log for the employee.
    2. Sets `checkOut` to the current time.
    3. Calculates decimal work hours (check-out time minus check-in time).
    4. Saves the updated record.
    5. Broadcasts the "CHECK_OUT" event over SSE.
    6. Writes an entry to the system audit logs.

### 8. Business Rules
*   **Overtime Pay**: Daily hours worked beyond **9.0 hours** are categorized as overtime and paid at **1.5 times** the standard hourly rate in the Payroll module.
*   **Late Arrival**: Checked-in times after 09:15 AM are marked as `LATE` (typically handled during manual log correction or during shifts).

---

## 4.3 Leave Management Module

### 1. Purpose
Validates leave requests, checks balances, handles approvals, and manages leave refunds.

### 2. Functional Requirements
*   Provide a leave request form.
*   Enforce leave request validation against the employee's remaining leave balance.
*   Manage leave request workflows (like `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
*   Deduct leave balance on approval and refund balances if a request is rejected or cancelled.

### 3. User Workflow
```
[Apply Leave Form] ──► [Validation & Submission] ──► [Status: PENDING] 
                   ──► [HR Review] ──► [APPROVED/REJECTED] ──► [Balance Updated]
```
1.  An employee submits a leave request specifying the type, start and end dates, and reason.
2.  The request goes to the HR review queue.
3.  HR approves or rejects the request.
4.  The system updates the employee's leave balance.

### 4. Frontend Architecture
*   **Page**: [LeaveManagement.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/pages/leave/LeaveManagement.jsx) displays leave balances, has a leave request form, and shows approval cards for HR.
*   **State Management**: React states manage active tabs (Personal vs. Management), balances, and form inputs.
*   **API Calls**: Mapped in `leaveService.js` (`apply`, `approve`, `reject`, `cancel`).

### 5. Backend Architecture
*   **Controller**: `LeaveRequestController.java` routes leave requests.
*   **Service**: `LeaveRequestServiceImpl.java` manages workflows.
*   **Balance Engine**: `LeaveBalanceEngine.java` handles leave deductions and refunds.
*   **Entity**: `LeaveRequest.java` and `LeaveType.java`.
*   **Repository**: `LeaveRequestRepository.java`.

### 6. Database Schema
*   `leave_requests` table:
    *   `id` (BIGINT, PK, Auto-increment)
    *   `employee_id` (BIGINT, FK referencing `employees.id`, Nullable = false)
    *   `leave_type` (VARCHAR, Nullable = false)
    *   `start_date` (DATE, Nullable = false)
    *   `end_date` (DATE, Nullable = false)
    *   `total_days` (INTEGER, Nullable = false)
    *   `reason` (VARCHAR, Nullable = true)
    *   `status` (VARCHAR, Nullable = false, ENUM: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`)
    *   `approved_by` (VARCHAR, Nullable = true)
    *   `approval_remarks` (VARCHAR, Nullable = true)
    *   `applied_date` (DATE, Nullable = false)

### 7. API Documentation

#### `POST /api/leave/apply`
Submits a leave request.
*   **Authentication**: Bearer JWT. Gated by `@securityHelper.isOwner(#dto.employeeId)`.
*   **Request Body**:
    ```json
    {
      "employeeId": 1,
      "leaveType": "ANNUAL",
      "startDate": "2026-08-10",
      "endDate": "2026-08-14",
      "reason": "Annual trip"
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "id": 45,
      "employeeId": 1,
      "employeeName": "Aarav Sharma",
      "department": "Engineering",
      "leaveType": "ANNUAL",
      "startDate": "2026-08-10",
      "endDate": "2026-08-14",
      "totalDays": 5,
      "reason": "Annual trip",
      "status": "PENDING",
      "appliedDate": "2026-07-25"
    }
    ```
*   **Execution Flow**:
    1. Verifies the employee exists and has enough remaining leaves.
    2. Calculates the duration in days (start date to end date inclusive).
    3. Saves the request with status `PENDING`.
    4. Dispatches notifications to HR and Admin.
    5. Writes an entry to the audit logs.

#### `PATCH /api/leave/{id}/approve`
Approves a leave request.
*   **Authentication**: Restricted to `ADMIN` and `HR`.
*   **Request Body**:
    ```json
    {
      "approvedBy": "Priya Patel",
      "remarks": "Have a great trip!"
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "id": 45,
      "status": "APPROVED",
      "approvedBy": "Priya Patel",
      "approvalRemarks": "Have a great trip!"
    }
    ```
*   **Execution Flow**:
    1. Retrieves the request and checks if its status is `PENDING`.
    2. Checks if the employee has enough leaves remaining.
    3. Deducts the leave days from the employee's balance pool.
    4. Updates the request status to `APPROVED`.
    5. Notifies the employee via email/SMS.

### 8. Business Rules
*   **Leave Balance Check**: Checked during submission and approval.
*   **Leave Cancellation**: If an employee cancels an approved leave request, the leave balance is refunded.

---

## 4.4 Payroll Module

### 1. Purpose
Computes monthly payroll, calculates taxes, overtime, bonuses, and generates payslips.

### 2. Functional Requirements
*   Generate individual payroll records.
*   Run monthly payroll processing batches.
*   Calculate overtime hours and pay based on daily logs.
*   Apply progressive tax brackets.
*   Track salary revisions using approval workflows.
*   Generate payslip PDFs and CSV files.

### 3. User Workflow
```
[Select Month/Year] ──► [Trigger Run Batch] ──► [Payrolls calculated in PROCESSED/DRAFT status]
                    ──► [Review details] ──► [Verify revisions] ──► [Download CSV / Print PDF]
```
1.  HR triggers a batch run for the month.
2.  The system calculates payroll in the background and saves records as `DRAFT` or `PROCESSED`.
3.  The Admin reviews and approves the payroll records.
4.  Employees can view and download their payslips on the UI.

### 4. Frontend Architecture
*   **Page**: [Payroll.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/pages/payroll/Payroll.jsx) handles payroll generation, lists payslips, shows revision forms, and displays the Admin approval panel.
*   **API Calls**: Mapped in `payrollService.js` (`runBatch`, `generate`, `updateStatus`, `downloadCsv`, `getSalaryRevisions`, `approveSalaryRevision`).

### 5. Backend Architecture
*   **Controllers**: `PayrollController.java` (CRUD APIs), `PayrollBatchController.java` (asynchronous batch runs and PDF generation), and `SalaryApprovalController.java` (salary revisions).
*   **Services**: `PayrollServiceImpl.java` (handles payroll logic) and `SalaryApprovalServiceImpl.java` (handles revision requests).
*   **Calculation Engine**: `PayrollCalculator.java` (calculates taxes and overtime) and `PayslipGenerator.java` (generates payslip PDFs).
*   **Entity**: `Payroll.java` and `SalaryApprovalRequest.java`.

### 6. Database Schema
*   `payrolls` table:
    *   `id` (BIGINT, PK, Auto-increment)
    *   `employee_id` (BIGINT, FK referencing `employees.id`, Nullable = false)
    *   `month` (INTEGER, Nullable = false)
    *   `year` (INTEGER, Nullable = false)
    *   `basic_salary` (DOUBLE, Nullable = false)
    *   `bonus` (DOUBLE, default = 0.0)
    *   `deductions` (DOUBLE, default = 0.0)
    *   `tax` (DOUBLE, default = 0.0)
    *   `allowances` (DOUBLE, default = 0.0)
    *   `reimbursements` (DOUBLE, default = 0.0)
    *   `net_salary` (DOUBLE, Nullable = false)
    *   `status` (VARCHAR, Nullable = false, ENUM: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PROCESSED`, `PAID`)
    *   `working_days` (INTEGER)
    *   `days_present` (INTEGER)
    *   `overtime_hours` (DOUBLE)
    *   `overtime_pay` (DOUBLE)
    *   `remarks` (VARCHAR)
*   `salary_approval_requests` table:
    *   `id` (BIGINT, PK, Auto-increment)
    *   `employee_id` (BIGINT, FK referencing `employees.id`, Nullable = false)
    *   `previous_salary` (DOUBLE, Nullable = false)
    *   `proposed_salary` (DOUBLE, Nullable = false)
    *   `reason` (VARCHAR, Nullable = false)
    *   `requested_by` (VARCHAR, Nullable = false)
    *   `requested_date` (DATE, Nullable = false)
    *   `approved_by` (VARCHAR)
    *   `action_date` (DATE)
    *   `status` (VARCHAR, Nullable = false, ENUM: `PENDING`, `APPROVED`, `REJECTED`)

### 7. API Documentation

#### `POST /api/payroll/batch/run`
Triggers an asynchronous batch run to process monthly payroll.
*   **Authentication**: Restricted to `ADMIN` and `HR`.
*   **Request Body**:
    ```json
    {
      "month": 7,
      "year": 2026,
      "bonus": 2000.0,
      "deductions": 500.0
    }
    ```
*   **Response Payload (`202 Accepted`)**:
    ```json
    {
      "message": "Payroll batch job started for 7/2026",
      "month": 7,
      "year": 2026,
      "status": "RUNNING"
    }
    ```
*   **Execution Flow**:
    1. Starts a background job using Spring's `@Async` configuration.
    2. Fetches all active employees.
    3. Calculates overtime hours from the monthly attendance logs.
    4. Calculates payroll metrics (basic salary, tax, overtime, deductions) using `PayrollCalculator`.
    5. Saves payroll records as `PROCESSED`.
    6. Returns a confirmation message immediately.

#### `GET /api/payroll/{id}/pdf`
Generates and downloads a PDF payslip for a payroll record.
*   **Authentication**: Bearer JWT. Gated by `@securityHelper.isPayrollOwner(#id)`.
*   **Response Payload**: Binary stream with header `Content-Disposition: attachment; filename="payslip_x.pdf"`.
*   **Execution Flow**:
    1. Fetches the payroll record from the database.
    2. Builds the payslip layout in memory using `iText 5`.
    3. Writes the document bytes to the HTTP response stream.

### 8. Business Rules
*   **Tax Bracket Calculation**: Applied to base salary:
    *   Base Salary $< \$50,000 \rightarrow$ **12% Tax**
    *   Base Salary $< \$100,000 \rightarrow$ **18% Tax**
    *   Base Salary $\ge \$100,000 \rightarrow$ **25% Tax**
*   **Overtime Hours**: Calculated from daily attendance logs where `workHours > 9.0`. Paid at **1.5 times** the standard hourly rate.
*   **Salary Revision Approvals**: Revisions must be submitted by HR and approved by Admin. Approved revisions automatically update the employee's base salary and recalculate any unpaid payroll records for the current month.

---

## 4.5 AI workforce Intelligence Module

### 1. Purpose
Provides rule-based attrition forecasting, design/developer competency gap calculations, and a simulated RAG co-pilot chatbot.

### 2. Functional Requirements
*   Estimate attrition risk percentages and categorize risk levels (like `LOW`, `MEDIUM`, `HIGH`).
*   Map and calculate employee skill gaps relative to their role requirements.
*   Run a simulated RAG chatbot that returns natural language answers using live database stats.

### 3. User Workflow
```
[AI Insights Panel] ──► [View Attrition Probabilities and Recommendations] 
                    ──► [Review Skill Gap Metrics] ──► [Ask Chatbot a Question]
```
1.  HR navigates to the AI Insights page (`/insights`).
2.  The UI displays attrition risks, recommendations, and skill gap charts.
3.  The user can select queries from the floating drawer to ask the AI Co-pilot for information.

### 4. Frontend Architecture
*   **Page**: [AiInsights.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/pages/insights/AiInsights.jsx) displays dashboards, charts, and chatbot interfaces.
*   **Charts**: Recharts bar charts display required vs. current skill levels.
*   **API Calls**: Mapped in `aiService.js` (`getInsights`, `chat`).

### 5. Backend Architecture
*   **Controller**: `AiInsightsController.java` handles AI-related requests.
*   **Services**:
    *   `AttritionPredictionService.java` (runs attrition logic).
    *   `SkillGapAnalyser.java` (calculates competency gaps).
    *   `HRChatbotService.java` (runs RAG chatbot queries).
    *   `AiInsightsServiceImpl.java` (aggregates dashboard data).

### 6. Database Schema
*   This module does not have dedicated AI tables. It reads data from existing tables (like `employees`, `attendance`, `performance_reviews`, `leave_requests`, `payrolls`).

### 7. API Documentation

#### `GET /api/ai/insights`
Fetches aggregated data for the AI Insights dashboard.
*   **Authentication**: Restricted to `ADMIN` and `HR`.
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "attritionRisks": [
        {
          "employeeId": 4,
          "employeeName": "Amit Mehta",
          "riskPercentage": 78.5,
          "riskLevel": "HIGH",
          "reasons": ["Salary is below company average", "High late arrival rate"],
          "recommendations": ["Initiate salary parity review"]
        }
      ],
      "skillGaps": [
        {
          "departmentName": "Engineering",
          "skillName": "System Architecture",
          "requiredLevel": 5,
          "currentLevel": 3,
          "gapPercentage": 40.0
        }
      ],
      "engagementScores": [
        {
          "employeeId": 1,
          "employeeName": "Aarav Sharma",
          "score": 95.0,
          "attendanceRate": 100.0,
          "performanceRating": 4.5
        }
      ],
      "aiRecommendations": [
        "⚠️ High Attrition Warning: Amit Mehta (Marketing) has a 78.5% attrition probability."
      ]
    }
    ```
*   **Execution Flow**:
    1. Fetches all active employees from the database.
    2. Calculates attendance and late arrival rates for each employee.
    3. Calculates engagement scores: `(attendanceRate * 0.6) + ((appraisalRating/5.0 * 100) * 0.4)`. Subtracts 5.0 if late rate $> 15\%$.
    4. Computes attrition risks based on salary benchmarks, attendance, tardiness, and tenure.
    5. Maps design/engineering roles to skill gaps based on appraisal reviews.
    6. Formats recommendations and returns the payload.

#### `POST /api/ai/chat`
Submits a query to the simulated RAG chatbot.
*   **Request Body**:
    ```json
    {
      "query": "How many employees are in the system?"
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "query": "How many employees are in the system?",
      "answer": "NexusHR currently has **5 active employees** on record across all departments.",
      "sourceContext": "Live DB Context — Employees: 5 | Leaves: 3 | Payrolls: 10"
    }
    ```
*   **Execution Flow**:
    1. Formats the input query to lowercase and removes white space.
    2. Queries live database counts (such as employees, leaves, payrolls, and reviews) to build context.
    3. Uses keyword matching to map queries to preset markdown answers.
    4. Returns the matched answer and database context.

---

# 5. Cloud Integration

NexusHR is designed for local deployment. It does not use cloud storage (like AWS S3, Google Cloud Storage, or Azure Blob Storage).

## 5.1 Local file storage architecture
*   **Storage Location**: Uploads are saved to `./uploads/` on the server's local file system.
*   **File Naming**: A timestamp prefix is added to sanitize filenames and prevent directory traversal:
    ```java
    String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
    ```
*   **Database Mapping**: The local path (such as `uploads/1721900000_doc.pdf`) is saved in the `file_path` column of the `employee_documents` table.
*   **Retrieval**: The file is served to the client as an HTTP stream using Spring's `UrlResource`.

## 5.2 How to migrate to AWS S3
To migrate the local file storage to AWS S3, implement the following changes:

### 1. Update Maven Dependencies
Add the AWS S3 SDK dependency in `backend/pom.xml`:
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>
```

### 2. Update Configuration Settings
Add S3 settings in [application.properties](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/resources/application.properties):
```properties
aws.s3.bucket=nexushr-documents-bucket
aws.s3.region=us-east-1
aws.credentials.accessKey=YOUR_AWS_ACCESS_KEY
aws.credentials.secretKey=YOUR_AWS_SECRET_KEY
```

### 3. Replace local storage code
Update the upload logic in [DocumentController.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/controller/DocumentController.java) to use an S3 client:
```java
// Initialize the AWS S3 client
S3Client s3 = S3Client.builder().region(Region.US_EAST_1).build();

// Put object in S3
PutObjectRequest putRequest = PutObjectRequest.builder()
    .bucket("nexushr-documents-bucket")
    .key(cleanFileName)
    .contentType(file.getContentType())
    .build();

s3.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

// Retrieve the S3 file URL
String s3Url = "https://nexushr-documents-bucket.s3.amazonaws.com/" + cleanFileName;
```

---

# 6. Deployment Configuration

## 6.1 Local Development Environment
1.  **Database**: Start a PostgreSQL database instance on port `5432` with a database named `nexushr`.
2.  **Run Backend**:
    Configure environment settings in `application.properties` and run:
    ```bash
    cd backend
    mvn spring-boot:run -pl app
    ```
    The server starts on port `8081`. Default tables are created and seeded automatically.
3.  **Run Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The client starts on `http://localhost:5173`.

## 6.2 Production deployment using Docker
Use the following Docker Compose configuration to package the application:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: nexushr_db
    environment:
      POSTGRES_DB: nexushr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_production_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: nexushr_backend
    ports:
      - "8081:8081"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/nexushr
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: your_production_password
    depends_on:
      - postgres
    volumes:
      - ./uploads:/uploads

  frontend:
    build: ./frontend
    container_name: nexushr_frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

# 7. Hidden Business Logic & Verification Points

Here is a list of implicit business rules in the codebase that are not visible in the UI:

## 7.1 Salary revisions recalculate current month's payroll
*   **Logic**: When a salary revision is approved, the system updates the employee's record. It also automatically searches for unpaid payroll records for the current month and recalculates basic salary, tax, overtime, and net salary using the new salary amount.
*   **Path**: [SalaryApprovalServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/payroll-service/src/main/java/com/nexushr/service/impl/SalaryApprovalServiceImpl.java#L110-L135).
*   **Trigger Endpoints**: `POST /api/payroll/salary-approval/{id}/approve` (approved by Admin).

## 7.2 Dynamic Working Days in Payroll Batch Runs
*   **Logic**: The payroll batch run determines the standard working days based on the month. If the month has 28 days or fewer (February), it sets working days to 20. For all other months, it sets working days to 22.
*   **Path**: [PayrollBatchJobConfig.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/payroll-service/src/main/java/com/nexushr/payroll/PayrollBatchJobConfig.java#L98-L99).
*   **Trigger Endpoints**: `POST /api/payroll/batch/run` (triggered by HR or Admin).

## 7.3 Salary and Activation Edits Restricted to Admin
*   **Logic**: When HR updates an employee record, the system blocks the update if the base salary or active status is changed. It throws: `"HR cannot directly modify employee salaries..."` or `"Only Admin can change employee activation status."`
*   **Path**: [EmployeeServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/impl/EmployeeServiceImpl.java#L62-L70).
*   **Trigger Endpoints**: `PUT /api/employees/{id}`.

---

# 8. Complete Feature Map

| Module | Sub-Feature | Component / View Path | Backend Class | API Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | Login / Signup | `pages/auth/Login.jsx` | `AuthController.java` | `POST /api/auth/login` |
| **Auth** | Token Rotation | `api/axiosInstance.js` | `RefreshTokenService.java` | `POST /api/auth/refresh` |
| **Employees**| Profile CRUD | `pages/employees/Employees.jsx` | `EmployeeServiceImpl.java` | `GET/POST/PUT/DELETE /api/employees` |
| **Employees**| Org Chart Tree | `components/Topbar.jsx` link | `OrgChartService.java` | `GET /api/employees/org-chart` |
| **Employees**| Onboarding Status| `pages/profile/Profile.jsx` | `OnboardingWorkflow.java` | `GET /api/employees/{id}/onboarding-status` |
| **Attendance**| Punch In/Out Clock| `pages/attendance/Attendance.jsx` | `AttendanceServiceImpl.java` | `POST /api/attendance/check-in/{id}` |
| **Attendance**| Real-Time stream | `pages/attendance/Attendance.jsx` | `AttendanceEventPublisher.java` | `GET /api/attendance/stream/{key}` |
| **Leave** | Requests & Balance| `pages/leave/LeaveManagement.jsx` | `LeaveBalanceEngine.java` | `POST /api/leave/apply` |
| **Payroll** | Revision Request | `pages/payroll/Payroll.jsx` | `SalaryApprovalServiceImpl.java` | `POST /api/payroll/salary-approval/request` |
| **Payroll** | Batch Generation | `pages/payroll/Payroll.jsx` | `PayrollBatchJobConfig.java` | `POST /api/payroll/batch/run` |
| **Payroll** | PDF Payslip | `components/PayrollCard.jsx` | `PayslipGenerator.java` | `GET /api/payroll/{id}/pdf` |
| **Performance**| Appraisal cycle | `pages/performance/Performance.jsx` | `ReviewCycleService.java` | `POST /api/performance/{id}/submit` |
| **AI Insights**| Attrition risk | `pages/insights/AiInsights.jsx` | `AttritionPredictionService.java` | `GET /api/ai/attrition` |
| **AI Insights**| Chatbot Drawer | `pages/insights/AiInsights.jsx` | `HRChatbotService.java` | `POST /api/ai/chat` |
| **Audit Logs**| Admin Log Table | `pages/audit/AuditLogs.jsx` | `AuditLogController.java` | `GET /api/audit-logs` |

---

# 9. AI Context Summary

Use this summary as a context prompt to load into a new AI agent window to continue development on the NexusHR repository:

```prompt
You are an expert full-stack developer working on NexusHR, an Enterprise HR & Workforce Management system. 

Backend Core:
- Java 21, Spring Boot 3.2.5, Spring Security JWT (jjwt 0.11.5), Hibernate JPA, PostgreSQL.
- Server starts on port 8081. Public routes are defined in SecurityConfig.java.
- Token security: JwtFilter.java processes incoming calls. JWT access tokens expire in 24 hours. Opaque UUID refresh tokens are stored in the database for session control and are rotated on every refresh.
- Ownership guards: SecurityHelper.java manages SpEL checks (such as checking if a user owns an employee, leave, or payroll record).
- Core entities: User (role ENUM: ADMIN, HR, EMPLOYEE), Employee (status ENUM: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED), Attendance, LeaveRequest, Payroll, SalaryApprovalRequest, Goal, Performance, Department, Recruitment, EmployeeDocument, AuditLog.
- Startup seed: DataSeeder.java clears and repopulates database tables with default values and credentials.

Frontend Core:
- React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, Recharts.
- Starts on port 5173. Requests are routed through axiosInstance.js.
- Token refresh: The Axios response interceptor catches 401 errors, calls /api/auth/refresh to rotate tokens, and retries the original request.
- State Context: AuthContext.jsx manages login state, user metadata, and roles. ThemeContext.jsx saves light/dark settings to local storage.

Key Integrations to maintain:
1. Attendance: Clock actions calculate daily work hours. AttendanceEventPublisher.java sends real-time punch logs to HR dashboards via SSE.
2. Leave: LeaveRequestServiceImpl.java processes requests, while LeaveBalanceEngine.java manages deductions and refunds.
3. Payroll: PayrollCalculator.java calculates taxes, overtime, and net pay. PayrollBatchJobConfig.java runs monthly batch processes asynchronously. PayslipGenerator.java creates payslip PDFs.
4. AI Insights: AiInsightsServiceImpl.java calculates attrition risk, engagement scores, and skill gaps. HRChatbotService.java runs a chatbot using live database context and keyword matching.
5. Audit Trails: AuditLogController.java manages system logs.

Refer to code paths, services, and configuration files in docs/AI_Knowledge_Base.md.
```
