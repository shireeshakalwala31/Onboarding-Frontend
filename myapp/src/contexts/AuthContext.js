import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser({}); // quick restore
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user || {});
    return response;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user || {});
    return response;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (err) { /* ignore */ }
    localStorage.removeItem("token");
    setUser(null);
  };

  const sendOtp = async (email) => {
    return authAPI.sendOtp(email);
  };

  const verifyOtp = async (email, otp) => {
    return authAPI.verifyOtp(email, otp);
  };

  const resetPassword = async (email, newPassword) => {
    return authAPI.resetPassword(email, newPassword);
  };

  const value = { user, login, register, logout, sendOtp, verifyOtp, resetPassword, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};