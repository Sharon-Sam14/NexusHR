import axiosInstance from "../api/axiosInstance";

export const auditService = {
  /*
   * Fetch audit logs with optional filters.
   * @param {string} search - free-text search across all columns
   * @param {string} action - category prefix filter (PAYROLL, SALARY, EMPLOYEE, LEAVE)
   * @param {string} target - filter by target entity name
   */
  getAll: ({ search, action, target } = {}) => {
    const params = {};
    if (search) params.search = search;
    if (action && action !== "ALL") params.action = action;
    if (target) params.target = target;
    return axiosInstance.get("/audit-logs", { params }).then((r) => r.data);
  },
};
