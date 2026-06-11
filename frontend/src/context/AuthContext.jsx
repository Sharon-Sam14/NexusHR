import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("nexushr_token");
    const storedUser = localStorage.getItem("nexushr_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.employeeId && !parsedUser.employee) {
          parsedUser.employee = { id: parsedUser.employeeId };
        }
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("nexushr_token");
        localStorage.removeItem("nexushr_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const { token, refreshToken, ...userInfo } = data;

    if (userInfo.employeeId) {
      userInfo.employee = { id: userInfo.employeeId };
    }

    localStorage.setItem("nexushr_token", token);
    if (refreshToken) {
      localStorage.setItem("nexushr_refresh_token", refreshToken);
    }
    localStorage.setItem("nexushr_user", JSON.stringify(userInfo));

    setToken(token);
    setUser(userInfo);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Backend logout failed", e);
    }
    localStorage.removeItem("nexushr_token");
    localStorage.removeItem("nexushr_refresh_token");
    localStorage.removeItem("nexushr_user");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const isAdmin = () => hasRole("ADMIN");
  const isHR = () => hasRole("ADMIN", "HR");
  const isEmployee = () => hasRole("EMPLOYEE");

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        isAdmin,
        isHR,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
