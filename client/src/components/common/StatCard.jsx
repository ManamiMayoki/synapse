import React from 'react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, subtitle }) {
  let changeColor = 'text-emerald-400';
  if (changeType === 'negative') changeColor = 'text-maroon-400';
  if (changeType === 'warning') changeColor = 'text-amber-400';
  if (changeType === 'neutral') changeColor = 'text-slate-400';

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-5 group hover:border-gold-500/40 transition-all duration-300">
      {/* Background glow flare on hover */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl group-hover:bg-gold-500/20 transition-all"></div>
      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-maroon-600/10 rounded-full blur-2xl group-hover:bg-maroon-600/20 transition-all"></div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-maroon-700/20 border border-gold-500/30 flex items-center justify-center text-gold-300 shadow-md group-hover:scale-110 group-hover:border-gold-400 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs relative z-10">
          {change && (
            <span className={`font-medium ${changeColor}`}>
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
