# NexusHR: Final AI Engineering Knowledge Base & Flow Mapping

This document provides a highly technical, flow-mapped reference for the **NexusHR** workforce management platform. It complements the high-level handoff documentation by detailing internal call paths, database transactions, dependency maps, security boundaries, and specific extension points.

---

# 1. Complete Call Graph & Execution Flows

Below are step-by-step execution flows trace diagrams for critical actions, mapped from the user's browser down to the database and back.

## 1.1 Action: Clock In (Punch In)
```
User Click ("Punch In" button in Dashboard.jsx)
  │
  ▼
React Component: src/pages/dashboard/Dashboard.jsx ──► calls checkIn()
  │
  ▼
Context: src/context/AuthContext.jsx (provides logged-in employeeId)
  │
  ▼
API Service: src/services/attendanceService.js ──► calls checkIn(employeeId)
  │
  ▼
Axios instance: src/api/axiosInstance.js ──► adds "Authorization: Bearer <token>"
  │
  ▼
REST Endpoint: POST http://localhost:8081/api/attendance/check-in/{employeeId}
  │
  ▼
Filter: src/security/JwtFilter.java (extracts token and populates SecurityContext)
  │
  ▼
Controller: com.nexushr.controller.AttendanceController ──► mapping: checkIn(@PathVariable Long employeeId)
  │ (Gated by @PreAuthorize("@securityHelper.isOwner(#employeeId)"))
  ▼
Service Interface: com.nexushr.service.AttendanceService
  │
  ▼
Service Implementation: com.nexushr.service.impl.AttendanceServiceImpl ──► method: checkIn(employeeId)
  │
  ├─► Repository: EmployeeRepository.findById(employeeId) ──► fetches Employee
  ├─► Repository: AttendanceRepository.findFirstByEmployeeIdAndDate(employeeId, LocalDate.now())
  │     (Checks if check-in already exists. Throws RuntimeException if present)
  │
  ├─► Instantiates: Attendance entity with checkIn = LocalTime.now(), status = PRESENT
  ├─► Repository: AttendanceRepository.save(attendance) ──► issues SQL INSERT
  │
  ├─► Event Publisher: AttendanceEventPublisher.publishPunch(attendance, "CHECK_IN")
  │     (Broadcasts SSE punch event to active SseEmitter channels)
  │
  └─► Audit Utility: REST POST to /api/audit-logs ──► issues SQL INSERT into audit_logs
  │
  ▼
Response serialization: Jackson converts DTO to JSON
  │
  ▼
Frontend rendering: axiosInstance resolves Promise ──► state updates ──► Dashboard UI displays check-in time
```

## 1.2 Action: Apply for Leave
```
User Form Submission ("Request Leave" form in LeaveManagement.jsx)
  │
  ▼
React Component: src/pages/leave/LeaveManagement.jsx ──► calls handleApplyLeave()
  │
  ▼
API Service: src/services/leaveService.js ──► calls apply(leaveData)
  │
  ▼
Axios instance: src/api/axiosInstance.js ──► adds JWT header
  │
  ▼
REST Endpoint: POST http://localhost:8081/api/leave/apply
  │
  ▼
Controller: com.nexushr.controller.LeaveRequestController ──► mapping: applyLeave(@RequestBody LeaveRequestDTO dto)
  │ (Gated by @PreAuthorize("@securityHelper.isOwner(#dto.employeeId)"))
  ▼
Service Implementation: com.nexushr.service.impl.LeaveRequestServiceImpl ──► method: applyLeave(dto)
  │
  ├─► Repository: EmployeeRepository.findById(dto.employeeId)
  │
  ├─► Balance Verification: Check if employee.leaveBalance < totalDays.
  │     (Throws RuntimeException if leaves requested exceeds current balance)
  │
  ├─► Overlap Verification: Check if leave requests exist in database for date range.
  │     (Throws RuntimeException if overlapping leaves found)
  │
  ├─► Instantiates: LeaveRequest entity with status = PENDING
  ├─► Repository: LeaveRequestRepository.save(request) ──► issues SQL INSERT
  │
  └─► Notification: NotificationDispatcher.dispatch(SYSTEM, "New Leave Request from " + employeeName)
  │     (Saves to notifications table, calls simulated SMTP/Twilio logger)
  │
  ▼
Response: Returns LeaveRequestDTO JSON ──► updates table view in LeaveManagement.jsx
```

