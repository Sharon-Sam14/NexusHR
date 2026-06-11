package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/*
 * OrgChartService
 *
 * Generates a hierarchical organization chart keyed by department.
 * For each department, resolves all active employees and designates
 * the highest-salaried member as the department head.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrgChartService {

    private final EmployeeRepository employeeRepository;

    /*
     * Department-level node for the org chart response.
     */
    public record OrgNode(
            String department,
            String head,
            String headDesignation,
            Long headId,
            List<MemberNode> members,
            int totalCount
    ) {}

    public record MemberNode(
            Long id,
            String name,
            String designation,
            String email
    ) {}

    /*
     * Builds a full org chart grouped by department.
     * Department head = highest-salary employee in that department.
     */
    public List<OrgNode> buildOrgChart() {
        List<Employee> employees = employeeRepository.findAll();

        Map<String, List<Employee>> byDept = employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment));

        List<OrgNode> chart = new ArrayList<>();

        for (Map.Entry<String, List<Employee>> entry : byDept.entrySet()) {
            String dept = entry.getKey();
            List<Employee> members = entry.getValue();

            // Determine head: highest salary in the dept
            Employee head = members.stream()
                    .max(Comparator.comparingDouble(Employee::getSalary))
                    .orElse(null);

            List<MemberNode> memberNodes = members.stream()
                    .map(e -> new MemberNode(e.getId(), e.getEmployeeName(), e.getDesignation(), e.getEmail()))
                    .sorted(Comparator.comparing(MemberNode::designation))
                    .collect(Collectors.toList());

            chart.add(new OrgNode(
                    dept,
                    head != null ? head.getEmployeeName() : "Unassigned",
                    head != null ? head.getDesignation() : "",
                    head != null ? head.getId() : null,
                    memberNodes,
                    members.size()
            ));
        }

        // Sort departments alphabetically
        chart.sort(Comparator.comparing(OrgNode::department));
        log.info("OrgChart built for {} departments", chart.size());
        return chart;
    }
}
