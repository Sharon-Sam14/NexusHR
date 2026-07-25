# AI Handoff Documentation: NexusHR Enterprise HR & Workforce Management System

Welcome to the handoff documentation for **NexusHR**, a production-grade, multi-module full-stack Enterprise HR and Workforce Management platform. This document is written specifically for another AI assistant (e.g., Gemini, Claude, ChatGPT, Cursor) to instantly understand 100% of the project's features, APIs, database, code architecture, frontend structure, deployment configurations, and hidden business logic without having to explore the codebase.

---

# 1. Project Overview

## 1.1 What the Project Is
**NexusHR** is a central workforce management system designed for the **Zidio Java Full Stack Internship Project 2026**. It provides digital records and automated processes for the entire lifecycle of an employee, including check-in/out logs, calendar scheduling, leave management, automated payroll calculations with tax brackets and overtime, quarterly performance reviews, onboarding document management, system audit trails, notifications dispatching (email/SMS), and predictive AI talent insights.

## 1.2 Problem Being Solved
HR departments in growing enterprises are frequently bogged down by scattered data sources (spreadsheets for attendance, manual calculations for tax/payroll, separate channels for recruitment, and no centralized audit trail). NexusHR solves these issues by:
*   Enforcing a single source of truth for employee records and credentials.
*   Enforcing programmatic constraints (e.g., preventing HR from editing salaries directly without Admin approvals).
*   Automating payroll calculations using daily attendance logs and late/overtime rules.
*   Providing live operational updates using Server-Sent Events (SSE).
*   Enriching HR actions with predictive modeling (attrition risk, skill gap analysis) and a simulated natural language RAG chatbot.

## 1.3 Users & Access Roles
The system has three primary roles defined in `com.nexushr.entity.Role`:
1.  **System Admin (`ADMIN`)**: Complete control. Can create/modify/delete any employee record, bypass owner restrictions, directly revise employee salaries and status, rerun payroll, approve salary revisions, and view system-wide immutable audit logs.
2.  **HR Manager (`HR`)**: Functional managers. Can view the employee directory, manage departments, apply manual corrections to attendance, approve/reject leaves, run monthly payroll batches (which default to `DRAFT` or `PROCESSED` depending on role), submit salary revision approval requests to the Admin, and view the AI Insights dashboard.
3.  **Regular Employee (`EMPLOYEE`)**: Personal dashboard. Can check in/out daily, request leaves, review personal leave balances, view their monthly payslips (and download CSV or print), acknowledge their performance reviews, view their notifications, and modify their personal details (address, profile photo, emergency contact).

## 1.4 Architecture & Tech Stack
The project is built as a split client-server architecture:
*   **Backend**: Spring Boot 3.2.5 multi-module Maven project using Java 21, Spring Security with stateless JWT access tokens + rotated database-backed refresh tokens, Spring Data JPA with Hibernate, and PostgreSQL as the production database.
*   **Frontend**: React 18 Single Page Application (SPA) bundled via Vite, styled using CSS Custom Properties and Tailwind CSS, animated via Framer Motion, and utilizing Recharts for data visualization.

## 1.5 Folder Structure
```
NexusHR-main/
├── backend/                       ← Multi-module Maven parent directory
│   ├── pom.xml                    ← Root Maven POM (declares submodules and versions)
│   ├── common/                    ← Shared DTOs, Enums, entities, global exceptions, AOP aspect
│   ├── auth-service/              ← User authentication, JWT filter, refresh token database lifecycle
│   ├── employee-service/          ← Employee directory, Org Chart, onboarding workflow, document uploads, recruitment
│   ├── attendance-service/        ← Check-in/out, live SSE punch streams, Leave Request balance check & engine
│   ├── payroll-service/           ← Overtime calculator, batch payroll generation, CSV downloads, salary revision approvals
│   ├── performance-service/       ← Performance reviews, individual goals progress tracker, feedback aggregator
│   ├── ai-service/                ← Rule-based attrition prediction, skill gap matrix mapping, simulated RAG co-pilot
│   ├── notification-service/      ← In-app notifications repository, SMTP email simulation, Twilio SMS simulation
│   └── app/                       ← Main Spring Boot Application entrypoint, Dashboard data controller, DataSeeder
│
└── frontend/                      ← React + Vite SPA client
    ├── src/
    │   ├── api/                   ← Axios client instance and request/response interceptors (rotates tokens)
    │   ├── components/            ← Global UI layout components (Sidebar, Topbar, DataTable, Badge, CommandPalette)
    │   ├── context/               ← Global React state hooks (AuthContext, ThemeContext, NotificationContext)
    │   ├── layouts/               ← Page wrappers, layouts, and route transitions
    │   ├── pages/                 ← Feature views (dashboard, employee directory, leave, payroll, performance, AI, calendar)
    │   ├── routes/                ← Router paths mapping and ProtectedRoute guard configuration
    │   ├── services/              ← Axios API wrappers matching the backend service endpoints
    │   ├── utils/                 ← Number/date formatters and validators
    │   ├── App.jsx                ← App base component
    │   └── main.jsx               ← Client bootstrap entry
```

---

# 2. High-Level Architecture

NexusHR uses a modular monolith backend design. Modules communicate at compile-time via dependencies (declared in Maven POMs) and at runtime via direct JPA entities and shared databases. A single running Spring Boot process hosts all modules on port `8081`. The frontend talks to the backend via REST endpoints on `/api`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React SPA)                      │
│                                                                        │
│  [Views: HTML/JS] ◄──► [Context: Auth/Theme] ◄──► [Services: Axios]    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS REST (Bearer JWT / port 8081)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Spring Boot JVM)                       │
│                                                                        │
│  ┌───────────────────────┐   ┌───────────────────────┐                 │
│  │      Security         │   │   Controllers Layer   │                 │
│  │   (JwtFilter / RBAC)  ├──►│  (RestControllers)    │                 │
│  └───────────────────────┘   └───────────┬───────────┘                 │
│                                          │                             │
│                              ┌───────────▼───────────┐                 │
│                              │     Service Layer     │◄──► [Simulators]│
│                              │   (Business Logic)    │     (Email/SMS) │
│                              └───────────┬───────────┘                 │
│                                          │                             │
│                              ┌───────────▼───────────┐                 │
│                              │    Repository Layer   │                 │
│                              │      (Spring Data)    │                 │
│                              └───────────┬───────────┘                 │
└──────────────────────────────────────────┼─────────────────────────────┘
                                           │ SQL (JPA/Hibernate)
                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       POSTGRESQL DATABASE (port 5432)                  │
