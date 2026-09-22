const API_ROOT = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/public"
).replace(/\/api\/public\/?$/, "");

export function getImageUrl(path, fallback = "https://placehold.co/800x500?text=News") {
  if (!path) return fallback;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`;
}

export function articlePath(article) {
  if (!article) return "/";
  return `/article/${article.slug || article._id}`;
}

export function formatNewsDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatNewsDate(value);
}
