// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // If user is not logged in, redirect them to the login page
    return <Navigate to="/login" />;
  }

  return children; // If logged in, show the component they are trying to access
}

export default ProtectedRoute;
