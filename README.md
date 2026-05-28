# NexusHR – Enterprise HR & Workforce Management System

A production-inspired full-stack HR management platform developed as part of the Zidio Java Full Stack Internship Project.

NexusHR helps organizations manage employee lifecycle operations including employee management, attendance tracking, leave requests, payroll processing, and workforce analytics through a modern web application.

---

# Project Overview

NexusHR is designed to simplify HR operations by providing a centralized system for managing employees and workforce-related activities.

The application includes secure authentication, role-based access control, payroll calculations, attendance management, and dashboard analytics.

This project is built using:

- Java Spring Boot for backend development
- React + Vite for frontend development
- PostgreSQL for database management

---

# 🔑 Demo Credentials (Quick Access)

The login screen contains a **Developer Credentials** helper panel for one-click authentication. The seeded role-based accounts are:

| Module Role | Email Address | Password | Privileges / Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@nexushr.com` | `admin123` | Full administrative control, system logs, dashboard analytics, and recruitment |
| **HR Manager** | `hr@nexushr.com` | `hr123456` | Complete workforce database, leave approvals, payroll runs, and AI Insights |
| **Employee View** | `employee@nexushr.com` | `emp12345` | Clock-in/out, personal leave balances, individual payslips, and review history |

---

# Core Features

## 🔒 Authentication & Security
- JWT Authentication (Stateless Security Filter)
- Secure Login System with Frontend Auto-Login Triggers
- Role-Based Access Control (Admin / HR / Employee)
- Password Encryption via BCryptPasswordEncoder
- Controller-level Ownership Checks (`isOwner`, `isPayrollOwner`) for complete data privacy

---

## 📂 Employee Lifecycle & Document Management
- Add, update, and manage employee profiles
- Dynamic onboarding status workflow
- **Onboarding Document Management:** Secure drag-and-drop document upload (PDF, images, contracts), file size validation, downloading, and removal directly inside user profiles.

---

## ⏱️ Attendance & Leave Management
- Check-in / Check-out button widget (Real-time biometric simulation)
- Dynamic **Leave Balance Pools** (subtracts approved leave days from dedicated employee pools and restores them on cancel/rejection)
- Real-time leave status tracking & HR approval workflow
- Visual leave metrics dashboard

---

## 💳 Payroll & Payslip Export
- Automated monthly payroll runs
- **Dynamic Tax Engine:** Automatic bracket calculation (12%, 18%, 25% tiers) based on basic salary
- Payslip detail models showing net pay, deductions, bonuses, and tax
- **CSV Data Export:** One-click spreadsheet-compatible CSV export for payroll logs

---

## 🧠 AI Workforce Intelligence Co-Pilot
- Notion-style floating AI Brain drawer pulling active database statistics
- Real-time departmental metrics analyzing Attrition Risk, Skill Gaps, and Employee Engagement Ratings
- Hidden from standard employees to prevent company-wide data leakage

---

## ✉️ Simulated Notification Gateways (SMTP & Twilio)
- Console logging simulators displaying live SMTP mail headers and Twilio SMS message bodies upon event triggers
- Live **Email (SMTP) Sent** and **SMS (Twilio) Dispatched** delivery verification badges on the Notifications Centre feed

---

## ⌨️ Command Palette (`Ctrl + K`)
- Vercel/Linear-inspired fuzzy-search command palette overlay
- Instantly navigate to core pages or trigger quick actions via keyboard shortcuts

---

## 🎨 Visual Polish & UI Themes
- Fully custom, premium dark-mode theme
- Animated, looping mesh background gradients
- Count-up statistics metrics and Recharts charts with neon-glow filters

---

# Tech Stack

## Backend
- Java 22
- Spring Boot 3
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL
- Maven

---

## Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts
- Framer Motion
- Lucide Icons

---

## Database
- PostgreSQL

---

## Tools & Platforms
- VS Code
- GitHub
- Postman

---

# Project Structure

```text
NexusHR/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── screenshots/
│
├── docs/
│
└── README.md
```

# Backend Structure

```text
backend/src/main/java/com/nexushr/
│
├── config/
├── controller/
├── dto/
├── entity/
├── exception/
├── repository/
├── security/
├── service/
│   └── impl/
```

# Frontend Structure

```text
frontend/src/
│
├── api/
├── assets/
├── components/
├── context/
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
│
├── App.jsx
│
├── main.jsx
│
└── index.css
```

# Documentation

Project documentation and reports will be added inside the docs/ folder.

# Author

Name: Sharon Sam

Project: NexusHR – Enterprise HR & Workforce Management System

Internship: Zidio Java Full Stack Internship

Year: 2026

# License

This project is developed for educational and internship purposes.