│                                                                        │
│  [users] [employees] [attendance] [payrolls] [leave_requests] ...      │
└────────────────────────────────────────────────────────────────────────┘
```

## 2.1 Component Interactions

### 2.1.1 Frontend Layer
The React client acts as a stateful SPA.
*   **Routing**: Handled by `React Router v6`. Routes are gated inside `ProtectedRoute.jsx` using `AuthContext`.
*   **API Client**: `axiosInstance.js` handles request signing. It checks `localStorage` for `nexushr_token` and inserts a `Bearer <JWT>` header. If a request returns `401 Unauthorized`, a response interceptor intercepts the call, uses the long-lived `nexushr_refresh_token` to make a POST to `/api/auth/refresh`, updates the local storage tokens, and retries the original request.
*   **State Management**: `AuthContext.jsx` holds user state (name, role, userId, employeeId, email). `ThemeContext.jsx` coordinates body theme classes (`.dark`). `NotificationContext.jsx` maintains notifications.
*   **Real-time Interface**: Connects to the backend via `EventSource` on `/api/attendance/stream/{user_email}?token={jwt}` to display punch operations live on the HR panel.

### 2.1.2 Backend Security Layer
All incoming requests pass through `JwtFilter`.
1.  Extracts token from the `Authorization` header (`Bearer ...`) or the query parameter `?token=...` (required for SSE `EventSource` connections).
2.  Validates signature and expiration using `JwtTokenProvider` / `JwtUtil`.
3.  Loads user details from the database using `CustomUserDetailsService` based on the email subject in the token.
4.  Attaches an authenticated principal to `SecurityContextHolder` with `ROLE_<role>` authority.
5.  Method-level pre-authorization annotations (`@PreAuthorize`) restrict access based on roles or verify record ownership by checking `user.employee.id` against request parameters via `SecurityHelper` beans.

### 2.1.3 Storage & File Upload
Onboarding documents and profile photos are sent via `MultipartFile` payloads to the backend. The files are scrubbed to prevent directory traversal and saved directly to the host system under the local folder `./uploads/`. File paths are tracked in the database under `employee_documents`.

---

# 3. Every Module

Here is the exact description of the technical implementation, validations, and edge cases for every functional module in the project.

---

## 3.1 Authentication & User Session Module

### Purpose
Provides registration, JWT creation, secure login, opaque refresh token lifecycle management, and simulated password resets.

### Business Logic
Users register with an email. Passwords are encrypted using BCrypt. Login triggers the issuance of a short-lived JWT (access token) and a long-lived opaque refresh token (UUID). The refresh token is saved in the database. When the access token expires, the client exchanges the old refresh token for a fresh token pair. The old refresh token is marked as revoked. This enforces refresh token rotation (sliding session window).

### Classes & Paths
*   **Controller**: [AuthController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/controller/AuthController.java)
*   **Services**: [AuthService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/service/AuthService.java), [AuthServiceImpl](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/service/impl/AuthServiceImpl.java), [RefreshTokenService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/service/RefreshTokenService.java)
*   **Security Config**: [SecurityConfig](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityConfig.java)
*   **Entities**: [User](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/entity/User.java), [RefreshToken](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/entity/RefreshToken.java)
*   **Repositories**: [UserRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/repository/UserRepository.java), [RefreshTokenRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/repository/RefreshTokenRepository.java)
*   **Database Tables**: `users`, `refresh_tokens`

### Endpoints
*   `POST /api/auth/register`: Public. Body: `RegisterRequest` (name, email, password, role). Returns access/refresh tokens.
*   `POST /api/auth/login`: Public. Body: `LoginRequest` (email, password). Validates credentials, saves fresh refresh token, returns tokens.
*   `POST /api/auth/refresh`: Public. Body: `{ "refreshToken": "<uuid>" }`. Checks token validity/expiration, invalidates old token, issues rotated access+refresh tokens.
*   `POST /api/auth/forgot-password`: Public. Generates UUID reset token, sets expiration (+1 hour), sends simulated reset email.
*   `POST /api/auth/reset-password`: Public. Body: `{ "token": "<uuid>", "newPassword": "<plain>" }`. Encrypts new password, clears reset token in database.
*   `POST /api/auth/logout`: Authenticated. Revokes all active refresh tokens for the calling user.

### Relationships
*   `User` has a `@OneToOne` lazy-loaded relationship to `Employee` via the foreign key `employee_id`.

### Edge Cases & Validation
*   **Duplicate Signups**: Registration checks `userRepository.existsByEmail(request.getEmail())` and throws an error if email is already taken.
*   **Refresh Token Replay**: If a compromised refresh token is reused, `RefreshTokenService` detects that the token is already marked as `revoked=true` and throws an access exception, forcing the user to log in again.
*   **Reset Token Expiration**: Validated against `resetTokenExpiry` before modifying the password.

### Example Exchange
*   **Request** (`POST /api/auth/login`):
    ```json
    {
      "email": "employee@nexushr.com",
      "password": "emp12345"
    }
    ```
*   **Response**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlbXBsb3llZUBuZXh1c2hyLmNvbSIsInJvbGUiOiJFTVBMT1lFRSIsInR5cGUiOiJBQ0NFU1MiLCJpYXQiOjE3OTIwMDAwMDAsImV4cCI6MTc5MjA4NjQwMH0...",
      "refreshToken": "8f8373b9-1d9c-4861-b4ef-f993d0fca8fb",
      "name": "Aarav Sharma",
      "email": "employee@nexushr.com",
      "role": "EMPLOYEE",
      "userId": 3,
      "employeeId": 1
    }
    ```

---

## 3.2 Employee Module

### Purpose
Maintains employee identity, emergency contacts, profile details, and activation statuses.

### Business Logic
Admins and HR can onboard and manage employees. However, a strict rule limits employee deletion, status modification, and base salary modifications directly to the `ADMIN` role. HR must use the Payroll module to revise salaries.

### Classes & Paths
*   **Controller**: [EmployeeController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/controller/EmployeeController.java)
*   **Service**: [EmployeeService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/EmployeeService.java), [EmployeeServiceImpl](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/impl/EmployeeServiceImpl.java)
*   **Entity**: [Employee](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/entity/Employee.java)
*   **Repository**: [EmployeeRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/repository/EmployeeRepository.java)
*   **Database Table**: `employees`

### Endpoints
*   `GET /api/employees`: Restricted to `ADMIN` and `HR`. Returns all employee records.
*   `GET /api/employees/{id}`: Accessible by `ADMIN`, `HR`, or the employee record owner.
*   `POST /api/employees`: Restricted to `ADMIN` and `HR`. Creates employee record.
*   `PUT /api/employees/{id}`: Accessible by `ADMIN` and `HR`. Prevents salary or status changes unless caller is `ADMIN`.
*   `DELETE /api/employees/{id}`: Restricted strictly to `ADMIN`. Deletes employee profile.

### Edge Cases & Validation
*   **Duplicate Email**: Checked on database constraint level and validated in repository.
*   **HR Modifying Base Salary**: If a user with role `HR` attempts to update an employee profile with a changed salary, the backend throws: `"HR cannot directly modify employee salaries. Please submit a Salary Approval Request on the Payroll page."`

---

## 3.3 Attendance Module (Live & SSE)

### Purpose
Logs daily check-in / check-out times, calculates daily work hours, handles manual adjustments, and streams punches to HR dashboards.

