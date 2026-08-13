import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../services/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
import GlobalFilters from "../components/filters/GlobalFilters";
import { ArrowUpDown } from "lucide-react";

export default function Products() {
  const [searchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());
  
  const [sortBy, setSortBy] = useState("revenue");
  const [limit, setLimit] = useState(50);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", filters, sortBy, limit],
    queryFn: () => fetchProducts(filters, sortBy, limit),
  });

  const toggleSort = () => {
    setSortBy(prev => prev === "revenue" ? "quantity" : "revenue");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Products Analysis</h1>
        <p className="text-slate-500">Top performing items by revenue or quantity.</p>
      </div>

      <GlobalFilters />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Top {limit} Products</h3>
          <div className="flex gap-4 items-center">
             <select 
                value={limit} 
                onChange={(e) => setLimit(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>Top 10</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
                <option value={0}>All Products</option>
              </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={toggleSort}>
                  <div className="flex items-center gap-1">
                    Quantity
                    {sortBy === 'quantity' && <ArrowUpDown size={14} className="text-blue-600" />}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={toggleSort}>
                   <div className="flex items-center gap-1">
                    Revenue
                    {sortBy === 'revenue' && <ArrowUpDown size={14} className="text-blue-600" />}
                  </div>
                </th>
                <th className="px-6 py-4">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                    Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-500">Error loading products.</td>
                </tr>
              ) : products?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No products found for the selected filters.</td>
                </tr>
              ) : (
                products?.map((product, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{product.item}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatNumber(product.quantity)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(product.revenue)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatNumber(product.records)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
