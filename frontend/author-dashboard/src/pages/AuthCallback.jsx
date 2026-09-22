import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../store/slices/authSlice";
import {
  isAuthorRole,
  parseAuthCallbackParam,
} from "../utils/authRedirect";

/**
 * Receives token from public (or cross-app) login and opens the author desk.
 */
function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const data = parseAuthCallbackParam(window.location.search);
    if (!data) {
      setMessage("Invalid sign-in link");
      navigate("/login", { replace: true });
      return;
    }

    if (!isAuthorRole(data.user?.role)) {
      setMessage("This account is not an author");
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("authorToken", data.token);
    localStorage.setItem("authorUser", JSON.stringify(data.user));
    dispatch(loginSuccess({ token: data.token, user: data.user }));
    window.history.replaceState({}, "", "/");
    window.location.href = "/";
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-ink-muted text-sm">
      {message}
    </div>
  );
}

export default AuthCallback;
