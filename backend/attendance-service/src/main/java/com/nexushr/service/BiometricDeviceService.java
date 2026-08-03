package com.nexushr.service;

import com.nexushr.entity.BiometricDevice;
import com.nexushr.entity.Employee;
import com.nexushr.entity.AttendanceBiometric;
import java.util.List;

public interface BiometricDeviceService {
    boolean connect(BiometricDevice device);
    boolean disconnect(BiometricDevice device);
    List<AttendanceBiometric> fetchAttendanceLogs(BiometricDevice device);
    boolean registerEmployee(BiometricDevice device, Employee employee, String biometricType, String template);
    boolean deleteEmployee(BiometricDevice device, Employee employee);
    boolean testConnection(BiometricDevice device);
}
