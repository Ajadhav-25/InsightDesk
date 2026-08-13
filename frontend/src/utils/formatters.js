/**
 * Formats a number as INR currency (e.g., ₹69,480,952)
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a number with commas (e.g., 300,000)
 */
export const formatNumber = (value) => {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("en-IN").format(value);
};

/**
 * Formats a date string into a readable format (e.g., Jun 16, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

/**
 * Formats a date and time string (e.g., Jun 16, 2026, 11:48 PM)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};
