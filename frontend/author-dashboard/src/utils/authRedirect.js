/**
 * Shared newsroom login redirect helpers (author app copy).
 */

export const ADMIN_ROLES = ["admin", "super-admin"];

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

export function isAuthorRole(role) {
  return role === "author";
}

export function getDashboardUrls() {
  return {
    admin:
      import.meta.env.VITE_ADMIN_URL || "http://localhost:5174",
    author: import.meta.env.VITE_AUTHOR_URL || window.location.origin,
    public:
      import.meta.env.VITE_PUBLIC_URL || "http://localhost:5173",
  };
}

export function buildAuthCallbackUrl(baseUrl, token, user) {
  const payload = encodeURIComponent(JSON.stringify({ token, user }));
  const root = String(baseUrl).replace(/\/$/, "");
  return `${root}/auth/callback?auth=${payload}`;
}

export function redirectByRole(token, user, currentApp = "author") {
  if (!token || !user?.role) {
    throw new Error("Invalid login response");
  }

  const urls = getDashboardUrls();
  const role = user.role;

  if (isAdminRole(role)) {
    if (currentApp === "admin") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/";
      return;
    }
    window.location.href = buildAuthCallbackUrl(urls.admin, token, user);
    return;
  }

  if (isAuthorRole(role)) {
    if (currentApp === "author") {
      localStorage.setItem("authorToken", token);
      localStorage.setItem("authorUser", JSON.stringify(user));
      window.location.href = "/";
      return;
    }
    window.location.href = buildAuthCallbackUrl(urls.author, token, user);
    return;
  }

  throw new Error("This account cannot access the newsroom dashboards");
}

export function parseAuthCallbackParam(search) {
  const params = new URLSearchParams(search);
  const raw = params.get("auth");
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw));
    if (!data?.token || !data?.user) return null;
    return data;
  } catch {
    return null;
  }
}
