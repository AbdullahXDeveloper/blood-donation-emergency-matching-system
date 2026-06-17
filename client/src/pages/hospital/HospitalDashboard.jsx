import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const HospitalDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="section-title">Hospital Dashboard</h1>
          <p className="section-subtitle">Welcome, {user?.name}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/hospital/requests" className="card group cursor-pointer block">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
              Manage Requests
            </h3>
          </div>
          <p className="text-neutral-400 text-sm">
            Verify pending blood requests for your hospital and trigger matching.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default HospitalDashboard;
