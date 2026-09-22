import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isAdminRole,
  parseAuthCallbackParam,
} from "../utils/authRedirect";

/**
 * Receives token from public (or cross-app) login and opens the admin console.
 */
function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const data = parseAuthCallbackParam(window.location.search);
    if (!data) {
      setMessage("Invalid sign-in link");
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdminRole(data.user?.role)) {
      setMessage("This account is not an admin");
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.history.replaceState({}, "", "/");
    window.location.href = "/";
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-ink-muted text-sm">
      {message}
    </div>
  );
}

export default AuthCallback;
