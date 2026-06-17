import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI, requestAPI } from '../../api'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import BloodGroupBadge from '../../components/BloodGroupBadge'
import { getErrorMessage, formatDate } from '../../utils'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  FiUsers, FiDroplet, FiActivity, FiClock, FiArrowRight, FiCheckCircle
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="text-neutral-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-bold text-white">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [recentReqs, setReqs] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      requestAPI.getAll({ limit: 5 }), // recent all
      requestAPI.getAll({ status: 'pending', limit: 5 }) // pending queue
    ])
      .then(([statsRes, reqsRes, pendingRes]) => {
        setStats(statsRes.data)
        setReqs(reqsRes.data.requests || [])
        setPending(pendingRes.data.requests || [])
      })
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
    </div>
  )

  const requestsOverTime = stats?.charts?.requestsOverTime?.map(d => ({
    date: d._id, requests: d.count
  })) || []

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-white">System Overview</h1>
          <p className="text-sm text-neutral-400 mt-1">Admin Dashboard & Metrics</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/users"    className="btn-secondary text-sm px-4 py-2">Manage Users</Link>
          <Link to="/admin/requests" className="btn-primary text-sm px-4 py-2">All Requests</Link>
        </div>
      </div>

      {/* Top row: 4 stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={FiUsers}    label="Total Donors"         value={stats.donors.total}           color="red" />
          <StatsCard icon={FiActivity} label="Active Requests"      value={stats.requests.matching + stats.requests.pending} color="orange" />
          <StatsCard icon={FiDroplet}  label="Fulfilled Today"      value={stats.requests.fulfilledToday} color="green" trendText={`Total: ${stats.requests.fulfilled}`} />
          <StatsCard icon={FiClock}    label="Pending Verification" value={stats.requests.pending}       color="yellow" />
        </div>
      )}

      {/* Middle: AreaChart */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white">Requests Over Time (Last 7 Days)</h2>
        </div>
        {requestsOverTime.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-neutral-600 text-sm">No data available</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestsOverTime}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom split */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Bottom Left: Recent requests table */}
        <div className="card !p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white">Recent Requests</h2>
            <Link to="/admin/requests" className="text-sm text-red-500 hover:text-red-400 font-medium flex items-center gap-1">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReqs.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-neutral-600">No recent requests</td></tr>
                ) : recentReqs.map(req => (
                  <tr key={req._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-neutral-300">
                      <div className="font-medium text-white">{req.patientName}</div>
                      <div className="text-xs text-neutral-500">{req.hospital}</div>
                    </td>
                    <td className="px-6 py-4"><BloodGroupBadge group={req.bloodGroup} /></td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/requests/${req._id}`} className="text-sm text-blue-400 hover:text-blue-300">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Right: Pending Verification Queue */}
        <div className="card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Pending Verification ({pending.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {pending.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <FiCheckCircle size={32} className="text-green-500 mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">All Caught Up!</h3>
                <p className="text-neutral-500 text-xs">No pending requests.</p>
              </div>
            ) : pending.map(req => (
              <div key={req._id} className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-red-500/30 transition-all flex justify-between items-center">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {req.patientName} <BloodGroupBadge group={req.bloodGroup} />
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">{req.hospital}</div>
                </div>
                <Link to={`/admin/requests/${req._id}`} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1">
                  Verify <FiArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
