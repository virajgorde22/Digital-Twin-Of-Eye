export function firstName(fullName = "") {
  const part = String(fullName).trim().split(/\s+/)[0] || "there";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

export function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function parseDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    return new Date(y, m - 1, d, hh, mm, ss);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = parseDate(value);
  if (!date) return "Not available";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatMonth(value) {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
}

export function toPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return 0;
  const n = Number(value);
  return n <= 1 ? n * 100 : n;
}

export function formatPercent(value, digits = 1) {
  return `${toPercent(value).toFixed(digits)}%`;
}

export function eyeLabel(side) {
  if (!side) return "Eye";
  const value = String(side).toUpperCase();
  if (value === "LEFT") return "Left eye";
  if (value === "RIGHT") return "Right eye";
  return side;
}

export function sortScansNewest(scans = []) {
  return [...scans].sort((a, b) => {
    const da = parseDate(a.scanDate)?.getTime() || 0;
    const db = parseDate(b.scanDate)?.getTime() || 0;
    return db - da;
  });
}

export function mapToEntries(map = {}) {
  return Object.entries(map || {})
    .map(([label, value]) => ({ label, value: toPercent(value) }))
    .sort((a, b) => b.value - a.value);
}
