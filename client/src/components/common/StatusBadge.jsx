import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const norm = (status || '').toLowerCase().replace(' ', '_');

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = status || 'Unknown';

  switch (norm) {
    case 'healthy':
    case 'operational':
    case 'available':
    case 'active':
    case 'resolved':
      style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      label = (norm === 'healthy' || norm === 'operational') ? 'Operational' : norm === 'resolved' ? 'Resolved' : norm === 'active' ? 'Active Loan' : 'Available';
      break;
    case 'warning':
    case 'minor_issue':
    case 'in_progress':
    case 'servicing':
    case 'medium':
      style = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
      label = (norm === 'warning' || norm === 'minor_issue') ? 'Minor Issue' : norm === 'in_progress' ? 'In Progress' : 'Warning';
      break;
    case 'faulty':
    case 'maintenance':
    case 'critical':
    case 'high':
    case 'down':
    case 'overdue':
      style = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
      label = (norm === 'faulty' || norm === 'maintenance') ? 'Maintenance Needed' : norm === 'overdue' ? 'Overdue Return' : status;
      break;
    case 'pending':
    case 'low':
      style = 'bg-cyan-50 text-cyan-800 border-cyan-200';
      dotColor = 'bg-cyan-500';
      label = norm === 'pending' ? 'Pending Triage' : status;
      break;
    default:
      break;
  }

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-semibold rounded-full border ${style} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{label}</span>
    </span>
  );
}
