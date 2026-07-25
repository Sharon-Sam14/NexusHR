# NexusHR Testing & Verification Specification

This document details the testing architecture, validation patterns, and manual verification procedures for the **NexusHR** platform.

---

## 1. Backend Automated Testing

We use JUnit 5, Mockito, and Spring Boot Test frameworks.

### 1.1 Command Parameters for running tests
To run the complete backend test suite, navigate to the `backend/` directory and execute:
```bash
mvn test
```
To run tests for a specific submodule:
```bash
mvn test -pl payroll-service
```

### 1.2 Writing Unit Tests with Mockito
Mock dependencies to verify service logic in isolation:
```java
@ExtendWith(MockitoExtension.class)
public class LeaveRequestServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private LeaveRequestServiceImpl leaveRequestService;

    @Test
    public void testLeaveApply_Success() {
        Employee emp = Employee.builder().id(1L).leaveBalance(15).build();
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(emp));

        LeaveRequestDTO dto = LeaveRequestDTO.builder()
            .employeeId(1L)
            .startDate(LocalDate.now())
            .endDate(LocalDate.now().plusDays(2))
            .leaveType(LeaveType.ANNUAL)
            .build();

        LeaveRequest result = leaveRequestService.applyLeave(dto);
        assertNotNull(result);
        assertEquals(LeaveStatus.PENDING, result.getStatus());
    }
}
```

---

## 2. Frontend Automated Testing

The React client supports test suites running on **Vitest** and **React Testing Library**.

### 2.1 Running Client Tests
Navigate to the `frontend/` directory and execute:
```bash
npm run test
```

---

## 3. Manual Verification Checklist

Verify key features before deployment:
1.  **Login Verification**: Verify that entering incorrect credentials displays a warning message.
2.  **Clock Action Verification**: Perform check-in and check-out actions. Verify that the work duration calculations are correct.
3.  **Leave Verification**: Request a leave period that exceeds the remaining balance. Verify that the system blocks the submission.
4.  **Security Gate Verification**: Log in as an `EMPLOYEE` and attempt to navigate to `/insights` or `/audit-logs`. Verify that the page redirects or blocks access.
