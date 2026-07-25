# NexusHR System Performance & Optimization Guide

This document details optimization strategies, database indexing configurations, and memory management guidelines for the **NexusHR** platform.

---

## 1. Database Optimization

### 1.1 Indexing Strategy
Database performance is optimized by adding indexes to foreign keys and search columns:
*   `idx_attendance_emp_date` (composite on `employee_id` and `date`)
*   `idx_leave_emp_dates` (composite on `employee_id`, `start_date`, and `end_date`)
*   `idx_payroll_emp_period` (composite on `employee_id`, `month`, and `year`)

### 1.2 Preventing N+1 Query Issues
*   JPA relationships (such as `Employee.documents` and `User.employee`) use `FetchType.LAZY` to load data only when requested.
*   Complex queries use join fetches (`JOIN FETCH`) to retrieve related records in a single query when needed.

---

## 2. Server-Sent Events (SSE) Scalability

Real-time punch dashboards use Server-Sent Events (SSE). Connections are managed to prevent resource leaks:
*   **Thread-Safe Channels**: Connections are stored in thread-safe collections (`ConcurrentHashMap`).
*   **Pruning**: Emitters that throw write errors (indicating the client has disconnected) are automatically removed from the active map.

---

## 3. Caching Opportunities

To reduce database loads, the following caching strategies can be implemented:
*   **AI Analytics**: Cache the results of complex queries (like average salary or employee of the month) using Spring Cache (`@Cacheable`).
*   **JWT Cache**: Cache parsed user credentials to avoid querying the database on every authenticated request.
