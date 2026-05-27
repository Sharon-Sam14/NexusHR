package com.nexushr.service;

import com.nexushr.dto.DashboardStatsDTO;

public interface DashboardService {
    DashboardStatsDTO getStats(String userEmail);
}
