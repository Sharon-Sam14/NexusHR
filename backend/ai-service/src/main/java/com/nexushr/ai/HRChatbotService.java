package com.nexushr.ai;

import com.nexushr.entity.Employee;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.LeaveRequestRepository;
import com.nexushr.repository.PayrollRepository;
import com.nexushr.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/*
 * HRChatbotService
 *
 * Simulated RAG (Retrieval-Augmented Generation) co-pilot for HR queries.
 *
 * On each query, it retrieves live database statistics, then pattern-matches
 * the input question to a curated set of knowledge responses enriched with
 * real-time data — simulating what an LLM with RAG would produce.
 *
 * This avoids requiring an external AI API while demonstrating the concept.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HRChatbotService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final PerformanceRepository performanceRepository;

    public record ChatResponse(
            String query,
            String answer,
            String sourceContext
    ) {}

    /*
     * Processes a natural language HR query and returns a contextual response.
     */
    public ChatResponse query(String userQuery) {
        String q = userQuery.toLowerCase().trim();
        log.info("[HR-CHATBOT] Query received: {}", userQuery);

        // Retrieve live stats for RAG context
        long totalEmployees = employeeRepository.count();
        long totalLeaves    = leaveRequestRepository.count();
        long totalPayrolls  = payrollRepository.count();
        long totalReviews   = performanceRepository.count();

        List<Employee> employees = employeeRepository.findAll();
        double avgSalary = employees.stream().mapToDouble(Employee::getSalary).average().orElse(0.0);

        String ctx = String.format(
                "Live DB Context — Employees: %d | Leaves: %d | Payrolls: %d | Reviews: %d | Avg Salary: $%,.0f",
                totalEmployees, totalLeaves, totalPayrolls, totalReviews, avgSalary
        );

        String answer;

        // ── Intent matching ────────────────────────────────────────────────

        if (matches(q, "how many employees", "total employees", "headcount", "employee count")) {
            answer = String.format(
                "NexusHR currently has **%d active employees** on record across all departments. " +
                "The system tracks attendance, payroll, leave, and performance data for all of them.",
                totalEmployees);

        } else if (matches(q, "leave", "leave balance", "leave request", "leaves pending")) {
            long pending = leaveRequestRepository.countByStatus(com.nexushr.entity.LeaveStatus.PENDING);
            answer = String.format(
                "There are currently **%d leave requests** in the system. **%d** are pending HR approval. " +
                "Each employee starts with 15 annual leave days, which are automatically deducted on approval.",
                totalLeaves, pending);

        } else if (matches(q, "payroll", "salary", "how much", "average salary", "pay")) {
            answer = String.format(
                "The company average monthly salary is **$%,.0f**. There are **%d payroll records** in the system. " +
                "Tax brackets are applied automatically: 12%% (<$50k), 18%% ($50k–$100k), and 25%% (>$100k).",
                avgSalary, totalPayrolls);

        } else if (matches(q, "attrition", "risk", "employee risk", "who might leave")) {
            answer = "Based on our predictive model, attrition risk factors include below-market salary, " +
                     "declining attendance, high late arrival rates, and high performers who are undercompensated. " +
                     "Please check the **Attrition Risk panel** for individual scores and recommendations.";

        } else if (matches(q, "performance", "review", "rating", "feedback")) {
            answer = String.format(
                "There are **%d performance review records** in NexusHR. Reviews track productivity, quality, " +
                "teamwork, and communication ratings on a 5-point scale. The system supports DRAFT → SUBMITTED → ACKNOWLEDGED workflows.",
                totalReviews);

        } else if (matches(q, "skill gap", "training", "skills", "learning")) {
            answer = "NexusHR's Skill Gap Analyser maps each employee's role to expected competencies and estimates " +
                     "current proficiency based on performance data. Common gaps include Cloud Infrastructure for engineers, " +
                     "UX Research for designers, and Data Analytics for HR managers. Check the Skill Gaps panel for details.";

        } else if (matches(q, "onboarding", "new employee", "onboard")) {
            answer = "The onboarding workflow tracks 5 steps per employee: profile photo, personal details, " +
                     "document upload, emergency contact, and active status activation. " +
                     "Visit an employee's profile to see their onboarding completion percentage.";

        } else if (matches(q, "notification", "email", "sms", "alert")) {
            answer = "NexusHR simulates SMTP email and Twilio SMS dispatch gateways. " +
                     "Notifications are triggered on leave applications, approvals, payroll runs, and performance reviews. " +
                     "Check the Notifications Centre for your inbox.";

        } else if (matches(q, "hello", "hi", "hey", "help", "what can you do")) {
            answer = "Hello! I'm your **NexusHR AI Co-Pilot** 🤖. I can answer questions about:\n\n" +
                     "- Employee headcount & department data\n" +
                     "- Leave requests & balance pools\n" +
                     "- Payroll & salary benchmarks\n" +
                     "- Performance reviews & ratings\n" +
                     "- Attrition risk predictions\n" +
                     "- Skill gap analysis & training\n" +
                     "- Onboarding status & notifications\n\n" +
                     "Just ask me anything!";

        } else {
            answer = String.format(
                "I'm analyzing your query: *\"%s\"*.\n\n" +
                "Based on current data (%d employees, %d reviews, $%,.0f avg salary), " +
                "I don't have a specific pre-built response for this. " +
                "Try asking about: employee count, leave requests, payroll averages, attrition risk, skill gaps, or performance reviews.",
                userQuery, totalEmployees, totalReviews, avgSalary);
        }

        log.info("[HR-CHATBOT] Response generated for query: {}", userQuery);
        return new ChatResponse(userQuery, answer, ctx);
    }

    private boolean matches(String query, String... keywords) {
        for (String kw : keywords) {
            if (query.contains(kw)) return true;
        }
        return false;
    }
}