### Business Logic
*   Detailed in Section 4.

---

## 3.4 Leave Management Module

### Purpose
Validates, records, and calculates leave balances.

### Business Logic
*   Detailed in Section 5.

---

## 3.5 Payroll & Salary Approval Module

### Purpose
Calculates gross salaries, deductions, taxes, overtime pay, and generates printable payslips.

### Business Logic
*   Detailed in Section 6.

---

## 3.6 Departments Module

### Purpose
Manages company departments.

### Classes & Paths
*   **Controller**: [DepartmentController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/controller/DepartmentController.java)
*   **Service**: [DepartmentService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/DepartmentService.java), [DepartmentServiceImpl](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/impl/DepartmentServiceImpl.java)
*   **Entity**: [Department](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/entity/Department.java)
*   **Repository**: [DepartmentRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/repository/DepartmentRepository.java)
*   **Database Table**: `departments`

### Endpoints
*   `GET /api/departments`: Returns list of all departments.
*   `POST /api/departments`: Creates a new department.
*   `PUT /api/departments/{id}`: Updates name, description, or head.
*   `DELETE /api/departments/{id}`: Deletes a department.

---

## 3.7 Projects Module
*   *Note*: The current version of this codebase does not contain a dedicated SQL table or controller for projects. Project references are handled implicitly via employee designations, departments, and custom remarks fields.

---

## 3.8 Performance & Goals Module

### Purpose
Coordinates quarterly 360 appraisal evaluations and monitors individual employee task progression.

### Business Logic
HR or Managers create performance reviews with ratings for Productivity, Quality, Teamwork, Communication, and Overall (1–5 scale). Reviews are generated as `DRAFT`, updated to `SUBMITTED`, and finalized once the target employee calls the `/acknowledge` endpoint. Additionally, managers assign employee `Goals` that track progress from 0% to 100%.

### Classes & Paths
*   **Controllers**: [PerformanceController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/controller/PerformanceController.java), [GoalsReviewController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/controller/GoalsReviewController.java)
*   **Services**: [PerformanceService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/service/PerformanceService.java), [GoalService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/service/GoalService.java), [ReviewCycleService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/service/ReviewCycleService.java), [FeedbackAggregator](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/service/FeedbackAggregator.java)
*   **Entities**: [Performance](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/entity/Performance.java), [Goal](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/entity/Goal.java)
*   **Repositories**: [PerformanceRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/repository/PerformanceRepository.java), [GoalRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/performance-service/src/main/java/com/nexushr/repository/GoalRepository.java)
*   **Database Tables**: `performance_reviews`, `goals`

### Endpoints
*   `POST /api/performance`: Creates draft appraisal.
*   `POST /api/performance/{id}/submit`: Transitions status from `DRAFT` to `SUBMITTED`.
*   `POST /api/performance/{id}/acknowledge`: Gated by `@securityHelper.isPerformanceOwner(#id)`. Transitions to `ACKNOWLEDGED`.
*   `POST /api/performance/goals`: Creates goal.
*   `PATCH /api/performance/goals/{id}/progress`: Updates progress percentage (0–100).
*   `GET /api/performance/feedback/{period}`: Aggregates ratings by review cycle.

---

## 3.9 Notifications Module

### Purpose
Logs in-app alerts and orchestrates external SMTP/Twilio dispatch simulators.

### Business Logic
Actions in the system (applying for leaves, approving salary revisions, submitting performance evaluations) compile a `DispatchPayload` and pass it to `NotificationDispatcher`. It saves a database record under `notifications` and immediately schedules simulated email/SMS logs.

### Classes & Paths
*   **Controller**: [NotificationController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/notification-service/src/main/java/com/nexushr/controller/NotificationController.java)
*   **Service**: [NotificationService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/notification-service/src/main/java/com/nexushr/service/NotificationService.java), [NotificationDispatcher](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/notification-service/src/main/java/com/nexushr/notification/NotificationDispatcher.java)
*   **Entity**: [Notification](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/notification-service/src/main/java/com/nexushr/entity/Notification.java)
*   **Repository**: [NotificationRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/notification-service/src/main/java/com/nexushr/repository/NotificationRepository.java)
*   **Database Table**: `notifications`

### Endpoints
*   `GET /api/notifications`: Fetches caller's notifications.
*   `PATCH /api/notifications/{id}/read`: Marks notification as read.
*   `PATCH /api/notifications/read-all`: Marks all of the caller's notifications as read.

---

## 3.10 Dashboard Module

### Purpose
Calculates operational metrics for Admin/HR and maps individual statistics for employees.

### Business Logic
*   **Employees**: Fetches check-in status for today, pending leaves, net salary payout for the current month, and average performance rating.
*   **HR / Admin**: Fetches total headcount, active employees count, today's present count, today's absent count, pending salary approval request count, pending leave requests, total monthly gross payroll cost, and open job listings.
*   **Employee of the Month Spotlight**: Loops through the `performance_reviews` table, finds the employee with the highest overall rating, and resolves their details (tenure, name, designation) as a dashboard card widget.

### Classes & Paths
*   **Controller**: [DashboardController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/java/com/nexushr/controller/DashboardController.java)
*   **Service**: [DashboardService](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/java/com/nexushr/service/DashboardService.java), [DashboardServiceImpl](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/java/com/nexushr/service/impl/DashboardServiceImpl.java)
*   **Database Tables Used**: reads from `users`, `employees`, `attendance`, `leave_requests`, `payrolls`, `recruitment`, `departments`, `performance_reviews`, `notifications`, `salary_approval_requests`

### Endpoint
*   `GET /api/dashboard/stats`: Returns contextual dashboard payload matching the role of the caller.

---

## 3.11 Audit Logs Module

### Purpose
Records chronological trails of security actions, database updates, and workflow reviews.

### Business Logic
An aspect-oriented aspect (`AuditLogAspect.java`) or direct program calls write messages to the database. These logs are immutable. The API allows only listing and does not permit updates or deletions.

### Classes & Paths
*   **Controller**: [AuditLogController](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/controller/AuditLogController.java)
*   **Entity**: [AuditLog](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/entity/AuditLog.java)
*   **Repository**: [AuditLogRepository](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/repository/AuditLogRepository.java)
*   **Logger utility**: [AuditLogger](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/common/src/main/java/com/nexushr/util/AuditLogger.java)
*   **Database Table**: `audit_logs`

### Endpoints
*   `POST /api/audit-logs`: Publicly permitted in `SecurityConfig` to let submodules submit logs from different classloaders.
*   `GET /api/audit-logs`: Restricted to `ADMIN`. Supports parameters `?search=`, `?action=`, `?target=` for filtering.

---

## 3.12 AI Intelligence Module

### Purpose
Runs rule-based attrition probability mapping, design/developer skill gap mapping, and simulated RAG chatbot co-pilot operations.

### Business Logic
*   Detailed in Section 9.

---

