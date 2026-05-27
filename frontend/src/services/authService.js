import axiosInstance from "../api/axiosInstance";

export const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (name, email, password, role = "EMPLOYEE") => {
    const response = await axiosInstance.post("/auth/register", { name, email, password, role });
    return response.data;
  },
};