## 1.3 Action: Salary Revision Approval
```
Admin Click ("Approve" button in Payroll.jsx)
  │
  ▼
React Component: src/pages/payroll/Payroll.jsx ──► calls handleApproveRevision(id)
  │
  ▼
API Service: src/services/payrollService.js ──► calls approveSalaryRevision(id, approvalDetails)
  │
  ▼
REST Endpoint: POST http://localhost:8081/api/payroll/salary-approval/{id}/approve
  │
  ▼
Controller: com.nexushr.controller.SalaryApprovalController ──► mapping: approve(@PathVariable Long id)
  │ (Gated by @PreAuthorize("hasRole('ADMIN')"))
  ▼
Service Implementation: com.nexushr.service.impl.SalaryApprovalServiceImpl ──► method: approve(id)
  │
  ├─► Repository: SalaryApprovalRequestRepository.findById(id) ──► status must be PENDING
  ├─► Entity Update: SalaryApprovalRequest status = APPROVED, actionDate = LocalDate.now()
  ├─► Repository: EmployeeRepository.findById(request.employee.id)
  ├─► Entity Update: Employee salary = request.proposedSalary
  ├─► Repository: EmployeeRepository.save(employee) ──► issues SQL UPDATE on employees
  │
  ├─► Recalculate Current Payroll: 
  │     Loops through unpaid payrolls for this employee. Recalculates basic salary, tax, and net salary.
  │     Issues SQL UPDATE statements on payrolls table.
  │
  └─► Notification: NotificationDispatcher.dispatch(PAYROLL, "Salary revision approved")
  │
  ▼
Response: Returns updated SalaryApprovalRequest DTO ──► UI updates revision status in Payroll.jsx
```

---

# 2. Key File Dependency Map

Below are dependency profiles for essential configurations, filters, and state providers in the codebase.

## 2.1 Backend Config: [SecurityConfig.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityConfig.java)
*   **Imports**: `org.springframework.security.config.annotation.*`, `com.nexushr.security.JwtFilter`
*   **What it Configures**: Security filter chains, password encoders, and route authorization gates.
*   **Dependents**: `auth-service` module, global Spring context.
*   **Impact of Changes**: Modifying this file can expose secure routes or disrupt JWT request validation.

## 2.2 Backend Filter: [JwtFilter.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/JwtFilter.java)
*   **Imports**: `com.nexushr.security.JwtTokenProvider`, `jakarta.servlet.*`
*   **What it Configures**: Extracts, parses, and validates request tokens.
*   **Dependents**: Configured in `SecurityConfig.java`.
*   **Impact of Changes**: Errors here can cause all authenticated requests to fail with a `401 Unauthorized` status.

## 2.3 Backend Helper: [SecurityHelper.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityHelper.java)
*   **Imports**: `com.nexushr.repository.*`, `org.springframework.security.core.context.*`
*   **What it Configures**: Exposes SpEL methods to verify employee records ownership.
*   **Dependents**: Controllers across modules (using `@PreAuthorize("@securityHelper.isOwner(#id)")`).
*   **Impact of Changes**: Security gaps or class cast errors can occur if logical checks are modified.

## 2.4 Frontend Hook: [axiosInstance.js](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/api/axiosInstance.js)
*   **Imports**: `axios`, `localStorage` keys
*   **What it Configures**: Configures the default Axios client, request headers, and response interceptors.
*   **Dependents**: All frontend files under `services/`.
*   **Impact of Changes**: Network request failures or infinite token refresh loops if credentials rotation fails.