# 4. Attendance Module (EXTREMELY DETAILED)

The Attendance module is designed to log and verify attendance in real-time.

## 4.1 Attendance marking logic

### 4.1.1 Shift Configuration
A standard working shift is configured in the UI as **09:00 AM to 06:00 PM** (representing a 9.0 hour duration including lunch). A standard active work requirement is **8.0 hours** per day.

### 4.1.2 Clock-In (Punch In) Flow
An employee punches in via the client UI, which calls `POST /api/attendance/check-in/{employeeId}`.
1.  Verifies the employee exists in the database.
2.  Gets the current system date (`LocalDate.now()`).
3.  Checks if a check-in record already exists for this employee on today's date:
    ```java
    attendanceRepository.findFirstByEmployeeIdAndDate(employeeId, today)
        .ifPresent(a -> { throw new RuntimeException("Already checked in today"); });
    ```
4.  Creates an `Attendance` record with `checkIn = LocalTime.now()`, `date = today`, and status `PRESENT`.
5.  Saves the record to the database.
6.  Triggers `attendanceEventPublisher.publishPunch(saved, "CHECK_IN")` to broadcast this check-in over all active Server-Sent Events (SSE) connections.
7.  Saves an immutable log in `audit_logs` via `AuditLogger.log()`.

### 4.1.3 Clock-Out (Punch Out) Flow
An employee punches out via the client UI, which calls `POST /api/attendance/check-out/{employeeId}`.
1.  Gets the current system date (`LocalDate.now()`).
2.  Fetches today's check-in record for the employee:
    ```java
    Attendance attendance = attendanceRepository.findFirstByEmployeeIdAndDate(employeeId, today)
        .orElseThrow(() -> new RuntimeException("No check-in found for today"));
    ```
3.  Sets the check-out time: `checkOut = LocalTime.now()`.
4.  If check-in is not null, calculates the total duration in minutes between check-in and check-out and converts it to decimal hours rounded to two decimal places:
    ```java
    long minutes = ChronoUnit.MINUTES.between(attendance.getCheckIn(), attendance.getCheckOut());
    attendance.setWorkHours(Math.round(minutes / 60.0 * 100.0) / 100.0);
    ```
5.  Saves the updated record to the database.
6.  Triggers `attendanceEventPublisher.publishPunch(saved, "CHECK_OUT")` to broadcast this check-out over SSE.
7.  Saves an immutable log in `audit_logs`.

### 4.1.4 Manual Correction Flow
HR managers and Admins can log manual attendance or edit existing logs using `POST /api/attendance` and `PUT /api/attendance/{id}`. This is used when employees forget to punch, work remotely, or request status changes (e.g. marking `LATE` or `HALF_DAY`).

### 4.1.5 Live SSE Emitters
The frontend establishes a connection using `new EventSource("/api/attendance/stream/{user_email}?token={jwt}")`.
*   The server saves an `SseEmitter` in a thread-safe `ConcurrentHashMap` inside `AttendanceEventPublisher`.
*   When a punch occurs, the publisher broadcasts the payload to all active emitters. Emitters that throw write errors (indicating the client has disconnected) are automatically removed from the active map.

```
  Employee (Client)           Backend Controller             Service / Repos           SSE Dispatcher          HR Dashboard
         │                            │                             │                        │                      │
         │ POST /attendance/check-in  │                             │                        │                      │
         ├───────────────────────────►│                             │                        │                      │
         │                            │  checkIn(employeeId)        │                        │                      │
         │                            ├────────────────────────────►│                        │                      │
         │                            │                             │─┐                      │                      │
         │                            │                             │ │ Verify Employee      │                      │
         │                            │                             │◄┘ exists               │                      │
         │                            │                             │─┐                      │                      │
         │                            │                             │ │ Assert no check-in   │                      │
         │                            │                             │◄┘ exists for today     │                      │
         │                            │                             │                        │                      │
         │                            │                             │─┐ Create & Save        │                      │
         │                            │                             │ │ Attendance record    │                      │
         │                            │                             │◄┘ (status: PRESENT)    │                      │
         │                            │                             │                        │                      │
         │                            │                             │── publishPunch(...) ──►│                      │
         │                            │                             │                        │─┐ Broadcast event    │
         │                            │                             │                        │ │ "attendance-punch" │
         │                            │                             │                        │◄┘ to subscribers     │
         │                            │                             │                        │─────────────────────►│
         │                            │                             │                        │                      │ (Dashboard table
         │                            │                             │                        │                      │  updates in-place)
         │                            │◄────────────────────────────│                        │                      │
         │◄───────────────────────────│         Return DTO          │                        │                      │
         │       HTTP 200 OK          │                             │                        │                      │
```

---

# 5. Leave Management

The Leave Management module controls how employees request time off, checks their balances, and handles database operations.

## 5.1 Business Rules & Balance Computations

### 5.1.1 Leave Balance Allocation
Every employee is created with a default leave balance of **15 days** (stored in `employees.leave_balance`).

### 5.1.2 Duration Computation
The total duration of a leave request is computed by finding the days between the start date and the end date (inclusive):
```java
int totalDays = (int) ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;
```

### 5.1.3 Sufficiency Guard
When an employee submits a leave request, the system checks their leave balance. If their balance is insufficient, the transaction is rejected:
```java
if (employee.getLeaveBalance() < totalDays) {
    throw new RuntimeException("Insufficient leave balance. Remaining: " + employee.getLeaveBalance() + " days, Requested: " + totalDays + " days.");
}
```

### 5.1.4 Balance Deductions & Restoration (Atomicity)
Balance calculations are managed by `LeaveBalanceEngine` to ensure data consistency:
*   **Deduction (On Approval)**: When HR calls `/api/leave/{id}/approve`, the employee's `leaveBalance` is decremented by the requested days. The status of the request changes to `APPROVED`.
*   **Restoration (On Rejection/Cancellation)**: If a previously `APPROVED` leave request is rejected or cancelled, the engine refunds the leave days back to the employee's balance pool:
    ```java
    employee.setLeaveBalance(employee.getLeaveBalance() + request.getTotalDays());
    ```
    If the request was still in `PENDING` status, no refund is applied since the balance was not yet deducted.

---

# 6. Payroll System

The Payroll system automates monthly salary processing and calculates gross-to-net salary details.

## 6.1 Net Payout Formulas & Algorithms

### 6.1.1 Salary Revision Approval Workflow
An HR user cannot modify an employee's salary directly. Instead, they must submit a revision request:
1.  HR requests a salary revision using `POST /api/payroll/salary-approval/request`.
2.  The request is stored in `salary_approval_requests` with status `PENDING`.
3.  The Admin views pending revisions and calls `POST /api/payroll/salary-approval/{id}/approve`.
4.  The system updates the employee's salary in the `employees` table.
5.  If a payroll record exists for the current month and its status is *not* `PAID`, the system automatically recalculates the basic salary, tax, overtime, and net salary using the new salary amount.

