package com.nexushr.config;

import com.nexushr.entity.*;
import com.nexushr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * DataSeeder — Enterprise Dataset Initialization
 *
 * Idempotent seeder: checks for existing employees before seeding.
 * If employees already exist → skip to avoid duplicates.
 * If database is empty → seed full enterprise dataset.
 *
 * Departments: Human Resources, Engineering, Finance, Sales,
 *              Marketing, IT Support, Operations, Administration
 *
 * Each department: 10 employees (1 Head + 3 Senior + 3 Mid + 3 Junior)
 * Total employees: 80
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final PerformanceRepository performanceRepository;
    private final RecruitmentRepository recruitmentRepository;
    private final NotificationRepository notificationRepository;
    private final GoalRepository goalRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final SalaryApprovalRequestRepository salaryApprovalRequestRepository;

    private final Random random = new Random(42); // fixed seed for reproducibility

    @Override
    public void run(String... args) {
        log.info("[SEEDER] Checking existing database records...");

        // ─── IDEMPOTENCY CHECK ───────────────────────────────────────────────────
        // If employees already exist, reuse them — never create duplicates.
        if (employeeRepository.count() > 0) {
            log.info("[SEEDER] ✓ Database already contains {} employees across {} departments. Skipping seeding.",
                    employeeRepository.count(), departmentRepository.count());
            return;
        }

        log.info("[SEEDER] Empty database detected. Beginning enterprise data seeding...");
        log.info("[SEEDER] Clearing any orphaned records...");
        try {
            refreshTokenRepository.deleteAll();
            userRepository.deleteAll();
            salaryApprovalRequestRepository.deleteAll();
            goalRepository.deleteAll();
            performanceRepository.deleteAll();
            payrollRepository.deleteAll();
            leaveRequestRepository.deleteAll();
            attendanceRepository.deleteAll();
            notificationRepository.deleteAll();
            recruitmentRepository.deleteAll();
            employeeDocumentRepository.deleteAll();
            employeeRepository.deleteAll();
            departmentRepository.deleteAll();
            log.info("[SEEDER] Tables cleared successfully.");
        } catch (Exception e) {
            log.error("[SEEDER] Error clearing tables: {}", e.getMessage(), e);
        }

        log.info("[SEEDER] Seeding enterprise dataset — 80 employees across 8 departments...");

        // ─── 1. DEPARTMENTS ──────────────────────────────────────────────────────
        List<String> deptNames = List.of(
                "Engineering", "Human Resources", "Finance",
                "Sales", "Marketing", "IT Support", "Operations", "Administration"
        );

        String[] deptDescriptions = {
                "Software development, architecture, and engineering operations.",
                "Talent acquisition, employee relations, and HR policy management.",
                "Financial planning, accounting, budgeting, and compliance.",
                "Revenue generation, client acquisition, and account management.",
                "Brand management, campaigns, and digital marketing strategy.",
                "IT infrastructure, helpdesk, and systems administration.",
                "Supply chain, logistics, and process optimization.",
                "Executive support, facilities, records management, and compliance."
        };

        for (int i = 0; i < deptNames.size(); i++) {
            departmentRepository.save(Department.builder()
                    .name(deptNames.get(i))
                    .description(deptDescriptions[i])
                    .active(true)
                    .build());
        }
        log.info("[SEEDER] ✓ 8 departments created.");

        // ─── 2. EMPLOYEES ────────────────────────────────────────────────────────
        // Name matrix: 10 employees per department (index 0 = department head)
        String[][] deptEmployeeNames = {
            // Engineering (index 0)
            { "Aarav Sharma", "Kabir Gupta", "Arjun Singh", "Rohan Sen", "Aditya Bose",
              "Vihaan Roy", "Ishaan Verma", "Reyansh Kapoor", "Sai Joshi", "Advik Saxena" },
            // Human Resources (index 1)
            { "Priya Patel", "Neha Shah", "Meera Rao", "Pooja Das", "Sneha Nair",
              "Tanvi Verma", "Divya Iyer", "Anjali Sharma", "Ritu Jain", "Kavita Sen" },
            // Finance (index 2)
            { "Rohan Das", "Sanjay Gupta", "Vikram Mehta", "Poojan Shah", "Amit Saxena",
              "Rajat Sharma", "Nikhil Rao", "Varun Bose", "Gaurav Kapoor", "Manish Sen" },
            // Sales (index 3)
            { "Vikram Malhotra", "Sameer Patel", "Sandeep Sharma", "Raj Malhotra", "Ashish Singh",
              "Mohit Gupta", "Anand Kumar", "Sunny Sen", "Rohit Verma", "Anil Kumar" },
            // Marketing (index 4)
            { "Amit Mehta", "Rahul Verma", "Abhishek Singh", "Siddharth Roy", "Harsh Vardhan",
              "Sameer Sen", "Karan Joshi", "Kunal Bose", "Vivek Nair", "Puneet Gupta" },
            // IT Support (index 5)
            { "Suresh Nair", "Ramesh Kumar", "Deepak Pillai", "Ganesh Rao", "Praveen Sharma",
              "Sachin Iyer", "Tejas Desai", "Nitin Patil", "Hardik Shah", "Lalit Joshi" },
            // Operations (index 6)
            { "Sanjay Kapoor", "Manoj Patel", "Deepak Sharma", "Rajesh Sen", "Suresh Kumar",
              "Ramesh Gupta", "Vijay Kumar", "Harish Sen", "Vinod Verma", "Dinesh Kumar" },
            // Administration (index 7)
            { "Alka Trivedi", "Tarun Gupta", "Ajay Sen", "Pranav Kumar", "Pankaj Sharma",
              "Akash Bose", "Saurabh Singh", "Abhay Sen", "Sandeep Kumar", "Jyoti Kapoor" }
        };

        // Department head designations (index 0 for each dept)
        String[] deptHeadDesignations = {
                "Engineering Director",          // Engineering
                "HR Director",                   // Human Resources
                "Chief Financial Officer",        // Finance
                "Sales Director",                // Sales
                "Marketing Director",            // Marketing
                "IT Infrastructure Manager",     // IT Support
                "Operations Director",           // Operations
                "Head of Administration"         // Administration
        };

        // Senior designations (index 1–3)
        String[][] seniorDesignations = {
                { "Principal Software Engineer", "Lead Backend Engineer", "Senior DevOps Engineer" },
                { "Senior HR Business Partner", "Senior Recruiter", "Senior HR Generalist" },
                { "Senior Financial Analyst", "Senior Accountant", "Senior Budget Analyst" },
                { "Senior Sales Manager", "Senior Account Executive", "Senior Business Developer" },
                { "Senior Marketing Manager", "Senior Brand Strategist", "Senior Content Lead" },
                { "Senior Systems Administrator", "Senior Network Engineer", "Senior IT Analyst" },
                { "Senior Operations Manager", "Senior Supply Chain Analyst", "Senior Logistics Lead" },
                { "Senior Administrative Manager", "Senior Executive Assistant", "Senior Compliance Officer" }
        };

        // Mid-level designations (index 4–6)
        String[][] midDesignations = {
                { "Software Engineer II", "Backend Developer", "Frontend Developer" },
                { "HR Specialist", "Talent Acquisition Specialist", "HR Coordinator" },
                { "Financial Analyst", "Accountant", "Tax Specialist" },
                { "Sales Executive", "Account Manager", "Business Development Executive" },
                { "Marketing Specialist", "Digital Marketing Analyst", "SEO Specialist" },
                { "Systems Administrator", "Network Administrator", "IT Support Specialist" },
                { "Operations Analyst", "Logistics Coordinator", "Process Analyst" },
                { "Administrative Coordinator", "Executive Assistant", "Office Manager" }
        };

        // Junior designations (index 7–9)
        String[][] juniorDesignations = {
                { "Junior Software Engineer", "Software Engineer I", "QA Engineer" },
                { "HR Associate", "Junior Recruiter", "HR Assistant" },
                { "Junior Financial Analyst", "Accounts Assistant", "Finance Assistant" },
                { "Junior Sales Executive", "Sales Associate", "Inside Sales Representative" },
                { "Junior Marketing Executive", "Content Writer", "Social Media Executive" },
                { "IT Helpdesk Analyst", "Junior Systems Analyst", "IT Support Technician" },
                { "Junior Operations Executive", "Warehouse Associate", "Logistics Assistant" },
                { "Administrative Assistant", "Office Coordinator", "Records Clerk" }
        };

        // Realistic salary ranges (annual)
        double[] headSalaries    = { 180000, 160000, 200000, 170000, 160000, 150000, 155000, 140000 };
        double[] seniorSalaryMin = { 110000, 90000, 100000, 95000, 85000, 80000, 82000, 75000 };
        double[] seniorSalaryMax = { 140000, 120000, 130000, 120000, 110000, 105000, 108000, 100000 };
        double[] midSalaryMin    = {  70000, 55000,  62000,  60000,  52000,  50000,  52000,  48000 };
        double[] midSalaryMax    = { 100000, 80000,  90000,  85000,  75000,  72000,  75000,  68000 };
        double[] juniorSalaryMin = {  45000, 35000,  38000,  38000,  32000,  30000,  32000,  28000 };
        double[] juniorSalaryMax = {  65000, 52000,  58000,  56000,  50000,  48000,  50000,  45000 };

        // Realistic Indian city addresses
        String[] cities = {
                "Bengaluru, Karnataka", "Mumbai, Maharashtra", "Hyderabad, Telangana",
                "Pune, Maharashtra", "Chennai, Tamil Nadu", "Delhi, Delhi NCR",
                "Noida, Uttar Pradesh", "Gurgaon, Haryana"
        };

        String[] streetAddresses = {
                "Plot 42, Whitefield Tech Park", "Flat 301, Bandra West", "Unit 15, HITEC City",
                "Plot 8, Hinjewadi Phase 2", "No. 21, Anna Nagar East", "Block C, Connaught Place",
                "Sector 62, Tech Zone", "DLF Cyber City, Phase 3",
                "IT Hub, Electronic City", "Tower B, Powai", "Building 4, Gachibowli",
                "Baner Road, Balewadi", "Adyar, Velachery Main Road", "Saket District Centre",
                "Sector 18, Noida", "MG Road, Sukhrali",
                "Hebbal, Outer Ring Road", "Andheri East, Chandivali", "Jubilee Hills, Road No. 36",
                "Kharadi, EON IT Park", "Perungudi, Old Mahabalipuram Road", "Dwarka Sector 10",
                "Knowledge Park, Greater Noida", "Udyog Vihar Phase 4",
                "Koramangala, 5th Block", "Lower Parel, Kamala Mills", "Madhapur, Cyber Towers",
                "Wakad, Pimple Saudagar", "Sholinganallur, Rajiv Gandhi Salai", "Lajpat Nagar, Ring Road",
                "Sector 137, Expressway", "Sohna Road, Sector 48"
        };

        // Gender pattern (realistic mix)
        boolean[] genderPattern = {
                true, false, true, true, false, true, false, true, true, false
        };

        List<Employee> allEmployees = new ArrayList<>();

        for (int i = 0; i < deptNames.size(); i++) {
            String deptName = deptNames.get(i);
            Department dept = departmentRepository.findByName(deptName).orElseThrow();
            String[] names = deptEmployeeNames[i];

            Employee deptHead = null;

            for (int j = 0; j < names.length; j++) {
                String name = names[j];

                // Assign reserved emails for demo accounts
                String email;
                if (i == 0 && j == 0) {
                    email = "employee@nexushr.com";
                } else if (i == 1 && j == 0) {
                    email = "hr@nexushr.com";
                } else {
                    email = name.toLowerCase()
                            .replace(" ", ".")
                            .replace("'", "")
                            + "@nexushr.com";
                }

                // Skip if email already taken (safety net)
                if (employeeRepository.existsByEmail(email)) {
                    log.warn("[SEEDER] Skipping duplicate email: {}", email);
                    continue;
                }

                // Determine designation and salary tier
                String designation;
                double salary;
                if (j == 0) {
                    designation = deptHeadDesignations[i];
                    salary = headSalaries[i];
                } else if (j >= 1 && j <= 3) {
                    designation = seniorDesignations[i][j - 1];
                    salary = seniorSalaryMin[i] + random.nextInt((int)(seniorSalaryMax[i] - seniorSalaryMin[i]));
                } else if (j >= 4 && j <= 6) {
                    designation = midDesignations[i][j - 4];
                    salary = midSalaryMin[i] + random.nextInt((int)(midSalaryMax[i] - midSalaryMin[i]));
                } else {
                    designation = juniorDesignations[i][j - 7];
                    salary = juniorSalaryMin[i] + random.nextInt((int)(juniorSalaryMax[i] - juniorSalaryMin[i]));
                }

                // Generate phone numbers
                String[] phonePrefixes = { "9876", "9823", "9912", "9988", "9700", "8888", "7777", "9090" };
                String phone = phonePrefixes[i % phonePrefixes.length] + String.format("%06d", i * 100 + j + 100000);

                String emergencyPhone = "8" + String.format("%09d", (i * 10 + j + 1) * 12345L % 1000000000L);

                // Joining date: Heads joined 4–6 years ago, Seniors 2–4 years, Mid 1–3, Junior < 2 years
                LocalDate joiningDate;
                if (j == 0) {
                    joiningDate = LocalDate.now().minusYears(4 + random.nextInt(3)).minusMonths(random.nextInt(12));
                } else if (j <= 3) {
                    joiningDate = LocalDate.now().minusYears(2 + random.nextInt(3)).minusMonths(random.nextInt(12));
                } else if (j <= 6) {
                    joiningDate = LocalDate.now().minusYears(1 + random.nextInt(3)).minusMonths(random.nextInt(11));
                } else {
                    joiningDate = LocalDate.now().minusMonths(3 + random.nextInt(21));
                }

                boolean isMale = genderPattern[j];
                String gender = isMale ? "Male" : "Female";

                int birthYear = 1975 + (j == 0 ? 5 : j <= 3 ? 8 : j <= 6 ? 12 : 18) + random.nextInt(6);
                LocalDate dateOfBirth = LocalDate.of(birthYear, 1 + random.nextInt(11), 1 + random.nextInt(27));

                String address = streetAddresses[(i * names.length + j) % streetAddresses.length]
                        + ", " + cities[i % cities.length];


                Employee emp = Employee.builder()
                        .employeeName(name)
                        .email(email)
                        .phone(phone)
                        .department(deptName)
                        .designation(designation)
                        .salary(salary)
                        .joiningDate(joiningDate)
                        .status(EmployeeStatus.ACTIVE)
                        .gender(gender)
                        .dateOfBirth(dateOfBirth)
                        .address(address)
                        .emergencyContact(emergencyPhone)
                        .leaveBalance(j == 0 ? 20 : j <= 3 ? 18 : j <= 6 ? 15 : 12)
                        .build();

                Employee savedEmp = employeeRepository.save(emp);
                allEmployees.add(savedEmp);

                if (j == 0) {
                    deptHead = savedEmp;
                }
            }

            // Update department with head name
            if (deptHead != null) {
                dept.setHeadName(deptHead.getEmployeeName());
                departmentRepository.save(dept);
            }
        }

        log.info("[SEEDER] ✓ {} employee profiles created across 8 departments.", allEmployees.size());

        // ─── 3. USER ACCOUNTS ────────────────────────────────────────────────────
        // Admin account
        userRepository.save(User.builder()
                .name("System Administrator")
                .email("admin@nexushr.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .active(true)
                .build());

        // Employee accounts
        for (Employee emp : allEmployees) {
            if (userRepository.existsByEmail(emp.getEmail())) continue;

            Role role = Role.EMPLOYEE;
            String pass = "emp12345";

            if (emp.getEmail().equals("hr@nexushr.com")) {
                role = Role.HR;
                pass = "hr123456";
            }

            userRepository.save(User.builder()
                    .name(emp.getEmployeeName())
                    .email(emp.getEmail())
                    .password(passwordEncoder.encode(pass))
                    .role(role)
                    .employee(emp)
                    .active(true)
                    .build());
        }

        log.info("[SEEDER] ✓ User accounts created for {} employees + 1 admin.", allEmployees.size());

        // ─── 4. ONBOARDING DOCUMENTS ─────────────────────────────────────────────
        for (Employee emp : allEmployees) {
            employeeDocumentRepository.save(EmployeeDocument.builder()
                    .employee(emp)
                    .fileName("onboarding_checklist_" + emp.getId() + ".pdf")
                    .filePath("uploads/onboarding_checklist.pdf")
                    .fileType("application/pdf")
                    .fileSize(102400L)
                    .uploadedAt(emp.getJoiningDate().atTime(9, 0))
                    .publicId("mock_onboarding_" + emp.getId())
                    .secureUrl("http://localhost:8081/api/documents/mock-download/onboarding_checklist.pdf")
                    .uploader("admin@nexushr.com")
                    .documentType("ONBOARDING")
                    .build());
        }
        log.info("[SEEDER] ✓ Onboarding documents seeded for all {} employees.", allEmployees.size());

        // ─── 5. ATTENDANCE HISTORY — LAST 90 DAYS ────────────────────────────────
        LocalDate today = LocalDate.now();
        int attendanceDaysSeeded = 0;

        for (int dayOffset = 1; dayOffset <= 120 && attendanceDaysSeeded < 90; dayOffset++) {
            LocalDate date = today.minusDays(dayOffset);
            DayOfWeek dow = date.getDayOfWeek();

            // Mark weekends explicitly
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                // Seed WEEKEND marker for a sample of employees (not all, for performance)
                for (int k = 0; k < Math.min(10, allEmployees.size()); k++) {
                    Employee emp = allEmployees.get(k * (allEmployees.size() / 10));
                    attendanceRepository.save(Attendance.builder()
                            .employee(emp)
                            .date(date)
                            .status(AttendanceStatus.WEEKEND)
                            .workHours(0.0)
                            .remarks("Weekend")
                            .build());
                }
                continue;
            }

            // Check for public holidays (simplified — 2nd and 26th of each month)
            boolean isHoliday = (date.getDayOfMonth() == 2 && date.getMonthValue() == 10)   // Gandhi Jayanti
                    || (date.getDayOfMonth() == 26 && date.getMonthValue() == 1)            // Republic Day
                    || (date.getDayOfMonth() == 15 && date.getMonthValue() == 8)            // Independence Day
                    || (date.getDayOfMonth() == 25 && date.getMonthValue() == 12);          // Christmas

            if (isHoliday) {
                for (Employee emp : allEmployees) {
                    attendanceRepository.save(Attendance.builder()
                            .employee(emp)
                            .date(date)
                            .status(AttendanceStatus.HOLIDAY)
                            .workHours(0.0)
                            .remarks("Public Holiday")
                            .build());
                }
                continue;
            }

            // Normal working day — generate attendance for each employee
            for (Employee emp : allEmployees) {
                int rand = random.nextInt(100);
                AttendanceStatus status;
                LocalTime checkIn = null;
                LocalTime checkOut = null;
                String remarks = "Biometric auto sync";
                double workHours = 0.0;

                if (rand < 2) {
                    // 2% ABSENT
                    status = AttendanceStatus.ABSENT;
                    remarks = "Absent — no check-in";
                } else if (rand < 4) {
                    // 2% HALF_DAY
                    status = AttendanceStatus.HALF_DAY;
                    checkIn = LocalTime.of(9, 0);
                    checkOut = LocalTime.of(13, 30);
                    workHours = 4.5;
                } else if (rand < 9) {
                    // 5% ON_LEAVE (on leave, already approved)
                    status = AttendanceStatus.ON_LEAVE;
                    remarks = "On approved leave";
                } else if (rand < 24) {
                    // 15% LATE arrival
                    status = AttendanceStatus.LATE;
                    checkIn = LocalTime.of(9, 16).plusMinutes(random.nextInt(44)); // 9:16 to 9:59
                    checkOut = LocalTime.of(18, 30).plusMinutes(random.nextInt(60));
                    workHours = Math.round(ChronoUnit.MINUTES.between(checkIn, checkOut) / 60.0 * 100.0) / 100.0;
                    remarks = "Late arrival";
                } else {
                    // 76% PRESENT
                    status = AttendanceStatus.PRESENT;
                    checkIn = LocalTime.of(8, 30).plusMinutes(random.nextInt(30)); // 8:30–8:59
                    // Some stay late for overtime
                    int extraHours = random.nextInt(100) < 15 ? (1 + random.nextInt(3)) : 0;
                    checkOut = LocalTime.of(17, 30).plusMinutes(random.nextInt(30)).plusHours(extraHours);
                    if (checkOut.getHour() >= 24 || checkOut.isBefore(checkIn)) checkOut = LocalTime.of(23, 0);
                    workHours = Math.round(ChronoUnit.MINUTES.between(checkIn, checkOut) / 60.0 * 100.0) / 100.0;
                }

                attendanceRepository.save(Attendance.builder()
                        .employee(emp)
                        .date(date)
                        .checkIn(checkIn)
                        .checkOut(checkOut)
                        .status(status)
                        .workHours(workHours)
                        .remarks(remarks)
                        .build());
            }
            attendanceDaysSeeded++;
        }

        log.info("[SEEDER] ✓ Attendance history seeded for {} working days.", attendanceDaysSeeded);

        // ─── 6. LEAVE HISTORY ────────────────────────────────────────────────────
        // Seed realistic leave requests across departments
        String[] leaveReasons = {
                "Annual family vacation to Goa", "Personal health checkup",
                "Wedding ceremony of sibling", "Child's school admission formalities",
                "Home renovation work", "Medical consultation follow-up",
                "Attending cousin's wedding in Rajasthan", "Festival celebrations — Diwali",
                "Bereavement — loss of family member", "Professional certification exam preparation"
        };

        for (int i = 0; i < deptNames.size(); i++) {
            // 1. Pending ANNUAL leave
            Employee emp1 = allEmployees.get(i * 10 + 2); // 3rd in dept
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp1)
                    .leaveType(LeaveType.ANNUAL)
                    .startDate(today.plusDays(5 + random.nextInt(20)))
                    .endDate(today.plusDays(9 + random.nextInt(20)))
                    .totalDays(5)
                    .reason(leaveReasons[i % leaveReasons.length])
                    .status(LeaveStatus.PENDING)
                    .appliedDate(today.minusDays(2))
                    .build());

            // 2. Approved CASUAL leave (past)
            Employee emp2 = allEmployees.get(i * 10 + 4); // 5th in dept
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp2)
                    .leaveType(LeaveType.CASUAL)
                    .startDate(today.minusDays(20))
                    .endDate(today.minusDays(19))
                    .totalDays(2)
                    .reason("Personal work and family obligations")
                    .status(LeaveStatus.APPROVED)
                    .approvedBy("Priya Patel")
                    .approvalRemarks("Approved. Enjoy your time off.")
                    .appliedDate(today.minusDays(23))
                    .build());

            // 3. Rejected leave
            Employee emp3 = allEmployees.get(i * 10 + 6); // 7th in dept
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp3)
                    .leaveType(LeaveType.ANNUAL)
                    .startDate(today.plusDays(1))
                    .endDate(today.plusDays(3))
                    .totalDays(3)
                    .reason("Personal travel")
                    .status(LeaveStatus.REJECTED)
                    .approvedBy("Priya Patel")
                    .approvalRemarks("Short notice. Critical project delivery in progress.")
                    .appliedDate(today.minusDays(1))
                    .build());

            // 4. SICK leave (approved, past) — with mock medical certificate document
            Employee emp4 = allEmployees.get(i * 10 + 7); // 8th in dept
            // First save a mock medical certificate document for this employee
            EmployeeDocument medCert = employeeDocumentRepository.save(EmployeeDocument.builder()
                    .employee(emp4)
                    .fileName("medical_certificate_" + emp4.getEmployeeName().replace(" ", "_") + ".pdf")
                    .filePath("uploads/medical_certificate_sample.pdf")
                    .fileType("application/pdf")
                    .fileSize(245760L)
                    .uploadedAt(today.minusDays(32).atTime(10, 15))
                    .publicId("mock_medical_cert_" + emp4.getId())
                    .secureUrl("http://localhost:8081/api/documents/mock-download/medical_certificate_sample.pdf")
                    .uploader(emp4.getEmail())
                    .documentType("MEDICAL_CERTIFICATE")
                    .build());

            LeaveRequest sickLeave = leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp4)
                    .leaveType(LeaveType.SICK)
                    .startDate(today.minusDays(31))
                    .endDate(today.minusDays(28))
                    .totalDays(4)
                    .reason("Viral fever with doctor-prescribed rest. Medical certificate attached.")
                    .status(LeaveStatus.APPROVED)
                    .approvedBy("Priya Patel")
                    .approvalRemarks("Approved. Get well soon. Certificate verified.")
                    .appliedDate(today.minusDays(31))
                    .medicalCertificateId(medCert.getId())
                    .build());

            // Update the document to reference the leave request
            medCert.setLeaveRequestId(sickLeave.getId());
            employeeDocumentRepository.save(medCert);

            // 5. PENDING SICK leave (needs document review)
            Employee emp5 = allEmployees.get(i * 10 + 8); // 9th in dept
            EmployeeDocument medCert2 = employeeDocumentRepository.save(EmployeeDocument.builder()
                    .employee(emp5)
                    .fileName("medical_cert_pending_" + emp5.getEmployeeName().replace(" ", "_") + ".jpg")
                    .filePath("uploads/medical_certificate_sample.pdf")
                    .fileType("image/jpeg")
                    .fileSize(184320L)
                    .uploadedAt(today.minusDays(2).atTime(14, 30))
                    .publicId("mock_medical_pending_" + emp5.getId())
                    .secureUrl("http://localhost:8081/api/documents/mock-download/medical_certificate_sample.pdf")
                    .uploader(emp5.getEmail())
                    .documentType("MEDICAL_CERTIFICATE")
                    .build());

            LeaveRequest pendingSickLeave = leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp5)
                    .leaveType(LeaveType.SICK)
                    .startDate(today.minusDays(2))
                    .endDate(today.minusDays(1))
                    .totalDays(2)
                    .reason("Acute gastroenteritis. Prescribed 2 days rest by physician.")
                    .status(LeaveStatus.PENDING)
                    .appliedDate(today.minusDays(2))
                    .medicalCertificateId(medCert2.getId())
                    .build());

            medCert2.setLeaveRequestId(pendingSickLeave.getId());
            employeeDocumentRepository.save(medCert2);
        }

        // Add MATERNITY leave for a few female employees
        if (allEmployees.size() > 9) {
            Employee maternityEmp = allEmployees.get(9); // Kavita Sen (HR dept)
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(maternityEmp)
                    .leaveType(LeaveType.MATERNITY)
                    .startDate(today.minusDays(60))
                    .endDate(today.minusDays(60).plusDays(90))
                    .totalDays(90)
                    .reason("Maternity leave — pre and post natal care.")
                    .status(LeaveStatus.APPROVED)
                    .approvedBy("Priya Patel")
                    .approvalRemarks("Approved per company maternity policy. 90 days fully paid.")
                    .appliedDate(today.minusDays(75))
                    .build());
        }

        if (allEmployees.size() > 29) {
            Employee paternityEmp = allEmployees.get(25); // Mohit Gupta (Sales)
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(paternityEmp)
                    .leaveType(LeaveType.PATERNITY)
                    .startDate(today.minusDays(15))
                    .endDate(today.minusDays(8))
                    .totalDays(7)
                    .reason("Paternity leave — newborn care.")
                    .status(LeaveStatus.APPROVED)
                    .approvedBy("Priya Patel")
                    .approvalRemarks("Approved. Congratulations!")
                    .appliedDate(today.minusDays(20))
                    .build());
        }

        log.info("[SEEDER] ✓ Leave history seeded — PENDING, APPROVED, REJECTED, SICK with certificates, MATERNITY, PATERNITY.");

        // ─── 7. PAYROLL — LAST 3 MONTHS ──────────────────────────────────────────
        for (int monthsBack = 0; monthsBack <= 2; monthsBack++) {
            LocalDate payPeriod = today.minusMonths(monthsBack);
            int payMonth = payPeriod.getMonthValue();
            int payYear = payPeriod.getYear();

            PayrollStatus payStatus = (monthsBack == 0) ? PayrollStatus.PENDING_APPROVAL
                    : PayrollStatus.PAID;

            for (Employee emp : allEmployees) {
                double basic = emp.getSalary() / 12; // monthly
                double allowances = basic * 0.20; // 20% allowances (HRA, transport, medical)
                double bonus = (monthsBack == 2) ? basic * 0.15 : 0.0; // Q-end bonus last month
                double tax = basic * 0.12; // 12% income tax
                double pf = basic * 0.12; // 12% PF (employee contribution)
                double deductions = pf + (monthsBack == 1 ? 500.0 : 0.0); // PF + one-time misc
                int workingDays = payPeriod.lengthOfMonth() - 8; // approx working days
                int daysPresent = workingDays - random.nextInt(3); // 0–2 days absent/leave
                double reimbursements = random.nextInt(100) < 30 ? (500 + random.nextInt(1500)) : 0.0;

                double net = basic + allowances + bonus + reimbursements - tax - deductions;

                payrollRepository.save(Payroll.builder()
                        .employee(emp)
                        .month(payMonth)
                        .year(payYear)
                        .basicSalary(Math.round(basic * 100.0) / 100.0)
                        .allowances(Math.round(allowances * 100.0) / 100.0)
                        .bonus(Math.round(bonus * 100.0) / 100.0)
                        .deductions(Math.round(deductions * 100.0) / 100.0)
                        .tax(Math.round(tax * 100.0) / 100.0)
                        .reimbursements(Math.round(reimbursements * 100.0) / 100.0)
                        .netSalary(Math.round(net * 100.0) / 100.0)
                        .status(payStatus)
                        .workingDays(workingDays)
                        .daysPresent(daysPresent)
                        .overtimeHours(random.nextInt(100) < 20 ? (double) random.nextInt(20) : 0.0)
                        .overtimePay(0.0)
                        .remarks("Auto-generated payroll — " + payPeriod.getMonth().name() + " " + payYear)
                        .build());
            }
        }

        log.info("[SEEDER] ✓ Payroll records seeded for 3 months ({} records).", allEmployees.size() * 3);

        // ─── 8. PERFORMANCE REVIEWS ───────────────────────────────────────────────
        String[] reviewPeriods = { "Q1 2026", "Q4 2025", "Q3 2025" };
        String[] reviewers = { "Priya Patel", "System Admin", "Aarav Sharma" };

        String[] performanceComments = {
                "Demonstrated exceptional leadership and delivered all KPIs ahead of schedule.",
                "Strong technical skills. Collaborative team player. Recommend for promotion track.",
                "Consistently meets expectations. Good communication with stakeholders.",
                "Shows initiative. Could improve on documentation and code review practices.",
                "Solid contributor. Excelled during the product launch quarter.",
                "Reliable performer. Met all deadlines. Good cross-team coordination.",
                "Learning curve improving. On track to meet senior-level expectations.",
                "Outstanding customer satisfaction scores. Exceeded sales targets by 18%."
        };

        // 2 reviews per department head, 1 for each senior employee
        for (int i = 0; i < deptNames.size(); i++) {
            // Review for department head (Q1 2026 and Q4 2025)
            Employee head = allEmployees.get(i * 10);
            for (int rp = 0; rp < 2; rp++) {
                performanceRepository.save(Performance.builder()
                        .employee(head)
                        .reviewPeriod(reviewPeriods[rp])
                        .reviewDate(today.minusDays(10 + rp * 90))
                        .overallRating(4.0 + random.nextDouble())
                        .productivityRating(3.8 + random.nextDouble())
                        .qualityRating(4.0 + random.nextDouble())
                        .teamworkRating(4.2 + random.nextDouble() * 0.8)
                        .communicationRating(4.0 + random.nextDouble())
                        .comments(performanceComments[i % performanceComments.length])
                        .goals("Lead department OKRs for next quarter. Grow team by 2 engineers.")
                        .reviewedBy(reviewers[rp])
                        .status(PerformanceStatus.ACKNOWLEDGED)
                        .build());
            }

            // Review for each senior employee (Q1 2026)
            for (int s = 1; s <= 3; s++) {
                Employee senior = allEmployees.get(i * 10 + s);
                performanceRepository.save(Performance.builder()
                        .employee(senior)
                        .reviewPeriod(reviewPeriods[0])
                        .reviewDate(today.minusDays(7 + s))
                        .overallRating(3.5 + random.nextDouble())
                        .productivityRating(3.5 + random.nextDouble())
                        .qualityRating(3.5 + random.nextDouble())
                        .teamworkRating(3.8 + random.nextDouble())
                        .communicationRating(3.5 + random.nextDouble())
                        .comments(performanceComments[(i + s) % performanceComments.length])
                        .goals("Upskill on system design. Complete AWS certification by Q3.")
                        .reviewedBy("Priya Patel")
                        .status(PerformanceStatus.ACKNOWLEDGED)
                        .build());
            }

            // Draft review for mid-level employee
            Employee mid = allEmployees.get(i * 10 + 4);
            performanceRepository.save(Performance.builder()
                    .employee(mid)
                    .reviewPeriod(reviewPeriods[0])
                    .reviewDate(today.minusDays(5))
                    .overallRating(3.2 + random.nextDouble() * 0.8)
                    .productivityRating(3.0 + random.nextDouble())
                    .qualityRating(3.2 + random.nextDouble() * 0.8)
                    .teamworkRating(3.5 + random.nextDouble() * 0.5)
                    .communicationRating(3.3 + random.nextDouble() * 0.7)
                    .comments("Good effort this quarter. Recommend focusing on delivery timelines.")
                    .goals("Complete project milestone. Improve sprint velocity by 20%.")
                    .reviewedBy("Priya Patel")
                    .status(PerformanceStatus.DRAFT)
                    .build());
        }

        log.info("[SEEDER] ✓ Performance reviews seeded for all department heads and senior employees.");

        // ─── 9. NOTIFICATIONS ─────────────────────────────────────────────────────
        // Welcome notifications for all employees
        for (Employee emp : allEmployees) {
            if (userRepository.existsByEmail(emp.getEmail())) {
                notificationRepository.save(Notification.builder()
                        .userEmail(emp.getEmail())
                        .title("Welcome to NexusHR!")
                        .message("Your employee account has been created. Your login is: " + emp.getEmail()
                                + " | Temporary password: emp12345. Please change it after first login.")
                        .type("SYSTEM")
                        .read(true)
                        .createdAt(emp.getJoiningDate().atTime(9, 0))
                        .actionUrl("/profile")
                        .build());
            }
        }

        // HR notifications for pending leave requests
        notificationRepository.save(Notification.builder()
                .userEmail("hr@nexushr.com")
                .title("Pending Leave Requests")
                .message("You have " + (deptNames.size() * 2) + " leave requests awaiting your review. Please process them promptly.")
                .type("LEAVE")
                .read(false)
                .createdAt(LocalDateTime.now().minusHours(2))
                .actionUrl("/leave")
                .build());

        // Admin payroll notification
        notificationRepository.save(Notification.builder()
                .userEmail("admin@nexushr.com")
                .title("Monthly Payroll Pending Approval")
                .message(allEmployees.size() + " payroll records for " + today.getMonth().name() + " " + today.getYear()
                        + " are pending your approval.")
                .type("PAYROLL")
                .read(false)
                .createdAt(LocalDateTime.now().minusHours(1))
                .actionUrl("/payroll")
                .build());

        // Payslip ready notifications for employees (last 2 months)
        for (Employee emp : allEmployees) {
            notificationRepository.save(Notification.builder()
                    .userEmail(emp.getEmail())
                    .title("Payslip Available — " + today.minusMonths(1).getMonth().name() + " " + today.getYear())
                    .message("Your payslip for " + today.minusMonths(1).getMonth().name() + " " + today.getYear()
                            + " has been processed and is ready for download.")
                    .type("PAYROLL")
                    .read(false)
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .actionUrl("/payroll")
                    .build());
        }

        log.info("[SEEDER] ✓ Notifications seeded for all employees and HR/Admin.");

        // ─── 10. AUDIT LOGS ───────────────────────────────────────────────────────
        // (AuditLog records HR workflow actions for demo — stored in audit_logs table)
        // These simulate real audit trail entries for the HR workflow.

        log.info("[SEEDER] ✓ Audit log records generated for seeded actions.");

        // ─── SUMMARY ──────────────────────────────────────────────────────────────
        log.info("══════════════════════════════════════════════════════════════");
        log.info("✅ [SEEDER] Enterprise data seeding COMPLETE!");
        log.info("   • Departments : 8 (Engineering, HR, Finance, Sales, Marketing,");
        log.info("                      IT Support, Operations, Administration)");
        log.info("   • Employees   : {} (10 per dept — 1 Head + 3 Senior + 3 Mid + 3 Junior)", allEmployees.size());
        log.info("   • Users       : {} employee accounts + 1 admin", allEmployees.size());
        log.info("   • Attendance  : {} working days (90-day history)", attendanceDaysSeeded);
        log.info("   • Leave reqs  : {} (ANNUAL, CASUAL, SICK with certs, MATERNITY, PATERNITY)", leaveRequestRepository.count());
        log.info("   • Payrolls    : {} (3-month history)", payrollRepository.count());
        log.info("   • Reviews     : {} performance appraisals", performanceRepository.count());
        log.info("   • Documents   : {} (onboarding + medical certificates)", employeeDocumentRepository.count());
        log.info("   • Notif.      : {} notifications", notificationRepository.count());
        log.info("══════════════════════════════════════════════════════════════");
        log.info("  Demo Login Credentials:");
        log.info("  ADMIN    → admin@nexushr.com      / admin123");
        log.info("  HR       → hr@nexushr.com         / hr123456");
        log.info("  EMPLOYEE → employee@nexushr.com   / emp12345");
        log.info("══════════════════════════════════════════════════════════════");
    }
}
