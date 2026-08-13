import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../services/api";
import { formatCurrency, formatNumber, formatDateTime } from "../utils/formatters";
import GlobalFilters from "../components/filters/GlobalFilters";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());
  
  // Extract page from URL, default to 1
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [limit, setLimit] = useState(25);

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", filters, page, limit],
    queryFn: () => fetchOrders(filters, page, limit),
    keepPreviousData: true,
  });

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (data && newPage > data.total_pages)) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1"); // Reset to page 1 on limit change
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500">Detailed line item records with server-side pagination.</p>
      </div>

      <GlobalFilters />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
          <h3 className="font-semibold text-slate-800">
            {isLoading ? "Loading..." : `Found ${formatNumber(data?.total)} records`}
          </h3>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <select 
              value={limit} 
              onChange={handleLimitChange}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-4 py-3">Bill No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Outlet</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                    Loading orders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-red-500">Error loading orders.</td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-gray-500">No orders found for the selected filters.</td>
                </tr>
              ) : (
                data?.data?.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">#{row.bill_no}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(row.order_datetime)}</td>
                    <td className="px-4 py-3">{row.outlet_name}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={row.item}>{row.item}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.order_type}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.price)}</td>
                    <td className="px-4 py-3 text-right">{row.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(row.line_revenue)}</td>
                    <td className="px-4 py-3">{row.settlement}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && !error && data?.total_pages > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, data.total)}</span> of <span className="font-medium">{formatNumber(data.total)}</span> results
            </div>
            
            <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center px-3 text-sm font-medium text-slate-700">
                Page {page} of {formatNumber(data.total_pages)}
              </div>
              
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= data.total_pages}
                className="p-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
