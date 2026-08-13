import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchDashboardSummary, 
  fetchCategories, 
  fetchOutlets,
  fetchOrderTypes
} from "../services/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
import GlobalFilters from "../components/filters/GlobalFilters";
import { FileText, TrendingUp, AlertTriangle } from "lucide-react";

export default function Reports() {
  const [searchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboardSummary", filters],
    queryFn: () => fetchDashboardSummary(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", filters],
    queryFn: () => fetchCategories(filters),
  });

  const { data: outlets } = useQuery({
    queryKey: ["outlets", filters],
    queryFn: () => fetchOutlets(filters),
  });

  const { data: orderTypes } = useQuery({
    queryKey: ["orderTypes", filters],
    queryFn: () => fetchOrderTypes(filters),
  });

  // Calculate some simple business observations based on loaded data
  const topOutlet = outlets && outlets.length > 0 ? outlets[0] : null;
  const topCategory = categories && categories.length > 0 ? categories[0] : null;
  const topOrderType = orderTypes && orderTypes.length > 0 ? orderTypes[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Reports</h1>
          <p className="text-slate-500">Auto-generated business summaries based on API data.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <FileText size={16} />
          Print Report
        </button>
      </div>

      <GlobalFilters />

      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm print:shadow-none print:border-none">
        
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Performance Summary</h2>
          {loadingSummary ? (
             <div className="animate-pulse flex space-x-4">
               <div className="h-4 bg-slate-200 rounded w-3/4"></div>
             </div>
          ) : (
            <p className="text-slate-700 leading-relaxed">
              Based on the selected filters, the total revenue recorded is <strong className="text-blue-700">{formatCurrency(summary?.total_revenue)}</strong> across <strong className="text-slate-900">{formatNumber(summary?.total_orders)}</strong> unique orders. The average order value (AOV) stands at <strong className="text-slate-900">{formatCurrency(summary?.average_order_value)}</strong>, and a total of <strong className="text-slate-900">{formatNumber(summary?.items_sold)}</strong> items were sold.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-600" /> Key Strengths
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              {topOutlet && (
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                  <span><strong>{topOutlet.outlet}</strong> is the highest performing outlet, contributing <strong>{formatCurrency(topOutlet.revenue)}</strong> to total revenue.</span>
                </li>
              )}
              {topCategory && (
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                  <span>The <strong>{topCategory.category}</strong> category leads sales with <strong>{formatCurrency(topCategory.revenue)}</strong>.</span>
                </li>
              )}
              {topOrderType && (
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                  <span><strong>{topOrderType.order_type}</strong> is the dominant order type, generating <strong>{formatCurrency(topOrderType.revenue)}</strong> from {formatNumber(topOrderType.orders)} orders.</span>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Distribution Breakdown
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category Split (Top 3)</h4>
                {categories?.slice(0,3).map(c => (
                  <div key={c.category} className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{c.category}</span>
                    <span className="font-medium">{formatCurrency(c.revenue)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Outlet Contribution (Top 3)</h4>
                {outlets?.slice(0,3).map(o => (
                  <div key={o.outlet} className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{o.outlet}</span>
                    <span className="font-medium">{formatCurrency(o.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded p-4 text-xs text-slate-500 text-center border border-slate-200">
          Report generated directly from real-time PostgreSQL analytics APIs. <br />
          Filters applied: {Object.keys(filters).length > 0 ? JSON.stringify(filters) : "None (All Data)"}
        </div>

      </div>
    </div>
  );
}
