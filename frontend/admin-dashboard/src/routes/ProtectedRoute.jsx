import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminRole } from "../utils/authRedirect";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role && !isAdminRole(user.role)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
