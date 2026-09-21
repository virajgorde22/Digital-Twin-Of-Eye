import { API_BASE_URL } from "../services/api";

export function resolveMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/$/, "");
  const relative = path.startsWith("/") ? path : `/${path}`;
  return `${base}${relative}`;
}

export function isAllowedImage(file) {
  if (!file) return false;
  const type = file.type || "";
  const name = (file.name || "").toLowerCase();
  return (
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png")
  );
}

const blobCache = new Map();

export async function fetchAuthenticatedImage(path, token) {
  const url = resolveMediaUrl(path);
  if (!url) return "";
  if (blobCache.has(url)) return blobCache.get(url);

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) return url;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return url;
    const objectUrl = URL.createObjectURL(blob);
    blobCache.set(url, objectUrl);
    return objectUrl;
  } catch {
    return url;
  }
}