### 6.1.2 Base Overtime Hourly Rate
A standard working month is defined as **22 working days**, with **9.0 hours** per shift. The base hourly rate is calculated as:
$$\text{Hourly Rate} = \frac{\text{Monthly Base Salary}}{\text{Working Days} \times 9.0}$$

### 6.1.3 Overtime Calculation
The system loops through all attendance logs for the target month. Any log with `workHours > 9.0` contributes to overtime:
$$\text{Daily Overtime Hours} = \text{Work Hours} - 9.0$$
The overtime pay rate is calculated at **1.5 times** the base hourly rate:
$$\text{Overtime Pay} = \text{Overtime Hours} \times (\text{Hourly Rate} \times 1.5)$$

### 6.1.4 Progressive Tax Brackets
Taxes are calculated based on the employee's monthly base salary:
*   Base Salary $< \$50,000 \rightarrow$ **12% Tax**
*   Base Salary $< \$100,000 \rightarrow$ **18% Tax**
*   Base Salary $\ge \$100,000 \rightarrow$ **25% Tax**

### 6.1.5 Net Payout Formula
The final net salary payout is calculated as:
$$\text{Net Salary} = \text{Base Salary} + \text{Bonus} + \text{Overtime Pay} + \text{Allowances} + \text{Reimbursements} - \text{Deductions} - \text{Tax Amount}$$

---

# 7. Authentication & Security Implementation

NexusHR secures access using stateless JWT authentication and a database-backed refresh token rotation.

```
   Client (React)                  Auth Controller                 JwtTokenProvider           RefreshTokenRepository
         │                               │                                │                             │
         │ POST /api/auth/login          │                                │                             │
         ├──────────────────────────────►│                                │                             │
         │                               │ authenticate(email, pass)      │                             │
         │                               ├───────────────────────────────►│                             │
         │                               │                                │                             │
         │                               │ createToken(email, role)       │                             │
         │                               ├───────────────────────────────►│                             │
         │                               │◄───────────────────────────────│                             │
         │                               │ Returns accessToken            │                             │
         │                               │                                │                             │
         │                               │ generate(email)                │                             │
         │                               ├───────────────────────────────►│                             │
         │                               │                                │── revokeAllByUserId(...) ──►│ (Single-session
         │                               │                                │                             │  enforcement)
         │                               │                                │── save(RefreshToken) ──────►│
         │                               │◄───────────────────────────────│                             │
         │                               │ Returns RefreshToken           │                             │
         │◄──────────────────────────────│                                │                             │
         │   Returns LoginResponse       │                                │                             │
         │   (accessToken & refresh)     │                                │                             │
```

## 7.1 JWT Signature & Security Details
*   **Algorithm**: HMAC-SHA256.
*   **Key**: Configured via `jwt.secret` in `application.properties`.
*   **Access Token Lifetime**: 24 hours (`86400000` ms).
*   **Token Claims**:
    *   `sub` (Subject): User's email.
    *   `role`: The user's access role (e.g. `ADMIN`, `HR`, `EMPLOYEE`).
    *   `type`: Explicitly set to `"ACCESS"`.
    *   `jti`: A unique UUID generated per token, allowing token tracking and revocation.

## 7.2 Single-Session Enforcements
When a user logs in, `RefreshTokenService` revokes all existing refresh tokens for that user ID:
```java
refreshTokenRepository.revokeAllByUserId(user.getId());
```
This restricts the user to a single active session. If they log in on a new device, any older sessions are terminated.

---

# 8. Cloud Features & Local Storage Fallback

The current version of this application does not use external cloud providers (such as AWS S3, Azure Blob, Firebase, or Google Cloud Storage) to store files.

## 8.1 Local File Storage Architecture
*   **Upload Location**: Saved to the local host system directory `./uploads/`.
*   **Filename Sanitization**: To prevent directory traversal attacks, the original filename is cleaned by removing special characters and appending a unique millisecond timestamp:
    ```java
    String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
    ```
*   **File Recovery & Retrieval**: Files are read from the host system using `UrlResource` and sent to the client with the matching MIME type header.
*   **Cleanup**: When a file record is deleted from the database, the backend deletes the file from the host storage directory:
    ```java
    Files.deleteIfExists(Paths.get(doc.getFilePath()));
    ```

---

# 9. AI Workforce Intelligence Features

The AI Workforce Intelligence module is a key component for HR decision-making. It runs on a rule-based inference engine, providing simulated RAG chatbot co-pilot features.

## 9.1 Predictive Analytics Rules

### 9.1.1 Attrition Risk Scoring
The attrition risk model evaluates employee data and generates a risk score (5% to 95%). The risk level is categorized as **HIGH** ($\ge 60\%$), **MEDIUM** ($30\% - 59\%$), or **LOW** ($< 30\%$). The risk score is calculated using the following factors:
*   **Base Risk**: Starts at 10.0%.
*   **Salary Benchmarking**: If an employee's salary is below 85% of the company-wide average, the risk score increases by **20%**.
*   **Undercompensation**: If an employee is a high performer (appraisal rating $\ge 4.2$) but their salary is under \$85,000, the risk score increases by **25%**.
*   **Low Attendance**: If an employee's attendance rate is below 85%, the risk score increases by **15%**.
*   **Tardiness**: If an employee's late arrival rate is above 20% of their total present days, the risk score increases by **10%** (in `AttritionPredictionService`) or **15%** (in `AiInsightsServiceImpl`).
*   **Tenure Stagnation**: If an employee's tenure is over 24 months and they have no performance reviews on record, the risk score increases by **10%**.

### 9.1.2 Engagement Index scoring
Engagement scores range from 5% to 100% and are calculated based on attendance and performance reviews:
$$\text{Engagement Score} = (\text{Attendance Rate} \times 0.6) + (\text{Performance Rating Representation} \times 0.4)$$
where the performance rating representation is:
$$\text{Performance Rating Representation} = \frac{\text{Latest Appraisal Rating}}{5.0} \times 100$$
If the employee's late arrival rate exceeds 15%, the engagement score decreases by **5%**.

### 9.1.3 Skill Gap Analyser
The system maps employee designations to required competency levels (1–5 scale). It compares these requirements to the employee's performance ratings to calculate skill gaps:
*   **Designation matches `engineer` or `developer`**:
    *   *Cloud Infrastructure*: Requires level 5. Current level is 4 if appraisal rating $\ge 4.0$, else 3.
    *   *System Architecture*: Requires level 5. Current level is 4 if appraisal rating $\ge 4.5$, else 3.
    *   *DevOps & CI/CD*: Requires level 4. Current level is 3 if appraisal rating $\ge 4.0$, else 2.
*   **Designation matches `designer` or `ui` / `ux`**:
    *   *Figma Design Systems*: Requires level 5. Current level is 5 if appraisal rating $\ge 4.0$, else 4.
    *   *Usability & UX Testing*: Requires level 4. Current level is 3 if appraisal rating $\ge 4.0$, else 2.
