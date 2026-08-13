import React from "react";

export default function KpiCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      {Icon && (
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
          <Icon className="text-blue-600" size={24} />
        </div>
      )}
    </div>
  );
}
