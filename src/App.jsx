// src/App.jsx
import { Routes, Route } from "react-router-dom";
// Remove useState, useEffect, axios, apiClient imports as they are now in AuthContext and MainLayout
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*" // This will match the homepage and any other route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
export default App;
