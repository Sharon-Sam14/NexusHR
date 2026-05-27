# Database Schema

## Users Table

Fields:
- id
- name
- email
- password
- role

---

## Employees Table

Fields:
- id
- employee_name
- department
- designation
- salary
- joining_date

---

## Attendance Table

Fields:
- id
- employee_id
- attendance_date
- status

---

## Leave Requests Table

Fields:
- id
- employee_id
- leave_type
- start_date
- end_date
- status

---

## Payroll Table

Fields:
- id
- employee_id
- basic_salary
- bonus
- tax
- net_salary
