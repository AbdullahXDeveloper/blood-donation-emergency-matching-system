import React from 'react';

const statusStyles = {
  pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  verified:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  matching:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  fulfilled:  'bg-green-500/10 text-green-400 border-green-500/20',
  expired:    'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  critical:   'bg-red-500/10 text-red-400 border-red-500/20',
};

const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;
  
  const normalizedStatus = status.toLowerCase();
  const colorClass = statusStyles[normalizedStatus] || 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${colorClass} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
