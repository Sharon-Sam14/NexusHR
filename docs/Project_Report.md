# NexusHR – Enterprise HR & Workforce Intelligence OS
## Zidio Java Full Stack Internship Project Report

---

## 1. Executive Summary

**NexusHR** is a production-grade, AI-enabled Enterprise Human Resource Operating System (HR OS) designed to automate workforce management, streamline HR administrative processes, and deliver real-time data intelligence to executives. 

Developed during the **Zidio Java Full Stack Internship (2026)**, the platform replaces manual record-keeping with an automated digital system. By integrating core employee lifecycle tasks (onboarding, documents, attendance, leave, and payroll) with advanced features (Notion-style AI Insights, keyboard-driven Command Palette, and simulated multi-channel notification gateways), NexusHR serves as a blueprint for a modern, high-security enterprise SaaS solution.

---

## 2. Project Scope & Objectives

The primary target was to build an enterprise-level dashboard that simplifies HR workloads, ensures strict role-based access control, and provides rich data visualizations.

### Core Objectives:
*   **Operational Automation:** Automate employee onboarding, biometric attendance logging, leave pool tracking, and monthly payroll calculation.
*   **Data Integrity & Privacy:** Secure personal employee records, financial details, and system reports using strict Role-Based Access Control (RBAC) both on the REST API endpoints and UI routing.
*   **Actionable Analytics:** Deliver real-time executive statistics (attrition risks, skill gaps, monthly expenses) via interactive dashboards and an AI assistant.
*   **Premium User Experience:** Establish a visual style matching modern SaaS platforms (like Vercel, Linear, and Stripe) using dark-mode aesthetics, custom micro-animations, and instant search controls.

---

## 3. Detailed Module Analysis

NexusHR is organized into eight primary, fully integrated modules:

### 🔒 Module 1: Authentication & RBAC Security
*   **Logic:** Integrates stateless JWT authentication with Spring Security. When a user authenticates, a JWT is signed with their email and role.
*   **Security Policy:** Utilizes a custom Spring Security evaluation component (`SecurityHelper.java`) validating resource ownership (`isOwner(employeeId)`) at the Controller level.
*   **Privilege Tiers:**
    *   `ADMIN` / `HR`: Full read-write capabilities on directories, salary structures, leave pools, and company-wide analytics.
    *   `EMPLOYEE`: Restrictive access to view/edit only their own attendance punches, personal leave balance, monthly payslips, and personal profile details.

### 📂 Module 2: Employee Lifecycle & Onboarding Documents
*   **Logic:** Tracks employees from onboarding to active status.
*   **Onboarding Document Management:** Allows employees to drag-and-drop credentials or employment contracts directly into their profiles. The backend handles multipart file uploads securely (stored locally under `/uploads`), allowing users to list, download, and delete attachments.

### ⏱️ Module 3: Attendance & Biometric Simulation
*   **Logic:** Tracks check-ins, check-outs, status (Present, Late, Half-Day, On Leave), work hours, and comments.
*   **Biometric Clock Widget:** Employees can check in or out directly from the dashboard, which instantly logs timestamps and calculates work hours dynamically.

### 📅 Module 4: Leave Balance Pools
*   **Logic:** Automatically manages leave pools. Every employee is initialized with 15 annual leave days.
*   **Deduction Engine:** When an employee submits a leave request, the system checks for pool sufficiency. Upon HR approval, the request duration is automatically subtracted from the employee's remaining days. Rejections or cancellations restore the balance immediately.

### 💳 Module 5: Automated Payroll & Tax Engine
*   **Logic:** Generates monthly payroll sheets containing basic salary, bonus incentives, deductions, and tax values.
*   **Tax Calculator:** Automatically applies tax brackets (12%, 18%, or 25%) based on basic salary tiers.
*   **Report Export:** Users can download a spreadsheet-compatible CSV export of monthly payslips.

### 🧠 Module 6: Notion-Style AI Co-Pilot
*   **Logic:** A sliding drawer panel accessible via a floating action button. 
*   **Insights Engine:** Aggregates real-time company statistics from the database (average performance ratings, headcount logs, salary expenses) to compute and explain attrition risk assessment, skill gaps, and general engagement ratings.

### ✉️ Module 7: Notification Gateways Simulator
*   **Logic:** Sends updates on system actions (e.g. leave requests, payroll runs).
*   **Simulators:** Prints simulated SMTP Email and Twilio SMS connection logs and payload dispatches to the server console. The frontend notification feed renders live verification badges (`Email Sent`, `SMS Dispatched`) underneath messages.

### ⌨️ Module 8: Command Palette (`Ctrl + K`)
*   **Logic:** A Vercel-inspired search overlay listening to keyboard bindings.
*   **Controls:** Allows power users to search for active navigation links, profiles, or execute quick system commands (like launching the AI Drawer or toggling states) instantly.

---

## 4. Technical Architecture

NexusHR is structured as a decoupled, multi-tier system:

```text
+------------------+           +----------------------+           +------------------------+
|                  |  (HTTP)   |                      |  (JDBC)   |                        |
|  React Frontend  | <=======> |  Spring Boot REST    | <=======> |  PostgreSQL Database   |
|  (Vite + Axios)  |           |  API (Security/JWT)  |           |                        |
|                  |           |                      |           |                        |
+------------------+           +----------------------+           +------------------------+
```

### Backend Flow:
1.  **Controller Layer:** Defines REST endpoints (`/api/**`) and enforces access rules using `@PreAuthorize`.
2.  **Service Layer:** Executes core business calculations, validators, and transaction controls.
3.  **Repository Layer:** Spring Data JPA repositories communicating with PostgreSQL.

---

## 5. Key Metrics & Outcomes

*   **100% Core Requirements Covered:** Fully implemented employee directories, automated leave pool counters, dynamic tax deductions, and document file systems.
*   **Zero-Overlapping UI Overlays:** Restructured dropdown, command palette, and modal components to use solid backgrounds and explicit z-indexes, preventing element bleeding.
*   **Secure RBAC Verification:** Non-authorized users are blocked from access both at the frontend routing layer and the backend REST endpoints.
*   **Clean Compilation & Build:** Checked and verified both packages (zero warnings on maven compile or vite production bundles).

---

## 6. Conclusion & Reflection

**NexusHR** has successfully evolved from a baseline HR dashboard into a highly polished, secure, and modern enterprise software suite. Overcoming database migration challenges (like resolving existing null entries on database updates) and aligning frontend user context normalizations has provided deep hands-on experience in building secure full-stack software. The platform stands ready as a highly presentation-worthy capstone for the Zidio Internship program.