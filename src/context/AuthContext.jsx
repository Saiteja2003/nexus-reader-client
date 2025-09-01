import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // This effect runs only ONCE on initial app load to check for an existing token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${storedToken}`;
      setUser({ loggedIn: true });
    } else {
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
      setUser(null);
    }
    setIsLoading(false); // Finished the initial check
  }, []);

  // This separate effect handles what happens when the token CHANGES (e.g., on login/logout)
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ loggedIn: true });
    } else {
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
      setUser(null);
    }
  }, [token]);

  // Global error handler to automatically log out on 401 (Unauthorized) errors
  useEffect(() => {
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setToken(null); // This will trigger logout via the effect above
        }
        return Promise.reject(error);
      }
    );
    // Cleanup function to remove the interceptor when the component unmounts
    return () => {
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      setToken(response.data.token);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      const message =
        error.response?.data?.errors?.[0]?.msg ||
        "Login failed. Please check your credentials.";
      alert(message);
    }
  };

  const register = async (email, password) => {
    try {
      await apiClient.post("/api/auth/register", { email, password });
      navigate("/login");
      alert("Registration successful! Please log in.");
    } catch (error) {
      console.error("Registration failed:", error);
      const message =
        error.response?.data?.errors?.[0]?.msg || "Registration failed.";
      alert(message);
    }
  };

  const logout = () => {
    setToken(null);
    navigate("/login");
  };

  const value = { user, token, isLoading, login, register, logout };

  // While checking for the token on initial load, show a loading screen
  if (isLoading) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading Application...
      </p>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