## 2.5 Frontend State: [AuthContext.jsx](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/src/context/AuthContext.jsx)
*   **Imports**: `react`, `authService`
*   **What it Configures**: Manages user login states, access roles, and saves session tokens.
*   **Dependents**: `AppRoutes.jsx`, `ProtectedRoute.jsx`, and views displaying role-specific headers.
*   **Impact of Changes**: Session state sync issues or routing loops between login and dashboard.

---

# 3. Business Rule Map

| No. | Business Rule | Rationale | Class & Method | Database Impact |
| :--- | :--- | :--- | :--- | :--- |
| **3.1** | Attendance: Single daily check-in. | Prevents duplicate daily timecards. | [AttendanceServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/attendance-service/src/main/java/com/nexushr/service/impl/AttendanceServiceImpl.java#L40) (`checkIn`) | Throws exception before saving; prevents duplicate rows in `attendance` table. |
| **3.2** | Leave: Positive balance check. | Prevents employees from requesting more leave days than their balance. | [LeaveRequestServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/attendance-service/src/main/java/com/nexushr/service/impl/LeaveRequestServiceImpl.java#L52) (`applyLeave`) | Prevents transaction commit; rollback ensures `leave_requests` is not modified. |
| **3.3** | Leave: No overlapping leaves. | Prevents employees from submitting multiple leave requests for the same date range. | [LeaveRequestServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/attendance-service/src/main/java/com/nexushr/service/impl/LeaveRequestServiceImpl.java#L56) (`applyLeave`) | Rolls back transaction; prevents overlapping dates. |
| **3.4** | Payroll: Direct salary changes blocked for HR. | Enforces separations of duty. HR must submit revision requests for Admin approval. | [EmployeeServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/employee-service/src/main/java/com/nexushr/service/impl/EmployeeServiceImpl.java#L64) (`updateEmployee`) | Blocks direct salary updates in `employees` table. |
| **3.5** | Security: Record ownership verification. | Prevents employees from viewing or editing other users' records. | [SecurityHelper.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/security/SecurityHelper.java#L25) (`isOwner`) | Throws `AccessDeniedException` before executing database queries. |
| **3.6** | Payroll: Current-month payroll recalculation. | Keeps payroll aligned with approved salary revisions. | [SalaryApprovalServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/payroll-service/src/main/java/com/nexushr/service/impl/SalaryApprovalServiceImpl.java#L112) (`approve`) | Updates salary in `employees` table and recalculates `payrolls` values. |
| **3.7** | Auth: Session termination. | Revokes previous refresh tokens to prevent session replay attacks. | [RefreshTokenServiceImpl.java](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/auth-service/src/main/java/com/nexushr/service/impl/RefreshTokenServiceImpl.java#L40) (`createRefreshToken`) | Updates previous refresh token records to `revoked = true`. |

---

# 4. Database Flow & Transaction Design

Database flows for critical endpoints, including CRUD profiles, transaction details, and indexing constraints.

```
       API Call          JwtFilter Authentication     Method Security Validation      DB Transaction
          │                         │                            │                           │
          ▼                         ▼                            ▼                           ▼
   [POST /leave/apply] ──► [Parse access token] ──► [Assert SecurityHelper.isOwner] ──► [@Transactional]
                                                                                             │
                                                                               ┌─────────────┴─────────────┐
                                                                               ▼                           ▼
                                                                        [Check Balance]            [Check Overlaps]
                                                                               │                           │
                                                                               └─────────────┬─────────────┘
                                                                                             ▼
                                                                                     [INSERT Row saved]
```

## 4.1 Endpoint: `POST /api/leave/apply`
*   **Reads**: Reads `employees.leave_balance` to verify remaining leaves, and queries `leave_requests` to check for overlapping requests.
*   **Writes**: Inserts a new row in the `leave_requests` table.
*   **Transaction Profile**: Configured as `@Transactional` with `propagation = Propagation.REQUIRED`.
*   **Rollback Conditions**: Triggers a rollback for any `RuntimeException` (e.g. if the requested leave days exceed the current balance or if date range overlaps occur).
*   **Indexes Used**: `idx_leave_emp_dates` (composite index on `employee_id`, `start_date`, and `end_date`).

## 4.2 Endpoint: `POST /api/attendance/check-in/{employeeId}`
*   **Reads**: Reads employee status from `employees` and queries `attendance` to check for existing check-ins for the current date.
*   **Writes**: Inserts a new record in `attendance` with `status = PRESENT`.
*   **Transaction Profile**: Configured as `@Transactional` with `propagation = Propagation.REQUIRED`.
*   **Rollback Conditions**: Triggers a rollback if the employee has already checked in today or if data seeder issues occur.
*   **Indexes Used**: `idx_attendance_emp_date` (composite index on `employee_id` and `date`).

## 4.3 Endpoint: `POST /api/payroll/salary-approval/{id}/approve`
*   **Reads**: Reads `salary_approval_requests` (matching the ID), `employees` (matching the target employee ID), and unpaid records in `payrolls`.
*   **Updates**: Updates `salary_approval_requests.status = APPROVED`, `employees.salary = proposed_salary`, and basic salary and tax calculations in `payrolls`.
*   **Transaction Profile**: Configured as `@Transactional` with `propagation = Propagation.REQUIRED` and `isolation = Isolation.READ_COMMITTED`.
*   **Rollback Conditions**: Triggers a rollback if database write operations fail or if calculations throw exceptions.

---

# 5. Core Class Specifications

## 5.1 Class: `AttendanceServiceImpl`
*   **Purpose**: Manages daily attendance logs.
*   **Methods**:
    *   `checkIn(Long employeeId)`: Validates rules and inserts check-in logs.
    *   `checkOut(Long employeeId)`: Calculates work hours and updates today's log.
    *   `addManualRecord(AttendanceDTO dto)`: Inserts manual logs.
*   **Dependencies**: `AttendanceRepository`, `EmployeeRepository`, `AttendanceEventPublisher`.
*   **Called By**: `AttendanceController`.
*   **Calls**: `AttendanceRepository`, `AttendanceEventPublisher`.

## 5.2 Class: `LeaveBalanceEngine`
*   **Purpose**: Calculates and updates employee leave balances.
*   **Methods**:
    *   `deduct(Employee employee, int days)`: Reduces the employee's leave balance.
    *   `refund(Employee employee, int days)`: Restores leave days to the balance pool.
*   **Dependencies**: `EmployeeRepository`.
*   **Called By**: `LeaveRequestServiceImpl`.

## 5.3 Class: `PayrollCalculator`
*   **Purpose**: Computes payroll calculations (such as taxes, overtime pay, and deductions).
*   **Methods**:
    *   `calculateTax(double salary)`: Returns tax calculations based on progressive tax brackets.
    *   `calculateOvertime(double baseSalary, double hours)`: Computes overtime pay.
    *   `calculateNetSalary(...)`: Returns final net salary.
*   **Dependencies**: None. Stateless calculations.
*   **Called By**: `PayrollServiceImpl`, `SalaryApprovalServiceImpl`.

---

# 6. Detailed Frontend Architecture

The React Single Page Application (SPA) client coordinates user state and secure API queries.

## 6.1 State & Routing Map
```
App.jsx (Router)
  │
  ├─► ThemeContext (Manages dark/light theme body styles)
  ├─► AuthContext (Stores user credentials and auth status)
  │     │
  │     └─► ProtectedRoute.jsx (Checks role access permissions)
  │           │
  │           └─► MainLayout.jsx (Displays Topbar and Sidebar)
  │                 │
  │                 ├─► Dashboard.jsx (Renders metrics and punch clock widgets)
  │                 ├─► Employees.jsx (Onboarding views and org charts)
  │                 ├─► Attendance.jsx (Logs and real-time SSE tables)
  │                 ├─► Payroll.jsx (Appraisal controls and revision tools)
  │                 └─► AiInsights.jsx (Attrition charts and AI chatbot drawer)
```

## 6.2 Token Interceptor Flow
```
Client Request ──► axiosInstance.js (Interceptor) ──► Adds Bearer Token header ──► Backend
                                                                                     │
                                                                       ┌─────────────┴─────────────┐
                                                                       ▼                           ▼
                                                                  [HTTP 200 OK]              [HTTP 401 Error]
                                                                       │                           │
                                                                   Resolve API                Interceptor catches 401
                                                                                                   │
                                                                                                   ▼
                                                                                      Request rotated JWT via refresh
                                                                                                   │
                                                                                      Retry original network request
```

---

# 7. Detailed Backend Flow

This section details the Spring Boot JVM startup and request lifecycle.

```
JVM Startup ──► Spring Context Initialization ──► Scans Beans (Controllers, Services)
            ──► Seeds Initial Data (DataSeeder) ──► Server listens on port 8081
```

## 7.1 Request Lifecycle
1.  **Network Entry**: The servlet container receives the HTTP request on port `8081`.
2.  **Filter Chain**: The request passes through servlet filters. `JwtFilter` processes the `Authorization` header. If valid, the user's details and role authority are set in `SecurityContextHolder`.
3.  **Route Mapping**: `DispatcherServlet` maps the URL to a matching controller method.
4.  **Authorization Verification**: Method-level security annotations (`@PreAuthorize`) verify that the user's role has permission to access the endpoint.
5.  **Service Processing**: The controller calls the service layer. Operations are executed inside a `@Transactional` block.
6.  **Database Persistence**: Hibernate translates entity changes into SQL statements and executes them against PostgreSQL.
7.  **Response Construction**: The controller serializes the return value into a JSON response.

---

# 8. Security Review

*   **Authentication**: Uses stateless JWTs with HMACS-SHA256 signatures, combined with database-backed refresh token rotation.
*   **Role-Based Access Control (RBAC)**: Defined roles include `ADMIN`, `HR`, and `EMPLOYEE`. Security constraints are enforced at the routing level in `SecurityConfig.java` and at the method level using `@PreAuthorize`.
*   **Direct Salary Revision Block**: Direct updates to employee salary fields are blocked for HR. Salary updates must be requested through `SalaryApprovalRequest` and approved by Admin.
*   **Input Sanitization**: Database inputs are sanitized. File uploads are validated to prevent path navigation and directory traversal attacks.

---

# 9. Performance Review

*   **N+1 Query Verification**: Relationships (such as `Employee.documents` and `User.employee`) use `FetchType.LAZY` to prevent N+1 query performance issues.
*   **Database Indexing**: Indexes are added to foreign keys and search fields (such as `attendance(employee_id, date)` and `leave_requests(employee_id, status)`).
*   **SSE Scalability**: The real-time attendance dashboard uses Server-Sent Events (SSE). Connections are stored in thread-safe collections (`ConcurrentHashMap`). Inactive or disconnected emitters are automatically pruned to free up memory.

---

# 10. Complete Configuration Guide

## 10.1 Key Properties: [application.properties](file:///c:/Users/sharo/Desktop/NexusHR-main/backend/app/src/main/resources/application.properties)
*   `server.port=8081`: The port the backend application runs on.
*   `spring.datasource.url`: The PostgreSQL database connection URL.
*   `spring.jpa.hibernate.ddl-auto=update`: Auto-updates the database schema based on JPA entities during startup.
*   `jwt.secret`: HMAC signature key.
*   `jwt.expiration=86400000`: Access token lifetime in milliseconds.

## 10.2 Maven Submodules: `pom.xml`
The root POM manages dependency scopes for the modules:
*   `common` depends on Hibernate and Lombok annotations.
*   `auth-service` depends on `common` and Spring Boot Security.
*   `employee-service` depends on `common`.
*   `attendance-service` depends on `common`.
*   `payroll-service` depends on `common` and `iText 5` (for PDF generation).
*   `performance-service` depends on `common`.
*   `ai-service` depends on `common`.
*   `notification-service` depends on `common`.
*   `app` depends on all service modules.

---

# 11. Feature Relationship Map

Data flows across modules are orchestrated as follows:

```
[Employee Punch In] ──► [Logs saved in Attendance Module]
                    ──► [SSE Event sent to Dashboard]
                    ──► [Payroll Module processes hours and calculates overtime]
                    ──► [AI Insights Module calculates engagement index]
                    ──► [Notification Module sends email/SMS alerts]
                    ──► [Audit logs record actions]
```

*   **Attendance to Payroll**: Payroll runs fetch attendance logs to calculate working days and overtime hours.
*   **Attendance/Performance to AI**: Attrition risk scoring models analyze attendance patterns and appraisal ratings.
*   **System Actions to Notifications**: System operations trigger notifications to target users.

---

# 12. Future Extension Points

This section outlines how to integrate new features and the specific files that need modification.

## 12.1 Feature: Biometric Attendance (Face/Fingerprint API)
1.  **New Controller**: Create `BiometricPunchController.java` in the `attendance-service` module to receive webhook payloads from biometric devices.
2.  **Add Service Methods**: Add API integration logic in `AttendanceService` to map device logs to employee records.
3.  **Update Config**: Register the biometric webhook path as public in `SecurityConfig.java`.

## 12.2 Feature: AWS S3 Cloud Storage
1.  **Add Dependency**: Add the `aws-java-sdk-s3` dependency in `backend/pom.xml`.
2.  **Add Configuration**: Add AWS S3 credentials in `application.properties`.
3.  **Update Upload Service**: Replace the local file writing code in `DocumentController.java` with S3 client upload methods.

## 12.3 Feature: Microservices Architecture
1.  **Dockerization**: Separate service modules (`auth`, `employee`, `attendance`, `payroll`, `performance`, `ai`, `notification`) into standalone Spring Boot applications, each with their own Dockerfile.
2.  **Gateway Configuration**: Deploy an API gateway (e.g. Spring Cloud Gateway) to route incoming client traffic to the respective service ports.
3.  **Event Broker Configuration**: Configure Apache Kafka or RabbitMQ to coordinate communication between microservices.

---

# 13. Technical Debt & Known Limitations

*   **stateless JWT Revocation**: Active JWT access tokens cannot be revoked before they expire. If a user logs out, their token remains valid until its expiration time.
*   **Local File Storage**: The system saves uploaded documents directly to the local disk. In a containerized or multi-instance setup, this can lead to sync issues. The upload service should be migrated to cloud object storage.
*   **AI Chatbot Engine**: The HR chatbot uses pattern matching to query database stats. For more advanced features, this should be upgraded to use a proper Large Language Model (LLM) integration.

---

# 14. AI Developer Memory

Load this prompt block into your context window to quickly understand the codebase:

```prompt
You are an AI assistant working on NexusHR.

Architecture:
- React 18, Vite frontend client on port 5173. Calls APIs via axiosInstance.js.
- Spring Boot 3.2.5 Java 21 backend on port 8081. Routes are filtered by JwtFilter.java.
- Security constraints: JwtFilter validates token headers. Session metadata is stored in SecurityContextHolder.

Key Business Rules:
1. HR users cannot update employee base salaries directly. Salary changes must be requested through SalaryApprovalRequest and approved by Admin.
2. Employees can only check in once per day.
3. Leave requests must be verified against the employee's leave balance before submission.
4. Overtime is calculated at 1.5 times the base rate for hours worked beyond 9 hours in a day.
5. Deletion and status updates for employees are restricted to the ADMIN role.

Database Tables:
- users, employees, departments, attendance, leave_requests, payrolls, salary_approval_requests, goals, performance_reviews, recruitment, employee_documents, notifications, refresh_tokens, audit_logs.

Refer to docs/AI_Engineering_Knowledge_Base.md for call graphs, transaction models, and database flows.
```
