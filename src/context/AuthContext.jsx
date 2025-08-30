// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    // This effect runs when the token changes
    if (token) {
      localStorage.setItem("token", token);
      // We can add logic here later to fetch user details from the token
      setUser({ loggedIn: true });
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      setToken(response.data.token);
      navigate("/"); // Redirect to the main app after login
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.response?.data?.errors[0]?.msg || "Login failed");
    }
  };

  const register = async (email, password) => {
    try {
      await apiClient.post("/api/auth/register", { email, password });
      navigate("/login"); // Redirect to login page after successful registration
      alert("Registration successful! Please log in.");
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.response?.data?.errors[0]?.msg || "Registration failed");
    }
  };

  const logout = () => {
    setToken(null);
    navigate("/login");
  };

  const value = { user, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to easily use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
