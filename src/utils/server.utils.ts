export function getBaseUrl() {
  const host = process.env.BASE_URL || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}
