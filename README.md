# NexusHR – Enterprise HR & Workforce Management System

> A production-grade, full-stack HR management platform built for the **Zidio Java Full Stack Internship Project 2026**.

NexusHR centralises every HR operation — employee lifecycle, attendance, leave, payroll, performance, recruitment, scheduling, and AI-powered workforce intelligence — into a single, premium web application.

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Node.js 18+
- Maven
- PostgreSQL database

### Run Backend
1.  Connect to your PostgreSQL server and create a database named `nexushr`:
    ```sql
    CREATE DATABASE nexushr;
    ```
2.  Configure your credentials in `backend/app/src/main/resources/application.properties` and run:
    ```bash
    cd backend
    mvn spring-boot:run -pl app
    ```
    *Starts on http://localhost:8081. PostgreSQL database schema is automatically created and seeded on startup.*

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*Starts on http://localhost:5173.*

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|:---|:---|:---|:---|
| **System Admin** | `admin@nexushr.com` | `admin123` | Full control — all modules, delete employees |
| **HR Manager** | `hr@nexushr.com` | `hr123456` | Workforce management, leave approvals, payroll runs, AI Insights |
| **Employee** | `employee@nexushr.com` | `emp12345` | Own attendance, leaves, payslips, performance reviews |

---

## ✨ Core Features

### 🔒 Authentication & Security
- **JWT Access Tokens** — short-lived, stateless, signed with HMAC-SHA.
- **Refresh Token Rotation** — long-lived refresh tokens stored in DB; rotated on every use to prevent replay attacks.
- **BCrypt Password Encoding** — all passwords hashed with BCryptPasswordEncoder.
- **Role-Based Access Control** — `ADMIN`, `HR`, `EMPLOYEE` roles enforced at controller level via Spring Security `@PreAuthorize`.
- **Ownership Checks** — custom `SecurityHelper` bean (`isOwner`, `isPayrollOwner`, `isLeaveOwner`) prevents cross-user data access.

### 📊 Dashboard
- Role-aware stat cards — different KPIs for HR/Admin vs Employee.
- Live charts: attendance trend (BarChart), leave distribution (PieChart), payroll overview (AreaChart), performance (RadarChart) — powered by **Recharts**.
- Employee of the Month spotlight — highest performance rating from DB.
- **Today's Schedule card** — HR/Admin can add & delete schedule items inline.
- **View Schedule** — links to the dedicated `/schedule` calendar page.

### 👨‍💼 Employee Management *(HR/Admin only)*
- Full CRUD — add, edit, view, delete employee profiles.
- 11-field onboarding form: name, email, phone, department, designation, salary, joining date, DOB, gender, address, emergency contact.
- Client-side 3-way filtering: search by name/email/designation, filter by department and status.
- Status workflow: `ACTIVE → INACTIVE → ON_LEAVE → TERMINATED`.
- Delete restricted to **ADMIN** role only.

### ⏰ Attendance
- Employee check-in / check-out (real-time clock).
- HR manual entry and record editing.
- Status types: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `ON_LEAVE`.
- **Server-Sent Events (SSE)** stream at `/api/attendance/stream/{id}` for live updates.
- Role-gated: HR sees all records; employee sees only their own.

### 📅 Schedule
- Full monthly calendar with month navigation and event dot indicators.
- Click any day → right panel shows that day's events with type icons, time, and location.
- HR/Admin can **Add** events (title, time, location, type, colour) and **Delete** events.
- Upcoming panel shows the next 3 days of events.
- Event types: Meeting, Interview, Break, Review, Other.
- 5 colour themes per event for visual distinction.

### 🌴 Leave Management & Document Uploads
- Employees apply for leave with type, date range, and reason.
- **Mandatory Medical Certificate Upload for SICK / Medical Leave:**
  - Selecting `SICK` leave triggers a drag-and-drop document upload field.
  - File constraints enforced: PDF, JPG, JPEG, PNG only; maximum size limit **10MB**.
  - Empty files are blocked. Leaves cannot be submitted without a valid uploaded certificate.
  - Files are uploaded to Cloudinary (with automatic local disk fallback in mock/development mode).
- **HR Review Queue & Actions:**
  - HR view and Employee personal view split into separate tabs.
  - Pending sick leaves display Eye (Preview) and Download icons in the grid.
  - Clicking Approve/Reject loads a review modal showing the uploaded medical certificate with inline preview and download options.
- HR approves or rejects with remarks — `PATCH /api/leave/{id}/approve` or `/reject`.
- Status flow: `PENDING → APPROVED / REJECTED / CANCELLED`.
- Leave types: `ANNUAL`, `SICK`, `CASUAL`, `MATERNITY`, `PATERNITY`, `UNPAID`, `COMPENSATORY`.

### 💰 Payroll
- **Generate individual payroll** — select employee, set period, bonus, deductions, tax, working days.
- **Run Monthly Batch** — processes all employees asynchronously in one click.
- **Mark as Paid** — updates payroll status to `PAID`.
- **View Payslip** — full modal breakdown: Basic + Bonus − Deductions − Tax = Net Payout.
- **Download CSV** — one-click payslip export triggered via Blob download API.
- **Print Payslip** — `window.print()` with print-optimised modal styling.
- Formula: `Net = Basic + Bonus (₹2,000) − Deductions (₹500) − Tax (15% of basic)`.

