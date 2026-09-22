export function getImageUrl(
  image,
  fallback = "https://placehold.co/160x100?text=No+Image"
) {
  if (!image) return fallback;
  if (typeof image !== "string") return fallback;
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  const path = image.startsWith("/") ? image : `/${image}`;
  return `http://localhost:5000${path}`;
}

export function formatShortDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
