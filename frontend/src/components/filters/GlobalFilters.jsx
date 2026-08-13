import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "../../services/api";

export default function GlobalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { data: filterOptions, isLoading, error } = useQuery({
    queryKey: ["filterOptions"],
    queryFn: fetchFilters,
    staleTime: 5 * 60 * 1000,
  });

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Delete page when changing filters to reset pagination
    if (key !== 'page' && newParams.has('page')) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  if (isLoading) return <div className="text-sm text-gray-500 animate-pulse py-2">Loading filters...</div>;
  if (error) return <div className="text-sm text-red-500 py-2">Failed to load filters</div>;

  const currentOutlet = searchParams.get("outlet") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentOrderType = searchParams.get("order_type") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentSettlement = searchParams.get("settlement") || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";

  const hasActiveFilters = currentOutlet || currentCategory || currentOrderType || currentBrand || currentSettlement || startDate || endDate;

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
      
      {/* Date Range */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-600 mb-1 uppercase">Start Date</label>
        <input 
          type="date" 
          value={startDate.split('T')[0]} 
          onChange={(e) => handleFilterChange("start_date", e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-600 mb-1 uppercase">End Date</label>
        <input 
          type="date" 
          value={endDate.split('T')[0]} 
          onChange={(e) => handleFilterChange("end_date", e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Outlet */}
      <div className="flex flex-col min-w-[150px]">
        <label className="text-xs font-semibold text-gray-600 mb-1 uppercase">Outlet</label>
        <select 
          value={currentOutlet} 
          onChange={(e) => handleFilterChange("outlet", e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Outlets</option>
          {filterOptions?.outlets?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Category */}
      <div className="flex flex-col min-w-[150px]">
        <label className="text-xs font-semibold text-gray-600 mb-1 uppercase">Category</label>
        <select 
          value={currentCategory} 
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {filterOptions?.categories?.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Order Type */}
      <div className="flex flex-col min-w-[150px]">
        <label className="text-xs font-semibold text-gray-600 mb-1 uppercase">Order Type</label>
        <select 
          value={currentOrderType} 
          onChange={(e) => handleFilterChange("order_type", e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Types</option>
          {filterOptions?.order_types?.map(ot => <option key={ot} value={ot}>{ot}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div className="flex flex-col min-w-[150px]">
        <label className="text-xs font-semibold text-gray-600 mb-1 uppercase">Brand</label>
        <select 
          value={currentBrand} 
          onChange={(e) => handleFilterChange("brand", e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Brands</option>
          {filterOptions?.brands?.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      
      {/* Settlement */}
      <div className="flex flex-col min-w-[150px]">
        <label className="text-xs font-semibold text-gray-600 mb-1 uppercase">Settlement</label>
        <select 
          value={currentSettlement} 
          onChange={(e) => handleFilterChange("settlement", e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Settlements</option>
          {filterOptions?.settlements?.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={clearFilters}
          className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm transition-colors font-medium"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
