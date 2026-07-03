package com.nexushr.repository;

import com.nexushr.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    /*
     * Full-text search across actor, action, target and details columns.
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "LOWER(a.actor)   LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.action)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.target)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.details) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> search(@Param("q") String query);

    /*
     * Filter by a specific action category prefix (e.g. "PAYROLL_", "SALARY_").
     */
    @Query("SELECT a FROM AuditLog a WHERE LOWER(a.action) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY a.timestamp DESC")
    List<AuditLog> findByActionPrefixOrderByTimestampDesc(@Param("prefix") String prefix);

    /*
     * Filter by target (employee name or entity name).
     */
    @Query("SELECT a FROM AuditLog a WHERE LOWER(a.target) LIKE LOWER(CONCAT('%', :target, '%')) ORDER BY a.timestamp DESC")
    List<AuditLog> findByTargetContainingIgnoreCaseOrderByTimestampDesc(@Param("target") String target);
}
