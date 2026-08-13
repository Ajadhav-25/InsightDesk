import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchOutlets } from "../services/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
import GlobalFilters from "../components/filters/GlobalFilters";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";

export default function Performance() {
  const [searchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", filters],
    queryFn: () => fetchCategories(filters),
  });

  const { data: outlets, isLoading: loadingOutlets } = useQuery({
    queryKey: ["outlets", filters],
    queryFn: () => fetchOutlets(filters),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance Analysis</h1>
        <p className="text-slate-500">Deep dive into category and outlet metrics.</p>
      </div>

      <GlobalFilters />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Performance */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-[500px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Category Records vs Revenue</h3>
          {loadingCategories ? (
             <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val, name) => [name === 'revenue' ? formatCurrency(val) : formatNumber(val), name === 'revenue' ? 'Revenue' : 'Records']} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar yAxisId="left" dataKey="revenue" name="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="records" name="records" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Outlet Performance */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col h-[500px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Outlet Orders vs Revenue</h3>
          {loadingOutlets ? (
             <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outlets} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="outlet" angle={-45} textAnchor="end" height={80} tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val, name) => [name === 'revenue' ? formatCurrency(val) : formatNumber(val), name === 'revenue' ? 'Revenue' : 'Orders']} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar yAxisId="left" dataKey="revenue" name="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="orders" name="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
