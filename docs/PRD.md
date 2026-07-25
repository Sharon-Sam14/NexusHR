# Product Requirements Document (PRD) — NexusHR

## 1. Product Vision
**NexusHR** is a comprehensive workforce management platform designed for growing enterprises. It simplifies HR processes by consolidating employee directories, time tracking, leave planning, payroll automation, appraisals, and talent analytics into a single application.

---

## 2. User Roles & Permission Matrices

The platform supports three distinct roles, each with defined access permissions:

| Module / Action | Employee | HR Manager | System Admin |
| :--- | :--- | :--- | :--- |
| **Login / Logout / Reset** | Yes | Yes | Yes |
| **Clock In / Clock Out** | Yes (Own Only) | Yes (Own Only) | Yes (Own Only) |
| **Manual Punch Correction** | No | Yes (All) | Yes (All) |
| **Apply for Leave** | Yes | Yes | Yes |
| **Approve / Reject Leave** | No | Yes | Yes |
| **View Employee Directory** | No | Yes | Yes |
| **Onboard / Delete Employee**| No | Onboard Only | Yes (Full CRUD) |
| **Direct Salary Changes** | No | No (Must submit request) | Yes |
| **Run Payroll Batch** | No | Yes | Yes |
| **Download CSV / Print Payslip**| Yes (Own Only) | Yes (All) | Yes (All) |
| **Create Performance Review** | No | Yes | Yes |
| **Acknowledge Review** | Yes (Own Only) | No | No |
| **View Audit Logs** | No | No | Yes |
| **View AI Attrition / Gaps** | No | Yes | Yes |

---

## 3. Product Features & Requirements

### 3.1 Authentication & Security
*   **stateless Auth**: User sessions are authenticated using stateless JSON Web Tokens (JWTs).
*   **Rotation**: Refresh tokens are rotated on every validation request to prevent replay attacks.
*   **Ownership Check**: Employees can only view their own leave, payroll, and review records.

### 3.2 Attendance & Real-Time Punch Streaming
*   **Real-Time Clock**: Shows current date and time on check-in.
*   **SSE Punch Event Broadcasts**: Punch actions broadcast events to active SSE emitters to update HR dashboards in real-time.
*   **Late & Half-Day Statuses**: Check-in times after 09:15 AM are flagged as `LATE`. Work shifts shorter than 4 hours are flagged as `HALF_DAY`.

### 3.3 Leave Request Workflow
*   **Leave Types**: Annual, Sick, Casual, Maternity, Paternity, Unpaid, and Compensatory leaves.
*   **Sufficiency Guard**: System checks leave balance before request submission.
*   **Balance Engine**: Reduces leave balance on approval and restores balance if a request is cancelled or rejected.

### 3.4 Payroll Automation
*   **Dynamic Working Days**: Standard working days are calculated based on the month.
*   **Overtime Pay**: Paid at 1.5 times the hourly rate for hours worked beyond 9 hours in a day.
*   **Tax Brackets**: Progressive tax calculation based on base salary.
*   **Salary Revision Approvals**: Revisions requested by HR must be approved by Admin. Recalculates current month's payroll on approval.

### 3.5 Performance Appraisals & Goals
*   **Review Ratings**: Productivity, Quality, Teamwork, Communication, and Overall (1–5 scale).
*   **Goals Tracking**: Assigns progress tracking goals (0–100%).

### 3.6 AI Workforce Analytics
*   **Attrition Risk Model**: Rule-based attrition risk assessment (Low, Medium, High).
*   **Skill Gaps Mapping**: Compares employee performance against role requirements to detect skill gaps.
*   **HR Co-pilot Chatbot**: Answers user queries using live database statistics.
