package com.nexushr.dto;

import com.nexushr.entity.Employee;
import org.springframework.context.ApplicationEvent;

/**
 * Spring Application Event triggered when a new employee is onboarded.
 * Captured by listeners to handle user credentials generation and email dispatches.
 */
public class EmployeeCreatedEvent extends ApplicationEvent {
    
    private final Employee employee;

    public EmployeeCreatedEvent(Object source, Employee employee) {
        super(source);
        this.employee = employee;
    }

    public Employee getEmployee() {
        return employee;
    }
}
