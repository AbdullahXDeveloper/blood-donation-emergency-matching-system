import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ label, value, change, icon: Icon, color = 'red', trendText }) => {
  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-400">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10`}>
          {Icon && <Icon className={`w-5 h-5 text-${color}-500`} />}
        </div>
      </div>
      <p className="text-4xl font-bold font-['Space_Grotesk']">{value}</p>
      {(change || trendText) && (
        <p className={`text-xs mt-2 ${change?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
          {change ? `${change.startsWith('-') ? '↓' : '↑'} ${change}` : trendText}
        </p>
      )}
    </motion.div>
  );
};

export default StatsCard;