*   **Designation matches `analyst` or `finance`**:
    *   *Advanced Financial Modeling*: Requires level 5. Current level is 4 if appraisal rating $\ge 4.0$, else 3.
    *   *BI & Data Visualization*: Requires level 4. Current level is 2.
*   **Designation matches `manager` or `hr`**:
    *   *Strategic Talent Management*: Requires level 5. Current level is 4 if appraisal rating $\ge 4.0$, else 3.
*   **Skill Gap Percentage Formula**:
    $$\text{Gap \%} = \max\left(0, \frac{\text{Required Level} - \text{Current Level}}{\text{Required Level}} \times 100\right)$$

## 9.2 Simulated RAG chatbot co-pilot
The AI assistant on the dashboard uses a pattern-matching engine that queries live database statistics (such as active headcount, pending leave requests, salary averages, and average performance scores). It formats these metrics into markdown responses, simulating a RAG model.

---

# 10. Database Schema & Tables

Here is the database schema for the 14 tables in the system.

```
  ┌──────────────┐          ┌──────────────┐          ┌──────────────────────┐
  │  departments │          │   employees  │◄─────────┤ employee_documents   │
  └──────┬───────┘          └──────┬───────┘          └──────────────────────┘
         │                         │     ▲
         │                         │     └───────────────────┐
         │                         ├──► [users]              │
         │                         │     ▲                   │
         │                         │     └─── [refresh_tokens]
         │                         │
         │                         ├──► [attendance]
         │                         │
         │                         ├──► [leave_requests]
         │                         │
         │                         ├──► [payrolls]
         │                         │
         │                         ├──► [salary_approval_requests]
         │                         │
         │                         ├──► [goals]
         │                         │
         └─────────────────────────┴──► [performance_reviews]
```

### 10.1 Table: `users`
Stores user credentials and roles.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `name` (VARCHAR, Nullable = false)
*   `email` (VARCHAR, Unique, Nullable = false)
*   `password` (VARCHAR, Nullable = false) - BCrypt hash.
*   `role` (VARCHAR, Nullable = false) - ENUM: `ADMIN`, `HR`, `EMPLOYEE`.
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = true)
*   `active` (BOOLEAN, default = true)
*   `reset_token` (VARCHAR, Nullable = true)
*   `reset_token_expiry` (TIMESTAMP, Nullable = true)

### 10.2 Table: `employees`
Stores employee profiles and leave balances.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_name` (VARCHAR, Nullable = false)
*   `email` (VARCHAR, Unique, Nullable = false)
*   `phone` (VARCHAR)
*   `department` (VARCHAR, Nullable = false)
*   `designation` (VARCHAR, Nullable = false)
*   `salary` (DOUBLE PRECISION, Nullable = false)
*   `joining_date` (DATE)
*   `profile_photo` (VARCHAR) - Local file path.
*   `address` (VARCHAR)
*   `status` (VARCHAR, Nullable = false) - ENUM: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`.
*   `leave_balance` (INTEGER, Nullable = false, default = 15)
*   `gender` (VARCHAR)
*   `date_of_birth` (DATE)
*   `emergency_contact` (VARCHAR)

### 10.3 Table: `departments`
Stores department details.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `name` (VARCHAR, Unique, Nullable = false)
*   `description` (VARCHAR)
*   `head_name` (VARCHAR)
*   `active` (BOOLEAN, default = true)

### 10.4 Table: `attendance`
Stores daily clock-in / clock-out logs.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = false)
*   `date` (DATE, Nullable = false)
*   `check_in` (TIME)
*   `check_out` (TIME)
*   `work_hours` (DOUBLE PRECISION)
*   `status` (VARCHAR) - ENUM: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `ON_LEAVE`.
*   `remarks` (VARCHAR)

### 10.5 Table: `leave_requests`
Stores leave applications and status.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = false)
*   `leave_type` (VARCHAR, Nullable = false) - ENUM: `ANNUAL`, `SICK`, `CASUAL`, `MATERNITY`, `PATERNITY`, `UNPAID`, `COMPENSATORY`.
*   `start_date` (DATE, Nullable = false)
*   `end_date` (DATE, Nullable = false)
*   `total_days` (INTEGER)
*   `reason` (VARCHAR)
*   `status` (VARCHAR) - ENUM: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.
*   `approved_by` (VARCHAR)
*   `approval_remarks` (VARCHAR)
*   `applied_date` (DATE)