### ⭐ Performance Reviews
- HR creates quarterly performance reviews with 5 rating dimensions: Productivity, Quality, Teamwork, Communication, Overall.
- Employees can **acknowledge** their own review.
- Status workflow: `DRAFT → SUBMITTED → ACKNOWLEDGED`.
- **Goals sub-feature**: individual goals with progress percentage (`0–100%`) and status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).

### 🧑‍💼 Recruitment
- Job posting board with card-based UI.
- Hiring pipeline: `OPEN → SCREENING → INTERVIEW → OFFERED → HIRED / REJECTED / CLOSED`.
- Full CRUD for job postings — title, department, description, requirements, salary range, location, openings.

### 🤖 AI Workforce Intelligence *(HR/Admin only)*
- **Attrition Risk Prediction** — rule-based scoring (LOW / MEDIUM / HIGH) per employee based on salary, performance, leave patterns, and tenure.
- **Skill Gap Analysis** — maps employee designations to expected competency levels per department.
- **HR Co-pilot Chatbot** — floating AI drawer accessible anywhere; type natural language queries and get live DB-driven responses via `POST /api/ai/chat`.

### 🔔 Notifications
- Per-user notifications with read/unread state.
- Topbar bell icon with unread dot badge and inline dropdown (last 8).
- Full Notifications page with type icons and `timeAgo()` formatting.
- Types: `SYSTEM`, `EMPLOYEE`, `LEAVE`, `RECRUITMENT`, `PERFORMANCE`, `PAYROLL`.

### ⌨️ Command Palette (`Ctrl+K`)
- Spotlight-style fuzzy search overlay.
- Role-aware: HR-only commands hidden from employees.
- Full keyboard navigation: ↑↓ Move, Enter Select, Esc Close.
- Triggers from both `Ctrl+K` shortcut and sidebar search bar click.
- Fixed: correct light/dark theme in both modes.

### 🎨 UI & Design System
- **Light/Dark mode toggle** — respects OS preference by default; persisted to `localStorage`.
- **CSS custom properties** — full design token system (`--bg-body`, `--brand-primary`, etc.).
- **Framer Motion** animations — sidebar entrance, page transitions, modal/dropdown animations.
- **Phosphor Icons** throughout the UI.
- Responsive layout — works on wide desktop and mid-screen widths.
- Premium aesthetic: glassmorphism cards, gradient stat cards, micro-animations on hover.

---

## 🛠️ Tech Stack

### Backend
- **Java 21**: Runtime.
- **Spring Boot 3.2.5**: Application framework.
- **Spring Security + JWT (jjwt 0.11.5)**: Authentication & RBAC.
- **Spring Data JPA + Hibernate**: ORM & data access.
- **PostgreSQL**: Production database.
- **Lombok**: Boilerplate reduction.
- **Maven (multi-module)**: Build & dependency management.

### Frontend
- **React 18**: UI framework.
- **Vite**: Dev server & build tool.
- **React Router v6**: Client-side routing.
- **Tailwind CSS**: Utility-first styling.
- **Axios**: HTTP client with interceptors.
- **Recharts**: Dashboard charts.
- **Framer Motion**: Animations & transitions.
- **Phosphor Icons**: Icon library.
- **React Context API**: Global state (Auth, Theme).

---

## 🏗️ Project Structure

```
NexusHR/
├── backend/                        ← Spring Boot multi-module Maven project
│   ├── common/                     ← Shared entities, DTOs, enums, repositories
│   ├── auth-service/               ← JWT login, register, refresh, logout
│   ├── employee-service/           ← Employees, Departments, Recruitment, Documents, OrgChart
│   ├── attendance-service/         ← Attendance check-in/out, SSE stream, Leave requests
│   ├── payroll-service/            ← Payroll generation, batch run, CSV download
│   ├── performance-service/        ← Performance reviews, Goals
│   ├── ai-service/                 ← Attrition prediction, Skill gaps, HR Chatbot
│   ├── notification-service/       ← User notifications
│   └── app/                        ← Main entry point, Dashboard controller, DataSeeder
│
├── frontend/                       ← React + Vite SPA
│   └── src/
│       ├── context/                ← AuthContext, ThemeContext
│       ├── components/             ← Sidebar, Topbar, DataTable, Modal, Badge, CommandPalette
│       ├── layouts/                ← MainLayout, PageTransition
│       ├── pages/                  ← One folder per feature route
│       │   ├── dashboard/
│       │   ├── employees/
│       │   ├── attendance/
│       │   ├── schedule/           ← New schedule/calendar page
│       │   ├── leave/
│       │   ├── payroll/
│       │   ├── performance/
│       │   ├── recruitment/
│       │   ├── insights/
│       │   ├── notifications/
│       │   └── profile/
│       ├── services/               ← Axios API service files (one per module)
│       ├── routes/                 ← AppRoutes.jsx with protected route guards
│       └── utils/                  ← formatters.js (currency, dates, timeAgo)
│
├── docs/                           ← Project documentation
└── README.md
```

---

## 👤 Author

**Name:** Sharon Sam  
**Project:** NexusHR – Enterprise HR & Workforce Management System  
**Internship:** Zidio Java Full Stack Internship  
**Year:** 2026  
**Repository:** https://github.com/Sharon-Sam14/NexusHR

---

## 📄 License

This project is developed for educational and internship demonstration purposes.