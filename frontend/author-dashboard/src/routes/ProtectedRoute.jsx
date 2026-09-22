import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAuthorRole } from "../utils/authRedirect";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  let storedUser = user;
  if (!storedUser) {
    try {
      storedUser = JSON.parse(localStorage.getItem("authorUser") || "null");
    } catch {
      storedUser = null;
    }
  }

  if (!isAuthenticated && !localStorage.getItem("authorToken")) {
    return <Navigate to="/login" replace />;
  }

  if (storedUser?.role && !isAuthorRole(storedUser.role)) {
    localStorage.removeItem("authorToken");
    localStorage.removeItem("authorUser");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
