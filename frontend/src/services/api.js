let BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
if (BASE_URL.endsWith("/")) BASE_URL = BASE_URL.slice(0, -1);
if (!BASE_URL.endsWith("/api")) BASE_URL += "/api";

/**
 * Helper to build query strings from filter objects, skipping null/undefined/empty
 */
export const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchDashboardSummary = async (filters) => {
  const res = await fetch(`${BASE_URL}/dashboard/summary${buildQueryString(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
};

export const fetchRevenueTrend = async (filters) => {
  const res = await fetch(`${BASE_URL}/analytics/revenue-trend${buildQueryString(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch revenue trend");
  return res.json();
};

export const fetchOutlets = async (filters) => {
  const res = await fetch(`${BASE_URL}/analytics/outlets${buildQueryString(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch outlets");
  return res.json();
};

export const fetchCategories = async (filters) => {
  const res = await fetch(`${BASE_URL}/analytics/categories${buildQueryString(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

export const fetchOrderTypes = async (filters) => {
  const res = await fetch(`${BASE_URL}/analytics/order-types${buildQueryString(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch order types");
  return res.json();
};

export const fetchProducts = async (filters, sortBy = 'revenue', limit = 10) => {
  const params = { ...filters, sort_by: sortBy, limit };
  const res = await fetch(`${BASE_URL}/analytics/products${buildQueryString(params)}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const fetchSettlements = async (filters) => {
  const res = await fetch(`${BASE_URL}/analytics/settlement${buildQueryString(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch settlements");
  return res.json();
};

export const fetchOrders = async (filters, page = 1, limit = 25) => {
  const params = { ...filters, page, limit };
  const res = await fetch(`${BASE_URL}/orders${buildQueryString(params)}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const fetchFilters = async () => {
  const res = await fetch(`${BASE_URL}/filters`);
  if (!res.ok) throw new Error("Failed to fetch filter options");
  return res.json();
};
