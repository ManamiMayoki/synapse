import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const norm = (status || '').toLowerCase().replace(' ', '_');

  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';
  let label = status || 'Unknown';

  switch (norm) {
    case 'healthy':
    case 'available':
    case 'active':
    case 'resolved':
      style = 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30';
      dotColor = 'bg-emerald-400 animate-pulse';
      label = norm === 'healthy' ? 'Healthy' : norm === 'resolved' ? 'Resolved' : 'Available';
      break;
    case 'warning':
    case 'in_progress':
    case 'servicing':
    case 'medium':
      style = 'bg-amber-950/50 text-amber-300 border-amber-500/40';
      dotColor = 'bg-amber-400';
      label = norm === 'in_progress' ? 'In Progress' : 'Warning';
      break;
    case 'faulty':
    case 'critical':
    case 'high':
    case 'down':
    case 'overdue':
      style = 'bg-maroon-950/80 text-maroon-300 border-maroon-600/50 shadow-[0_0_12px_rgba(163,59,38,0.3)]';
      dotColor = 'bg-red-500 animate-ping';
      label = norm === 'faulty' ? 'Needs Maintenance' : norm === 'overdue' ? 'Overdue Return' : status;
      break;
    case 'pending':
    case 'low':
      style = 'bg-cyan-950/50 text-cyan-300 border-cyan-500/30';
      dotColor = 'bg-cyan-400';
      label = norm === 'pending' ? 'Pending Triage' : status;
      break;
    default:
      break;
  }

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-medium rounded-full border backdrop-blur-md ${style} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{label}</span>
    </span>
  );
}
