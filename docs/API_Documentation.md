# NexusHR: Complete REST API Documentation

This document lists the REST API endpoints for the **NexusHR** system. 

All endpoints are prefixed with `/api`. Protected endpoints require a JWT token passed in the `Authorization` header as: `Bearer <token>`.

---

## 1. Authentication APIs

### 1.1 Login User
*   **URL**: `POST /auth/login`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "email": "hr@nexushr.com",
      "password": "hr123456"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "refreshToken": "4a861d8a-7c9e-486b-a4ef-a993d0fca2cc",
      "name": "Priya Patel",
      "email": "hr@nexushr.com",
      "role": "HR",
      "userId": 2,
      "employeeId": 2
    }
    ```

### 1.2 Rotate Refresh Token
*   **URL**: `POST /auth/refresh`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "refreshToken": "4a861d8a-7c9e-486b-a4ef-a993d0fca2cc"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
      "refreshToken": "7c83f982-1a2b-3c4d-5e6f-7a8b9c0d1e2f"
    }
    ```

---

## 2. Employee Directory APIs

### 2.1 List Employees
*   **URL**: `GET /employees`
*   **Access**: Protected (`ADMIN`, `HR`)

### 2.2 Create Employee Profile
*   **URL**: `POST /employees`
*   **Access**: Protected (`ADMIN`, `HR`)
*   **Request Body**:
    ```json
    {
      "employeeName": "Amit Mehta",
      "email": "amit.m@mail.com",
      "phone": "(406) 555-0120",
      "department": "Engineering",
      "designation": "Software Engineer",
      "salary": 75000.0,
      "joiningDate": "2024-05-15",
      "gender": "MALE",
      "dateOfBirth": "1995-10-12",
      "address": "123 Main St",
      "emergencyContact": "Rachel Mehta: (406) 555-0121"
    }
    ```

### 2.3 Delete Employee Profile
*   **URL**: `DELETE /employees/{id}`
*   **Access**: Protected strictly to `ADMIN`

---

## 3. Employee Documents & Uploads

### 3.1 Upload Document (Onboarding or Medical Certificate)
*   **URL**: `POST /employees/{employeeId}/documents`
*   **Access**: Protected (`ADMIN`, `HR`, or Resource Owner)
*   **Content-Type**: `multipart/form-data`
*   **Query Parameters**:
    *   `leaveRequestId` (optional, Long) — Associate the document with a leave request (e.g. sick leave).
    *   `documentType` (optional, String, default: `OTHER`) — Category of document: `MEDICAL_CERTIFICATE`, `ONBOARDING`, `CONTRACT`, `OTHER`.
*   **Response (200 OK)**:
    ```json
    {
      "id": 5,
      "employeeId": 1,
      "fileName": "medical_cert_july.pdf",
      "fileType": "application/pdf",
      "fileSize": 124536,
      "uploadedAt": "2026-07-25T14:30:00",
      "publicId": "nexushr/medical_cert_xyz",
      "secureUrl": "https://res.cloudinary.com/...",
      "uploader": "employee@nexushr.com",
      "leaveRequestId": 12,
      "documentType": "MEDICAL_CERTIFICATE"
    }
    ```

### 3.2 Download Document File
*   **URL**: `GET /documents/{id}/download`
*   **Access**: Protected (`ADMIN`, `HR`, or Resource Owner)
*   **Response**: `302 Redirect` to Cloudinary secure URL, or serves local attachment for mock fallback mode.

### 3.3 Preview Document Inline
*   **URL**: `GET /documents/{id}/preview`
*   **Access**: Protected (`ADMIN`, `HR`, or Resource Owner)
*   **Response**: `302 Redirect` to Cloudinary secure URL, or serves inline document (e.g., image or PDF) in browser.

### 3.4 Get Medical Certificate for Leave Request
*   **URL**: `GET /leave/{leaveRequestId}/document`
*   **Access**: Protected (`ADMIN`, `HR`)
*   **Response (200 OK)**: DocumentDTO mapping details.

---

## 4. Attendance tracker & SSE Streams

### 4.1 Clock In (Punch In)
*   **URL**: `POST /attendance/check-in/{employeeId}`
*   **Access**: Protected (Resource Owner)

### 4.2 SSE Real-Time Punch Logs Stream
*   **URL**: `GET /attendance/stream/{subscriberKey}`
*   **Access**: Protected (`ADMIN`, `HR`, or `MANAGER`)
*   **Query Parameters**: `token` (JWT access token)
*   **Header**: `Accept: text/event-stream`

---

## 5. Leave Request Workflow

### 5.1 Apply for Leave
*   **URL**: `POST /leave/apply`
*   **Access**: Protected (Resource Owner)
*   **Request Body (Annual / Casual / Other)**:
    ```json
    {
      "employeeId": 1,
      "leaveType": "ANNUAL",
      "startDate": "2026-08-10",
      "endDate": "2026-08-14",
      "reason": "Family vacation"
    }
    ```
*   **Request Body (Sick / Medical Leave)**:
    ```json
    {
      "employeeId": 1,
      "leaveType": "SICK",
      "startDate": "2026-08-10",
      "endDate": "2026-08-12",
      "reason": "Sick with flu. Doctor certificate attached.",
      "medicalCertificateId": 5
    }
    ```
    *(Note: For SICK leave, `medicalCertificateId` is mandatory and validated against DB records.)*

*   **Response DTO (200 OK)**:
    ```json
    {
      "id": 12,
      "employeeId": 1,
      "employeeName": "Aarav Sharma",
      "department": "Engineering",
      "leaveType": "SICK",
      "startDate": "2026-08-10",
      "endDate": "2026-08-12",
      "totalDays": 3,
      "reason": "Sick with flu. Doctor certificate attached.",
      "status": "PENDING",
      "appliedDate": "2026-07-25",
      "medicalCertificateId": 5,
      "medicalCertificateUrl": "https://res.cloudinary.com/...",
      "medicalCertificateFileName": "medical_cert_july.pdf"
    }
    ```

### 5.2 Approve Leave
*   **URL**: `PATCH /leave/{id}/approve`
*   **Access**: Protected (`ADMIN`, `HR`)
*   **Request Body**:
    ```json
    {
      "approvedBy": "Priya Patel",
      "remarks": "Medical certificate verified. Approved."
    }
    ```

---

## 6. Payroll & Salary Revisions

### 6.1 Run Monthly Payroll Batch
*   **URL**: `POST /api/payroll/batch/run`
*   **Access**: Protected (`ADMIN`, `HR`)
*   **Request Body**:
    ```json
    {
      "month": 7,
      "year": 2026,
      "bonus": 2000.0,
      "deductions": 500.0
    }
    ```

### 6.2 Submit Salary Revision Request
*   **URL**: `POST /api/payroll/salary-approval/request`
*   **Access**: Protected (`HR`)
*   **Request Body**:
    ```json
    {
      "employeeId": 1,
      "proposedSalary": 85000.0,
      "reason": "Promotion to Senior Engineer"
    }
    ```

### 6.3 Approve Salary Revision
*   **URL**: `POST /api/payroll/salary-approval/{id}/approve`
*   **Access**: Protected (`ADMIN`)

---

## 7. AI Workforce Analytics

### 7.1 Attrition & Competency Insights
*   **URL**: `GET /ai/insights`
*   **Access**: Protected (`ADMIN`, `HR`)

### 7.2 HR Chatbot Query
*   **URL**: `POST /ai/chat`
*   **Access**: Protected (Authenticated user)
*   **Request Body**:
    ```json
    {
      "query": "Who is at risk of leaving?"
    }
    ```
