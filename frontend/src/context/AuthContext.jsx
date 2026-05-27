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
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("nexushr_token");
        localStorage.removeItem("nexushr_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const { token, ...userInfo } = data;

    localStorage.setItem("nexushr_token", token);
    localStorage.setItem("nexushr_user", JSON.stringify(userInfo));

    setToken(token);
    setUser(userInfo);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("nexushr_token");
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
