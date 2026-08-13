import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchDashboardSummary, 
  fetchRevenueTrend, 
  fetchCategories, 
  fetchOutlets,
  fetchOrderTypes
} from "../services/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
import KpiCard from "../components/cards/KpiCard";
import GlobalFilters from "../components/filters/GlobalFilters";
import { IndianRupee, ShoppingBag, ShoppingCart, ListOrdered, Receipt } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboardSummary", filters],
    queryFn: () => fetchDashboardSummary(filters),
  });

  const { data: revenueTrend, isLoading: loadingTrend } = useQuery({
    queryKey: ["revenueTrend", filters],
    queryFn: () => fetchRevenueTrend(filters),
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", filters],
    queryFn: () => fetchCategories(filters),
  });

  const { data: outlets, isLoading: loadingOutlets } = useQuery({
    queryKey: ["outlets", filters],
    queryFn: () => fetchOutlets(filters),
  });

  const { data: orderTypes, isLoading: loadingOrderTypes } = useQuery({
    queryKey: ["orderTypes", filters],
    queryFn: () => fetchOrderTypes(filters),
  });

  const renderLoader = () => (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Key metrics and performance trends.</p>
      </div>

      <GlobalFilters />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard 
          title="Total Revenue" 
          value={loadingSummary ? "..." : formatCurrency(summary?.total_revenue)} 
          icon={IndianRupee} 
        />
        <KpiCard 
          title="Orders" 
          value={loadingSummary ? "..." : formatNumber(summary?.total_orders)} 
          icon={ShoppingCart} 
        />
        <KpiCard 
          title="Avg Order Value" 
          value={loadingSummary ? "..." : formatCurrency(summary?.average_order_value)} 
          icon={Receipt} 
        />
        <KpiCard 
          title="Items Sold" 
          value={loadingSummary ? "..." : formatNumber(summary?.items_sold)} 
          icon={ShoppingBag} 
        />
        <KpiCard 
          title="Total Records" 
          value={loadingSummary ? "..." : formatNumber(summary?.total_records)} 
          icon={ListOrdered} 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Trend</h3>
          {loadingTrend ? renderLoader() : (
            revenueTrend?.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">No data available for this selection.</div>
            )
          )}
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Types</h3>
          {loadingOrderTypes ? renderLoader() : (
            orderTypes?.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderTypes}
                      dataKey="revenue"
                      nameKey="order_type"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {orderTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">No data available.</div>
            )
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Category</h3>
          {loadingCategories ? renderLoader() : (
            categories?.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">No data available.</div>
            )
          )}
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Outlet</h3>
          {loadingOutlets ? renderLoader() : (
            outlets?.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outlets} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="outlet" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} height={60} />
                    <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">No data available.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
