import React from 'react';

const bloodColors = {
  'O-':  'bg-red-500/20 text-red-400 border-red-500/30',
  'O+':  'bg-red-500/20 text-red-400 border-red-500/30',
  'A+':  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'A-':  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'B+':  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'B-':  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'AB+': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'AB-': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const BloodGroupBadge = ({ group, className = '' }) => {
  if (!group) return null;
  
  const colorClass = bloodColors[group] || 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass} ${className}`}>
      {group}
    </span>
  );
};

export default BloodGroupBadge;