### 10.6 Table: `payrolls`
Stores monthly payroll processing details.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = false)
*   `month` (INTEGER, Nullable = false)
*   `year` (INTEGER, Nullable = false)
*   `basic_salary` (DOUBLE PRECISION, Nullable = false)
*   `bonus` (DOUBLE PRECISION)
*   `deductions` (DOUBLE PRECISION)
*   `tax` (DOUBLE PRECISION)
*   `allowances` (DOUBLE PRECISION)
*   `reimbursements` (DOUBLE PRECISION)
*   `net_salary` (DOUBLE PRECISION)
*   `status` (VARCHAR) - ENUM: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PROCESSED`, `PAID`, `CANCELLED`, `PENDING_REOPEN`.
*   `working_days` (INTEGER)
*   `days_present` (INTEGER)
*   `overtime_hours` (DOUBLE PRECISION)
*   `overtime_pay` (DOUBLE PRECISION)
*   `remarks` (VARCHAR)

### 10.7 Table: `salary_approval_requests`
Tracks salary revisions that require Admin approval.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = false)
*   `previous_salary` (DOUBLE PRECISION, Nullable = false)
*   `proposed_salary` (DOUBLE PRECISION, Nullable = false)
*   `reason` (VARCHAR, Nullable = false)
*   `requested_by` (VARCHAR, Nullable = false)
*   `requested_date` (DATE, Nullable = false)
*   `approved_by` (VARCHAR)
*   `action_date` (DATE)
*   `status` (VARCHAR, Nullable = false) - ENUM: `PENDING`, `APPROVED`, `REJECTED`.

### 10.8 Table: `goals`
Tracks individual employee performance goals.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = false)
*   `title` (VARCHAR, Nullable = false)
*   `description` (VARCHAR)
*   `review_period` (VARCHAR)
*   `target_date` (DATE)
*   `progress_percent` (INTEGER)
*   `status` (VARCHAR) - ENUM: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.
*   `set_by` (VARCHAR)

### 10.9 Table: `performance_reviews`
Stores performance reviews.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = false)
*   `review_period` (VARCHAR, Nullable = false)
*   `review_date` (DATE)
*   `overall_rating` (DOUBLE PRECISION, Nullable = false)
*   `productivity_rating` (DOUBLE PRECISION)
*   `quality_rating` (DOUBLE PRECISION)
*   `teamwork_rating` (DOUBLE PRECISION)
*   `communication_rating` (DOUBLE PRECISION)
*   `comments` (VARCHAR)
*   `goals` (VARCHAR)
*   `reviewed_by` (VARCHAR)
*   `status` (VARCHAR) - ENUM: `DRAFT`, `SUBMITTED`, `ACKNOWLEDGED`.

### 10.10 Table: `recruitment`
Stores job postings and candidate tracking.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `job_title` (VARCHAR, Nullable = false)
*   `department` (VARCHAR, Nullable = false)
*   `job_description` (VARCHAR)
*   `requirements` (VARCHAR)
*   `location` (VARCHAR)
*   `job_type` (VARCHAR)
*   `salary_min` (DOUBLE PRECISION)
*   `salary_max` (DOUBLE PRECISION)
*   `applicant_name` (VARCHAR)
*   `applicant_email` (VARCHAR)
*   `applicant_phone` (VARCHAR)
*   `resume_url` (VARCHAR)
*   `posted_date` (DATE)
*   `closing_date` (DATE)
*   `status` (VARCHAR) - ENUM: `OPEN`, `SCREENING`, `INTERVIEW`, `OFFERED`, `HIRED`, `REJECTED`, `CLOSED`.
*   `openings` (INTEGER)
*   `posted_by` (VARCHAR)

### 10.11 Table: `employee_documents`
Stores document metadata for uploaded onboarding files.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `employee_id` (BIGINT, Foreign Key referencing `employees.id`, Nullable = false)
*   `file_name` (VARCHAR, Nullable = false)
*   `file_path` (VARCHAR, Nullable = false)
*   `file_type` (VARCHAR)
*   `file_size` (BIGINT)
*   `uploaded_at` (TIMESTAMP)

### 10.12 Table: `notifications`
Stores in-app notifications.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `user_email` (VARCHAR, Nullable = false)
*   `title` (VARCHAR, Nullable = false)
*   `message` (VARCHAR, Nullable = false)
*   `type` (VARCHAR) - categories: `SYSTEM`, `EMPLOYEE`, `LEAVE`, `RECRUITMENT`, `PERFORMANCE`, `PAYROLL`.
*   `read` (BOOLEAN, default = false)
*   `created_at` (TIMESTAMP, default = now())
*   `action_url` (VARCHAR)

### 10.13 Table: `refresh_tokens`
Stores user refresh tokens.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `token` (VARCHAR, Unique, Nullable = false)
*   `user_id` (BIGINT, Foreign Key referencing `users.id`, Nullable = false)
*   `expires_at` (TIMESTAMP, Nullable = false)
*   `revoked` (BOOLEAN, default = false)
*   `created_at` (TIMESTAMP, default = now())

### 10.14 Table: `audit_logs`
Stores immutable system logs.
*   `id` (BIGINT, Primary Key, Auto-increment)
*   `timestamp` (TIMESTAMP, Nullable = false)
*   `actor` (VARCHAR, Nullable = false)
*   `action` (VARCHAR, Nullable = false)
*   `target` (VARCHAR, Nullable = false)
*   `details` (VARCHAR)

---

# 11. API Documentation

## 11.1 Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user and returns their profile details and access/refresh tokens.
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "email": "hr@nexushr.com",
      "password": "hr123456"
    }
    ```
*   **Response Code**: `200 OK`
*   **Response Payload**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoci...",
      "refreshToken": "4a861d8a-7c9e-486b-a4ef-a993d0fca2cc",
      "name": "Priya Patel",
      "email": "hr@nexushr.com",
      "role": "HR",
      "userId": 2,
      "employeeId": 2
    }
    ```

### `POST /api/auth/refresh`
Exchanges a refresh token for new access and refresh tokens.
*   **Request Body**:
    ```json
    {
      "refreshToken": "4a861d8a-7c9e-486b-a4ef-a993d0fca2cc"
    }
    ```
*   **Response Payload**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
      "refreshToken": "7c83f982-1a2b-3c4d-5e6f-7a8b9c0d1e2f"
    }
    ```

---

## 11.2 Attendance Endpoints

### `POST /api/attendance/check-in/{employeeId}`
Clocks in an employee for today.
*   **Access**: User must be the owner of the `employeeId` record.
*   **Response Code**: `200 OK` or `500 Internal Server Error` (if already checked in today).
*   **Response Payload**:
    ```json
    {
      "id": 12,
      "employeeId": 1,
      "employeeName": "Aarav Sharma",
      "department": "Engineering",
      "date": "2026-07-25",
      "checkIn": "09:15:30",
      "checkOut": null,
      "workHours": null,
      "status": "PRESENT",
      "remarks": null
    }
    ```

### `GET /api/attendance/stream/{subscriberKey}`
Establishes a Server-Sent Events (SSE) connection to stream punch events.
*   **Access**: `ADMIN`, `HR`, or `MANAGER`.
*   **Headers**: `Accept: text/event-stream`
*   **Query Parameters**: `token` (JWT access token, parsed by filter).
*   **Stream Event**: `attendance-punch`
*   **Event Data**:
    ```json
    {
      "employeeId": 1,
      "employeeName": "Aarav Sharma",
      "email": "employee@nexushr.com",
      "type": "CHECK_IN",
      "time": "09:15:30",
      "status": "PRESENT"
    }
    ```

---

## 11.3 Leave Endpoints

### `POST /api/leave/apply`
Submits a leave request.
*   **Access**: User must be the owner of the employee record.
*   **Request Body**:
    ```json
    {
      "employeeId": 1,
      "leaveType": "ANNUAL",
      "startDate": "2026-08-10",
      "endDate": "2026-08-14",
      "reason": "Family vacation"
    }
    ```
