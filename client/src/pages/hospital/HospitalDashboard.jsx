import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../api';
import { FiFileText, FiUsers, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { formatDateTime, getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.getPending();
      setPending(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, name, action) => {
    const verb = action === 'approve' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${verb} ${name}?`)) return;
    try {
      const { data } = await dashboardAPI.approveUser(id, action);
      toast.success(data.message);
      fetchPending();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="section-title">Hospital Dashboard</h1>
          <p className="section-subtitle">Welcome, {user?.name}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/hospital/requests" className="card group cursor-pointer block">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <FiFileText size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">Manage Requests</h3>
              <p className="text-neutral-400 text-sm">Verify pending blood requests for your hospital.</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <FiUsers size={20} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pending Coordinators</h3>
              <p className="text-neutral-400 text-sm">{pending.length} awaiting your approval.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Coordinator Approvals */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiClock size={16} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Pending Coordinator Approvals</h2>
          {pending.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center">
              {pending.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-neutral-700 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div className="card text-center py-12">
            <FiCheck size={32} className="text-green-500 mx-auto mb-3" />
            <p className="text-white font-semibold">All caught up!</p>
            <p className="text-neutral-500 text-sm mt-1">No pending coordinator applications for your hospital.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(u => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-yellow-900/30 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-bold text-yellow-400 uppercase shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{u.name}</p>
                    <p className="text-neutral-500 text-xs">{u.email}</p>
                    <p className="text-yellow-400/60 text-[11px] mt-0.5">
                      Applied: {formatDateTime(u.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(u._id, u.name, 'approve')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    <FiCheck size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleApprove(u._id, u.name, 'reject')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-700/60 hover:bg-red-600 border border-red-600/40 text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    <FiX size={13} /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
