// Roles
export const ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
};

// Leave Types
export const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "CASUAL", label: "Casual Leave" },
  { value: "MATERNITY", label: "Maternity Leave" },
  { value: "PATERNITY", label: "Paternity Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
  { value: "COMPENSATORY", label: "Compensatory Leave" },
];

// Leave Status
export const LEAVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

// Attendance Status
export const ATTENDANCE_STATUS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "LATE", label: "Late" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "HOLIDAY", label: "Holiday" },
];

// Employee Status
export const EMPLOYEE_STATUS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "TERMINATED", label: "Terminated" },
];

// Payroll Status
export const PAYROLL_STATUS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSED", label: "Processed" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Recruitment Status
export const RECRUITMENT_STATUS = [
  { value: "OPEN", label: "Open" },
  { value: "SCREENING", label: "Screening" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER_EXTENDED", label: "Offer Extended" },
  { value: "HIRED", label: "Hired" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Performance Status
export const PERFORMANCE_STATUS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
];

// Job Types
export const JOB_TYPES = [
  { value: "Full Time", label: "Full Time" },
  { value: "Part Time", label: "Part Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
  { value: "Remote", label: "Remote" },
];

// Months
export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// Gender options
export const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

// Departments
export const DEFAULT_DEPARTMENTS = [
  "Engineering", "Human Resources", "Finance",
  "Marketing", "Sales", "Operations", "Design", "Legal"
];

// Status color maps
export const STATUS_COLORS = {
  // Leave
  PENDING:  { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  APPROVED: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  REJECTED: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  CANCELLED:{ bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },

  // Attendance
  PRESENT:  { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  ABSENT:   { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  HALF_DAY: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  LATE:     { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  HOLIDAY:  { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  ON_LEAVE: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },

  // Employee
  ACTIVE:     { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  INACTIVE:   { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },
  TERMINATED: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },

  // Payroll
  PROCESSED: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
  PAID:      { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },

  // Recruitment
  OPEN:           { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  SCREENING:      { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  INTERVIEWING:   { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  OFFER_EXTENDED: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  HIRED:          { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  CLOSED:         { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },

  // Performance
  DRAFT:       { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },
  SUBMITTED:   { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  ACKNOWLEDGED:{ bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
};
