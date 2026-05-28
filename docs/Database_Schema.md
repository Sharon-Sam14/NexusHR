# Database Schema Design

NexusHR uses a **PostgreSQL** relational database. Entity relationship migrations are dynamically synchronized at startup via Spring JPA and Hibernate.

---

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    users {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        varchar role
        boolean active
        bigint employee_id FK
    }
    employees {
        bigint id PK
        varchar employee_name
        varchar email UK
        varchar phone
        varchar department
        varchar designation
        double salary
        date joining_date
        varchar profile_photo
        varchar address
        varchar status
        integer leave_balance
        varchar gender
        date date_of_birth
        varchar emergency_contact
    }
    employee_documents {
        bigint id PK
        bigint employee_id FK
        varchar file_name
        varchar file_type
        bigint file_size
        date upload_date
        varchar file_path
    }
    attendance {
        bigint id PK
        bigint employee_id FK
        date date
        time check_in
        time check_out
        varchar status
        double work_hours
        varchar remarks
    }
    leave_requests {
        bigint id PK
        bigint employee_id FK
        varchar leave_type
        date start_date
        date end_date
        integer total_days
        varchar reason
        varchar status
        varchar approved_by
        varchar approval_remarks
        date applied_date
    }
    payroll {
        bigint id PK
        bigint employee_id FK
        integer month
        integer year
        double basic_salary
        double bonus
        double deductions
        double tax
        double net_salary
        varchar status
        integer working_days
        integer days_present
        varchar remarks
    }
    performance_reviews {
        bigint id PK
        bigint employee_id FK
        varchar review_period
        date review_date
        double overall_rating
        double productivity_rating
        double quality_rating
        double teamwork_rating
        double communication_rating
        varchar comments
        varchar goals
        varchar reviewed_by
        varchar status
    }
    notifications {
        bigint id PK
        varchar user_email
        varchar title
        varchar message
        varchar type
        boolean read
        timestamp created_at
        varchar action_url
    }

    employees ||--o| users : "associates"
    employees ||--o{ employee_documents : "owns"
    employees ||--o{ attendance : "clocks"
    employees ||--o{ leave_requests : "requests"
    employees ||--o{ payroll : "payouts"
    employees ||--o{ performance_reviews : "rated"
```

---

## 🗂️ Detailed Database Table Specifications

### 1. `users` Table
*   Stores authentication credentials and account state.
*   *Columns:*
    *   `id` (bigint, PK): Auto-incrementing identifier.
    *   `name` (varchar, Not Null): Full name of the user.
    *   `email` (varchar, Unique, Not Null): Username used for login.
    *   `password` (varchar, Not Null): BCrypt-encrypted password hash.
    *   `role` (varchar, Not Null): Access control role (`ADMIN`, `HR`, `EMPLOYEE`).
    *   `active` (boolean, Not Null): Account status flag.
    *   `employee_id` (bigint, FK, Nullable): References corresponding employee record in `employees`.

### 2. `employees` Table
*   Stores employee profile records.
*   *Columns:*
    *   `id` (bigint, PK): Auto-incrementing identifier.
    *   `employee_name` (varchar, Not Null): Display name.
    *   `email` (varchar, Unique, Not Null): Work email.
    *   `phone` (varchar, Nullable): Contact phone number.
    *   `department` (varchar, Not Null): e.g. "Engineering", "Design", "Finance".
    *   `designation` (varchar, Not Null): Job title (e.g. "Senior Engineer").
    *   `salary` (double, Not Null): Monthly base pay.
    *   `joining_date` (date, Nullable): Date of employment start.
    *   `profile_photo` (varchar, Nullable): URI or path to profile photo.
    *   `address` (varchar, Nullable): Residential address.
    *   `status` (varchar, Not Null): Employee operational state (`ACTIVE`, `SUSPENDED`, `OFFBOARDED`).
    *   `leave_balance` (integer, Not Null, Default 15): Remaining leave balance pool.
    *   `gender` (varchar, Nullable): Gender identity description.
    *   `date_of_birth` (date, Nullable): Birthdate.
    *   `emergency_contact` (varchar, Nullable): Name and phone of contact.

### 3. `employee_documents` Table
*   Tracks file attachments associated with employee onboarding/records.
*   *Columns:*
    *   `id` (bigint, PK): Auto-incrementing identifier.
    *   `employee_id` (bigint, FK, Not Null): References corresponding employee in `employees`.
    *   `file_name` (varchar, Not Null): Original name of upload.
    *   `file_type` (varchar, Not Null): MIME file type.
    *   `file_size` (bigint, Not Null): File size in bytes.
    *   `upload_date` (date, Not Null): Date upload occurred.
    *   `file_path` (varchar, Not Null): Local disk storage location path.

### 4. `attendance` Table
*   Logs biometric timestamps and daily check-ins.
*   *Columns:*
    *   `id` (bigint, PK): Auto-incrementing identifier.
    *   `employee_id` (bigint, FK, Not Null): References employee.
    *   `date` (date, Not Null): Day of log.
    *   `check_in` (time, Nullable): Time check-in occurred.
    *   `check_out` (time, Nullable): Time check-out occurred.
    *   `status` (varchar, Not Null): Status state (`PRESENT`, `LATE`, `HALF_DAY`, `ON_LEAVE`, `ABSENT`).
    *   `work_hours` (double, Not Null): Calculated hours.
    *   `remarks` (varchar, Nullable): Daily comments.

### 5. `leave_requests` Table
*   Tracks leave requests and workflow approvals.
*   *Columns:*
    *   `id` (bigint, PK): Auto-incrementing identifier.
    *   `employee_id` (bigint, FK, Not Null): References applicant employee.
    *   `leave_type` (varchar, Not Null): Category (`ANNUAL`, `SICK`, `CASUAL`, `MATERNITY`, `UNPAID`).
    *   `start_date` (date, Not Null): Start day.
    *   `end_date` (date, Not Null): End day.
    *   `total_days` (integer, Not Null): Calculated duration of request.
    *   `reason` (varchar, Nullable): Motivation note.
    *   `status` (varchar, Not Null): State (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
    *   `approved_by` (varchar, Nullable): Approving manager.
    *   `approval_remarks` (varchar, Nullable): Manager notes.
    *   `applied_date` (date, Not Null): Request date.

### 6. `payroll` Table
*   Monthly pay slips.
*   *Columns:*
    *   `id` (bigint, PK): Auto-incrementing identifier.
    *   `employee_id` (bigint, FK, Not Null): Recipient employee.
    *   `month` (integer, Not Null): Month of period.
    *   `year` (integer, Not Null): Year of period.
    *   `basic_salary` (double, Not Null): Base pay rate.
    *   `bonus` (double, Not Null): Added incentives.
    *   `deductions` (double, Not Null): Direct subtractions.
    *   `tax` (double, Not Null): Dynamic tier calculated tax (12%, 18%, 25%).
    *   `net_salary` (double, Not Null): Final pay rate (Basic + Bonus - Deductions - Tax).
    *   `status` (varchar, Not Null): Pay status (`PENDING`, `PAID`, `VOIDED`).
    *   `working_days` (integer, Not Null): Days in period.
    *   `days_present` (integer, Not Null): Days active.
    *   `remarks` (varchar, Nullable): Notes.

### 7. `notifications` Table
*   Holds message dispatch triggers.
*   *Columns:*
    *   `id` (bigint, PK): Auto-incrementing identifier.
    *   `user_email` (varchar, Not Null): Recipient user.
    *   `title` (varchar, Not Null): Title header.
    *   `message` (text, Not Null): Message text content.
    *   `type` (varchar, Not Null): Event type (`SYSTEM`, `EMPLOYEE`, `LEAVE`, `PAYROLL`, `PERFORMANCE`, `RECRUITMENT`).
    *   `read` (boolean, Not Null): Is read status flag.
    *   `created_at` (timestamp, Not Null): Created date/time.
    *   `action_url` (varchar, Nullable): Click action redirection URI path.