*   **Response Payload**:
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
      "reason": "Family vacation",
      "status": "PENDING",
      "appliedDate": "2026-07-25"
    }
    ```

---

## 11.4 Payroll Endpoints

### `POST /api/payroll/batch/run`
Runs monthly payroll calculations for all employees.
*   **Access**: `ADMIN` or `HR`.
*   **Request Body**:
    ```json
    {
      "month": 7,
      "year": 2026,
      "bonus": 2000.0,
      "deductions": 500.0
    }
    ```
*   **Response Code**: `202 Accepted` (runs asynchronously).
*   **Response Payload**:
    ```json
    {
      "message": "Payroll batch job started for 7/2026",
      "month": 7,
      "year": 2026,
      "status": "RUNNING"
    }
    ```

---

# 12. Frontend Implementation

## 12.1 Theme & State Management
*   **Theme Manager**: [ThemeContext.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/context/ThemeContext.jsx) manages a theme state (`light` or `dark`). It saves the user's preference in local storage under `theme` and toggles the `.dark` utility class on the `document.documentElement` element to style elements using Tailwind's dark selector.
*   **Notifications Hook**: [NotificationContext.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/context/NotificationContext.jsx) polls `/api/notifications` every 30 seconds to update the notification bell badge.

## 12.2 Command Palette (`Ctrl + K`)
The search command palette ([CommandPalette.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/components/CommandPalette.jsx)) opens when a user presses `Ctrl + K`. It filters links and actions based on the user's role (e.g. hiding the "Audit Logs" option from users with role `EMPLOYEE`).

---

# 13. Backend Architecture & Configurations

## 13.1 Multi-Module Project Structure
NexusHR is organized into separate modules using Maven:
*   `common`: Contains shared database entities, DTOs, and the global exception handler.
*   `auth-service`: Handles logins, sessions, and security configurations.
*   `employee-service`: Manages employee data, documents, and department structures.
*   `attendance-service`: Manages daily logs, check-in validation, and leave balances.
*   `payroll-service`: Manages payroll batch jobs, calculations, and CSV reports.
*   `performance-service`: Tracks appraisal ratings and employee goals.
*   `ai-service`: Performs attrition prediction and chatbot operations.
*   `notification-service`: Manages system alerts and email/SMS simulations.
*   `app`: The entrypoint module that runs the main class, database seeder, and dashboard.

## 13.2 Transaction Management
The backend services use `@Transactional` annotations. This ensures that multi-table operations (such as reducing an employee's leave balance when approving a leave request) are executed atomically. If an operation fails, the transaction is rolled back.

---

# 14. Deployment & Infrastructure

## 14.1 Environment Variables
These configurations can be set in `application.properties`:
*   `server.port`: The port the application runs on (default: `8081`).
*   `spring.datasource.url`: Database connection URL (default: `jdbc:postgresql://localhost:5432/nexushr`).
*   `spring.datasource.username` / `password`: Database credentials.
*   `jwt.secret`: Signature key (default: `NexusHRSuperSecretKey2024ProductionGradeJWTKey!@#$%`).
*   `jwt.expiration`: Access token lifetime in milliseconds (default: `86400000`).

---

# 15. Security Hardening

*   **CSRF Protection**: CSRF is disabled because the application uses stateless JWTs instead of cookie-based sessions.
*   **BCrypt Encryption**: Passwords are encrypted using `BCryptPasswordEncoder` with a default strength of 10.
*   **Path Traversal Prevention**: Multipart file uploads are sanitized. The original filename is cleaned of path navigation characters (such as `../`) to prevent directory traversal attacks.

---

# 16. Complete Request Lifecycle

Here is a step-by-step example of the request lifecycle when a user clicks the **Punch In** button:

1.  **Browser (UI Interaction)**: The user clicks the "Punch In" button on the UI. React calls the click handler `handleCheckIn()`.
2.  **API client**: `attendanceService.checkIn(employeeId)` is called, which triggers `axiosInstance.post("/attendance/check-in/1")`.
3.  **Request Interceptor**: The Axios interceptor fetches the JWT token from `localStorage` and appends it as `Authorization: Bearer eyJhbGci...`.
4.  **Network Transport**: The browser sends an HTTP POST request to `http://localhost:8081/api/attendance/check-in/1`.
5.  **Servlet Filters (Security)**: Spring Security intercepts the request. `JwtFilter` extracts the token, validates its signature, and maps the user's role claim. A `UsernamePasswordAuthenticationToken` is set in `SecurityContextHolder`.
6.  **Method Security Guard**: The endpoint checker validates the `@PreAuthorize("@securityHelper.isOwner(#employeeId)")` expression. It checks if the authenticated user's ID matches the `employeeId` in the path.
7.  **Controller Routing**: The request reaches `AttendanceController.checkIn(Long employeeId)`. The controller calls `attendanceService.checkIn(employeeId)`.
8.  **Service Business Logic**: `AttendanceServiceImpl` validates that the employee exists and has not checked in today. It creates an `Attendance` record with the current timestamp and a status of `PRESENT`.
9.  **Database Persistence**: The repository calls `attendanceRepository.save(attendance)`. Hibernate translates the entity update into an SQL `INSERT` statement and executes it against the PostgreSQL database.
10. **Events Dispatching**: The service calls `AttendanceEventPublisher` to push the punch event. The publisher broadcasts the event payload to all active `SseEmitter` instances.
11. **System Audit Log**: The system creates a log entry using a REST call to `/api/audit-logs` containing the action details.
12. **HTTP Response**: The controller serializes the attendance record into a DTO and sends a `200 OK` response.
13. **UI rendering**: The React client receives the updated data, updates its component state, and renders the updated check-in status and logs in the table view.

---

# 17. Hidden Business Logic & Rules

*   **Direct Salary Revision Block**: Only users with the `ADMIN` role can edit base salaries directly. HR users must submit revision requests that require Admin approval.
*   **Automatic Department Heads**: The department head is not set manually. Instead, `OrgChartService` automatically designates the employee with the highest salary in the department as the department head.
*   **Overtime Thresholds**: Overtime is calculated based on hours worked beyond a 9-hour daily limit. The overtime rate is calculated as 1.5 times the base hourly wage.

---

# 18. Design Decisions & Tradeoffs

*   **Opaque Refresh Tokens**: Short-lived JWTs are used for authentication to avoid querying the database on every request. Long-lived opaque UUID refresh tokens are stored in the database to allow Admins to revoke user sessions when needed.
*   **Local Storage Uploads**: Files are stored on the local file system instead of a cloud provider to simplify local development. In production, this can be updated to use an S3 or Google Cloud Storage client by updating the storage configuration.

---

# 19. Developer Notes

*   **Database Seeding**: The `DataSeeder` class populates the database with demo accounts (Admin: `admin@nexushr.com` / `admin123`, HR: `hr@nexushr.com` / `hr123456`, Employee: `employee@nexushr.com` / `emp12345`) on startup. It is designed to be idempotent and checks database counts before running.
*   **CORS Configuration**: The CORS policy allows requests from all origins (`*`) with credentials. In a production environment, this should be restricted to specific allowed origins.
*   **Token Refresh Interceptors**: The Axios response interceptor intercepts `401` errors and refreshes the token automatically. If the token refresh request fails, the interceptor logs out the user and redirects them to the login screen.

---

# 20. AI Context Summary

To quickly understand the project context, review these key files:
*   **Main Configuration**: [application.properties](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/resources/application.properties)
*   **Security Configuration**: [SecurityConfig.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityConfig.java)
*   **Ownership Logic**: [SecurityHelper.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityHelper.java)
*   **Attendance Service**: [AttendanceServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/attendance-service/src/main/java/com/nexushr/service/impl/AttendanceServiceImpl.java)
*   **Leave Processing**: [LeaveRequestServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/attendance-service/src/main/java/com/nexushr/service/impl/LeaveRequestServiceImpl.java)
*   **Payroll Service**: [PayrollServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/payroll-service/src/main/java/com/nexushr/service/impl/PayrollServiceImpl.java)
*   **Predictive AI models**: [AttritionPredictionService.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/ai-service/src/main/java/com/nexushr/ai/AttritionPredictionService.java), [SkillGapAnalyser.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/ai-service/src/main/java/com/nexushr/ai/SkillGapAnalyser.java)
*   **Frontend Routing**: [AppRoutes.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/routes/AppRoutes.jsx)
*   **API Interceptor**: [axiosInstance.js](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/api/axiosInstance.js)
