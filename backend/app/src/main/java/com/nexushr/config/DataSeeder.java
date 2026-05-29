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
import java.util.List;

/*
 * Data Seeder
 *
 * Seeds default users, employees, departments, and comprehensive demo data on startup.
 * Safe and idempotent (checks count of repositories before inserting).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
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

    @Override
    public void run(String... args) {
        log.info("Clearing existing database tables...");
        try {
            refreshTokenRepository.deleteAll();
            userRepository.deleteAll();
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
            log.info("Database tables successfully cleared.");
        } catch (Exception e) {
            log.error("Error clearing database tables: " + e.getMessage(), e);
        }

        log.info("Seeding initial data...");

        // 1. Seed Departments
        List<String> deptNames = List.of(
                "Engineering", "Human Resources", "Finance",
                "Marketing", "Sales", "Operations", "Design", "Legal"
        );

        deptNames.forEach(name -> {
            if (!departmentRepository.existsByName(name)) {
                departmentRepository.save(Department.builder()
                        .name(name)
                        .description(name + " Department")
                        .active(true)
                        .build());
            }
        });

        // 2. Seed Employees with Indian Names
        Employee emp1 = employeeRepository.findByEmail("employee@nexushr.com").orElseGet(() -> 
            employeeRepository.save(Employee.builder()
                .employeeName("Aarav Sharma")
                .email("employee@nexushr.com")
                .phone("9876543210")
                .department("Engineering")
                .designation("Senior Engineer")
                .salary(95000.0)
                .joiningDate(LocalDate.of(2021, 3, 15))
                .status(EmployeeStatus.ACTIVE)
                .gender("Male")
                .build())
        );

        Employee emp2 = employeeRepository.findByEmail("hr@nexushr.com").orElseGet(() -> 
            employeeRepository.save(Employee.builder()
                .employeeName("Priya Patel")
                .email("hr@nexushr.com")
                .phone("9123456780")
                .department("Human Resources")
                .designation("HR Manager")
                .salary(75000.0)
                .joiningDate(LocalDate.of(2020, 6, 1))
                .status(EmployeeStatus.ACTIVE)
                .gender("Female")
                .build())
        );

        Employee emp3 = employeeRepository.findByEmail("rohan.das@nexushr.com").orElseGet(() -> 
            employeeRepository.save(Employee.builder()
                .employeeName("Rohan Das")
                .email("rohan.das@nexushr.com")
                .phone("9234567890")
                .department("Finance")
                .designation("Financial Analyst")
                .salary(80000.0)
                .joiningDate(LocalDate.of(2022, 1, 10))
                .status(EmployeeStatus.ACTIVE)
                .gender("Male")
                .build())
        );

        Employee emp4 = employeeRepository.findByEmail("amit.mehta@nexushr.com").orElseGet(() -> 
            employeeRepository.save(Employee.builder()
                .employeeName("Amit Mehta")
                .email("amit.mehta@nexushr.com")
                .phone("9345678901")
                .department("Marketing")
                .designation("Marketing Lead")
                .salary(70000.0)
                .joiningDate(LocalDate.of(2021, 9, 20))
                .status(EmployeeStatus.ACTIVE)
                .gender("Male")
                .build())
        );

        Employee emp5 = employeeRepository.findByEmail("anjali.nair@nexushr.com").orElseGet(() -> 
            employeeRepository.save(Employee.builder()
                .employeeName("Anjali Nair")
                .email("anjali.nair@nexushr.com")
                .phone("9456789012")
                .department("Design")
                .designation("UI/UX Designer")
                .salary(72000.0)
                .joiningDate(LocalDate.of(2022, 5, 5))
                .status(EmployeeStatus.ACTIVE)
                .gender("Female")
                .build())
        );

        // 3. Seed Users linked to Indian Names
        if (!userRepository.existsByEmail("admin@nexushr.com")) {
            userRepository.save(User.builder()
                    .name("System Administrator")
                    .email("admin@nexushr.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByEmail("hr@nexushr.com")) {
            userRepository.save(User.builder()
                    .name("Priya Patel")
                    .email("hr@nexushr.com")
                    .password(passwordEncoder.encode("hr123456"))
                    .role(Role.HR)
                    .employee(emp2)
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByEmail("employee@nexushr.com")) {
            userRepository.save(User.builder()
                    .name("Aarav Sharma")
                    .email("employee@nexushr.com")
                    .password(passwordEncoder.encode("emp12345"))
                    .role(Role.EMPLOYEE)
                    .employee(emp1)
                    .active(true)
                    .build());
        }

        // 4. Seed Attendance records
        if (attendanceRepository.count() == 0) {
            LocalDate today = LocalDate.now();
            List<Employee> employees = List.of(emp1, emp2, emp3, emp4, emp5);
            for (int i = 0; i < 5; i++) {
                LocalDate date = today.minusDays(i);
                if (date.getDayOfWeek().getValue() >= 6) {
                    continue;
                }
                for (Employee emp : employees) {
                    LocalTime checkIn = LocalTime.of(9, 0);
                    LocalTime checkOut = LocalTime.of(18, 0);
                    AttendanceStatus status = AttendanceStatus.PRESENT;
                    String remarks = "On time";
                    double hours = 9.0;

                    if (emp.getEmployeeName().equals("Rohan Das") && i == 1) {
                        checkIn = LocalTime.of(9, 45);
                        status = AttendanceStatus.LATE;
                        remarks = "Late due to metro delay";
                        hours = 8.25;
                    } else if (emp.getEmployeeName().equals("Amit Mehta") && i == 2) {
                        checkIn = LocalTime.of(13, 0);
                        status = AttendanceStatus.HALF_DAY;
                        remarks = "Dentist appointment";
                        hours = 5.0;
                    } else if (emp.getEmployeeName().equals("Anjali Nair") && i == 3) {
                        checkIn = null;
                        checkOut = null;
                        status = AttendanceStatus.ON_LEAVE;
                        remarks = "Casual leave applied";
                        hours = 0.0;
                    }

                    attendanceRepository.save(Attendance.builder()
                            .employee(emp)
                            .date(date)
                            .checkIn(checkIn)
                            .checkOut(checkOut)
                            .status(status)
                            .workHours(hours)
                            .remarks(remarks)
                            .build());
                }
            }
        }

        // 5. Seed Leave Requests with Diwali / Festive Reasons
        if (leaveRequestRepository.count() == 0) {
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp3)
                    .leaveType(LeaveType.ANNUAL)
                    .startDate(LocalDate.now().plusDays(10))
                    .endDate(LocalDate.now().plusDays(14))
                    .totalDays(5)
                    .reason("Diwali festival celebrations with family in Jaipur")
                    .status(LeaveStatus.PENDING)
                    .appliedDate(LocalDate.now().minusDays(2))
                    .build());

            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp1)
                    .leaveType(LeaveType.SICK)
                    .startDate(LocalDate.now().minusDays(10))
                    .endDate(LocalDate.now().minusDays(8))
                    .totalDays(3)
                    .reason("Suffering from Viral Fever")
                    .status(LeaveStatus.APPROVED)
                    .approvedBy("Priya Patel")
                    .approvalRemarks("Approved, please take rest.")
                    .appliedDate(LocalDate.now().minusDays(12))
                    .build());

            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(emp4)
                    .leaveType(LeaveType.CASUAL)
                    .startDate(LocalDate.now().minusDays(5))
                    .endDate(LocalDate.now().minusDays(4))
                    .totalDays(2)
                    .reason("Urgent domestic work at home")
                    .status(LeaveStatus.REJECTED)
                    .approvedBy("Priya Patel")
                    .approvalRemarks("Rejected due to Q1 marketing audit presentation scheduled on these days.")
                    .appliedDate(LocalDate.now().minusDays(7))
                    .build());
        }

        // 6. Seed Payroll
        if (payrollRepository.count() == 0) {
            LocalDate today = LocalDate.now();
            List<Employee> employees = List.of(emp1, emp2, emp3, emp4, emp5);
            int[][] periods = {
                {today.getMonthValue(), today.getYear()},
                {today.minusMonths(1).getMonthValue(), today.minusMonths(1).getYear()}
            };

            for (int[] period : periods) {
                int month = period[0];
                int year = period[1];
                for (Employee emp : employees) {
                    double basic = emp.getSalary();
                    double bonus = 2000.0;
                    double deductions = 500.0;
                    double tax = basic * 0.15;
                    double net = basic + bonus - deductions - tax;
                    PayrollStatus payrollStatus = (month == today.getMonthValue()) ? PayrollStatus.PENDING : PayrollStatus.PAID;

                    payrollRepository.save(Payroll.builder()
                            .employee(emp)
                            .month(month)
                            .year(year)
                            .basicSalary(basic)
                            .bonus(bonus)
                            .deductions(deductions)
                            .tax(tax)
                            .netSalary(net)
                            .status(payrollStatus)
                            .workingDays(22)
                            .daysPresent(22)
                            .remarks("Monthly salary payout")
                            .build());
                }
            }
        }

        // 7. Seed Performance Reviews
        if (performanceRepository.count() == 0) {
            performanceRepository.save(Performance.builder()
                    .employee(emp1)
                    .reviewPeriod("Q1 2026")
                    .reviewDate(LocalDate.now().minusDays(5))
                    .overallRating(4.5)
                    .productivityRating(4.5)
                    .qualityRating(4.0)
                    .teamworkRating(5.0)
                    .communicationRating(4.5)
                    .comments("Aarav is an outstanding Senior Engineer. He successfully led the engineering team during the API migration and has shown incredible technical leadership.")
                    .goals("Modernize the frontend routing and layout hierarchy next quarter.")
                    .reviewedBy("Priya Patel")
                    .status(PerformanceStatus.ACKNOWLEDGED)
                    .build());

            performanceRepository.save(Performance.builder()
                    .employee(emp3)
                    .reviewPeriod("Q1 2026")
                    .reviewDate(LocalDate.now().minusDays(5))
                    .overallRating(4.0)
                    .productivityRating(4.0)
                    .qualityRating(4.0)
                    .teamworkRating(4.0)
                    .communicationRating(4.0)
                    .comments("Rohan manages our financial operations with great diligence. His analysis reports are precise.")
                    .goals("Automate quarterly compliance metrics and audits.")
                    .reviewedBy("Priya Patel")
                    .status(PerformanceStatus.SUBMITTED)
                    .build());

            performanceRepository.save(Performance.builder()
                    .employee(emp4)
                    .reviewPeriod("Q1 2026")
                    .reviewDate(LocalDate.now().minusDays(1))
                    .overallRating(3.5)
                    .productivityRating(3.0)
                    .qualityRating(4.0)
                    .teamworkRating(3.5)
                    .communicationRating(4.0)
                    .comments("Amit is putting good effort in marketing. Need to focus on tracking digital campaign KPIs.")
                    .goals("Increase conversion rates by 15% through outreach campaigns.")
                    .reviewedBy("Priya Patel")
                    .status(PerformanceStatus.DRAFT)
                    .build());
        }

        // 8. Seed Recruitment Postings for Indian Locations
        if (recruitmentRepository.count() == 0) {
            recruitmentRepository.save(Recruitment.builder()
                    .jobTitle("Senior Java Developer")
                    .department("Engineering")
                    .jobDescription("We are looking for a Senior Java Developer to design and build our core HR systems. You will collaborate with cross-functional teams to build secure, scalable services using Spring Boot and PostgreSQL.")
                    .requirements("5+ years of Java, Spring Boot experience, Microservices, PostgreSQL, clean code practices")
                    .location("Bengaluru, India / Hybrid")
                    .jobType("Full-time")
                    .salaryMin(90000.0)
                    .salaryMax(130000.0)
                    .postedDate(LocalDate.now().minusDays(15))
                    .status(RecruitmentStatus.OPEN)
                    .openings(2)
                    .postedBy("System Administrator")
                    .build());

            recruitmentRepository.save(Recruitment.builder()
                    .jobTitle("UI/UX Designer")
                    .department("Design")
                    .jobDescription("Join us to design high-quality, modern, and beautiful user interfaces for our HR platform. You will build user flows, wireframes, and design systems in Figma.")
                    .requirements("3+ years of UI/UX design, proficiency in Figma, design systems, visual design principles")
                    .location("Mumbai, India / Hybrid")
                    .jobType("Full-time")
                    .salaryMin(70000.0)
                    .salaryMax(100000.0)
                    .postedDate(LocalDate.now().minusDays(10))
                    .status(RecruitmentStatus.OPEN)
                    .openings(1)
                    .postedBy("Priya Patel")
                    .build());

            recruitmentRepository.save(Recruitment.builder()
                    .jobTitle("Marketing Associate")
                    .department("Marketing")
                    .jobDescription("We are seeking a creative Marketing Associate to run our digital campaigns, social media outreach, and content production.")
                    .requirements("1+ years of digital marketing, content writing, social media management")
                    .location("Remote")
                    .jobType("Part-time")
                    .salaryMin(35000.0)
                    .salaryMax(50000.0)
                    .applicantName("Siddharth Roy")
                    .applicantEmail("siddharth@gmail.com")
                    .applicantPhone("9876543219")
                    .resumeUrl("https://nexushr.com/resumes/siddharth.pdf")
                    .postedDate(LocalDate.now().minusDays(20))
                    .closingDate(LocalDate.now().minusDays(1))
                    .status(RecruitmentStatus.HIRED)
                    .openings(1)
                    .postedBy("System Administrator")
                    .build());
        }

        // 9. Seed Notifications
        if (notificationRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            notificationRepository.save(Notification.builder()
                    .userEmail("admin@nexushr.com")
                    .title("System Setup Complete")
                    .message("Welcome to NexusHR! Your HR portal has been successfully configured and initialized with standard modules.")
                    .type("SYSTEM")
                    .read(true)
                    .createdAt(now.minusDays(2))
                    .build());

            notificationRepository.save(Notification.builder()
                    .userEmail("admin@nexushr.com")
                    .title("New Employee Registered")
                    .message("Anjali Nair has been added to the system under Design Department.")
                    .type("EMPLOYEE")
                    .read(false)
                    .createdAt(now.minusHours(4))
                    .build());

            notificationRepository.save(Notification.builder()
                    .userEmail("hr@nexushr.com")
                    .title("New Leave Application")
                    .message("Rohan Das has submitted a request for Annual Leave (5 days starting from " + LocalDate.now().plusDays(10) + ").")
                    .type("LEAVE")
                    .read(false)
                    .createdAt(now.minusHours(2))
                    .actionUrl("/leaves")
                    .build());

            notificationRepository.save(Notification.builder()
                    .userEmail("hr@nexushr.com")
                    .title("Job Application Received")
                    .message("Siddharth Roy applied for the Marketing Associate position.")
                    .type("RECRUITMENT")
                    .read(true)
                    .createdAt(now.minusDays(1))
                    .actionUrl("/recruitment")
                    .build());

            notificationRepository.save(Notification.builder()
                    .userEmail("employee@nexushr.com")
                    .title("Welcome to NexusHR")
                    .message("Welcome Aarav! You can now track your attendance, request leaves, view your payslips, and check performance reviews.")
                    .type("SYSTEM")
                    .read(true)
                    .createdAt(now.minusDays(5))
                    .build());

            notificationRepository.save(Notification.builder()
                    .userEmail("employee@nexushr.com")
                    .title("Performance Review Submitted")
                    .message("Priya Patel has submitted your Q1 2026 performance review. Please view and acknowledge it.")
                    .type("PERFORMANCE")
                    .read(false)
                    .createdAt(now.minusHours(5))
                    .actionUrl("/performance")
                    .build());

            notificationRepository.save(Notification.builder()
                    .userEmail("employee@nexushr.com")
                    .title("Leave Approved")
                    .message("Your Sick Leave application for 3 days has been approved by Priya Patel.")
                    .type("LEAVE")
                    .read(true)
                    .createdAt(now.minusDays(3))
                    .actionUrl("/leaves")
                    .build());
        }

        // 10. Seed Goals for Employees (Connected to the Goals controller)
        if (goalRepository.count() == 0) {
            goalRepository.save(Goal.builder()
                    .employee(emp1)
                    .title("Modernize Frontend Layouts")
                    .description("Upgrade the landing page components to futuristic glassmorphism and Tailwind CSS custom color matrices.")
                    .reviewPeriod("Q1 2026")
                    .targetDate(LocalDate.now().plusMonths(1))
                    .progressPercent(75)
                    .status(GoalStatus.IN_PROGRESS)
                    .setBy("Priya Patel")
                    .build());

            goalRepository.save(Goal.builder()
                    .employee(emp1)
                    .title("Integrate Live Biometric Streams")
                    .description("Implement the EventSource handlers to sync attendance punches instantly with the dashboard table.")
                    .reviewPeriod("Q1 2026")
                    .targetDate(LocalDate.now().plusDays(15))
                    .progressPercent(20)
                    .status(GoalStatus.IN_PROGRESS)
                    .setBy("Priya Patel")
                    .build());

            goalRepository.save(Goal.builder()
                    .employee(emp3)
                    .title("Automate Indian Tax Calculators")
                    .description("Ensure salary net payouts reflect standard deduction tiers and 12%/18%/25% brackets accurately.")
                    .reviewPeriod("Q1 2026")
                    .targetDate(LocalDate.now().plusMonths(2))
                    .progressPercent(0)
                    .status(GoalStatus.NOT_STARTED)
                    .setBy("Priya Patel")
                    .build());
        }

        log.info("✅ Data seeded successfully!");
        log.info("Login credentials:");
        log.info("  Admin:    admin@nexushr.com / admin123");
        log.info("  HR:       hr@nexushr.com / hr123456");
        log.info("  Employee: employee@nexushr.com / emp12345");
    }

}
