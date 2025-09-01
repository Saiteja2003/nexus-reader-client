// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  console.log(
    `ProtectedRoute Check: isLoading=${isLoading}, user=${JSON.stringify(user)}`
  );

  if (!user) {
    // If user is not logged in, redirect them to the login page
    return <Navigate to="/login" />;
  }

  return children; // If logged in, show the component they are trying to access
}

export default ProtectedRoute;
