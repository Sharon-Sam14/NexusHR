# Changelog — NexusHR

All notable changes to the **NexusHR** project are documented in this file.

---

## [1.1.0] — 2026-07-25

### Added
*   Added the monthly schedule calendar view page (`/schedule`).
*   Added Server-Sent Events (SSE) streaming for real-time check-in and check-out logs on HR dashboards.
*   Added the fuzzy search command palette overlay (`Ctrl+K`).
*   Added simulated RAG chatbot co-pilot features to query database statistics.

### Changed
*   Configured the backend as a multi-module Maven project.
*   Updated the database configuration from an in-memory H2 database to PostgreSQL.
*   Integrated the `LeaveBalanceEngine` to automatically adjust leave balances on request cancellations or rejections.

---

## [1.0.0] — 2026-05-15
*   Initial release of the system including basic employee profiles, logins, manual payroll adjustments, and document uploads.
