import React, { useEffect, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBadge = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'donor') return;

    const fetchMatches = async () => {
      try {
        const res = await api.get('/donors/requests');
        // Only show 'contacted' (unread) requests as notifications
        const contacted = res.data.filter(m => m.status === 'contacted');
        setNotifications(contacted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  if (user?.role !== 'donor') return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-neutral-400 hover:text-white transition-colors relative"
      >
        <FiBell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#0d0d0d]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#161616]">
              <h3 className="font-semibold text-white">Notifications</h3>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                {notifications.length} New
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-neutral-500">
                  No new notifications
                </div>
              ) : (
                notifications.map(notif => (
                  <Link
                    key={notif._id}
                    to="/donor/requests"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <p className="text-sm font-medium text-white mb-1">
                      Emergency Blood Request
                    </p>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      Urgent need for {notif.requestId.bloodGroup} blood at {notif.requestId.hospital}.
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-2">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;
