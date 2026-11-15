import React from 'react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, subtitle }) {
  let changeColor = 'text-emerald-600';
  if (changeType === 'negative') changeColor = 'text-rose-600';
  if (changeType === 'warning') changeColor = 'text-amber-600';
  if (changeType === 'neutral') changeColor = 'text-slate-500';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-5 group hover:border-slate-300 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-maroon-700 shadow-xs group-hover:scale-105 group-hover:bg-maroon-50 group-hover:border-maroon-200 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
          {change && (
            <span className={`font-semibold ${changeColor}`}>
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
