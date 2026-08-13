/**
 * InsightDesk — API service layer
 * All fetch calls to the FastAPI backend go through this file.
 * Base URL is configured via Vite env variable VITE_API_BASE_URL.
 * During local development, Vite proxies /api → http://localhost:8000.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function apiFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v)
    }
  })

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`)
  }
  return res.json()
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const fetchSummary = (filters) =>
  apiFetch('/api/dashboard/summary', filters)

// ─── Analytics ────────────────────────────────────────────────────────────────
export const fetchRevenueTrend   = (filters) => apiFetch('/api/analytics/revenue-trend', filters)
export const fetchOutlets        = (filters) => apiFetch('/api/analytics/outlets', filters)
export const fetchCategories     = (filters) => apiFetch('/api/analytics/categories', filters)
export const fetchOrderTypes     = (filters) => apiFetch('/api/analytics/order-types', filters)
export const fetchProducts       = (filters) => apiFetch('/api/analytics/products', filters)
export const fetchSettlement     = (filters) => apiFetch('/api/analytics/settlement', filters)

// ─── Orders (paginated) ───────────────────────────────────────────────────────
export const fetchOrders = (params) => apiFetch('/api/orders', params)

// ─── Filters ──────────────────────────────────────────────────────────────────
export const fetchFilters = () => apiFetch('/api/filters')
