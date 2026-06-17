import { useState, useEffect } from 'react'
import { dashboardAPI } from '../../api'
import StatusBadge from '../../components/StatusBadge'
import { formatDateTime, getErrorMessage } from '../../utils'
import { FiUsers, FiSearch, FiClock, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const roles = ['donor', 'patient', 'hospital', 'coordinator', 'admin']

export default function AdminUsers() {
  const [users, setUsers]       = useState([])
  const [total, setTotal]       = useState(0)
  const [pending, setPending]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch]     = useState('')
  const [tab, setTab]           = useState('all') // 'all' | 'pending'

  useEffect(() => { fetchUsers() }, [roleFilter])
  useEffect(() => { fetchPending() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await dashboardAPI.getUsers({ role: roleFilter, limit: 100 })
      setUsers(data.users)
      setTotal(data.total)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const fetchPending = async () => {
    setPendingLoading(true)
    try {
      const { data } = await dashboardAPI.getPending()
      setPending(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setPendingLoading(false)
    }
  }

  const handleApprove = async (id, name, action) => {
    const verb = action === 'approve' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${verb} ${name}?`)) return
    try {
      const { data } = await dashboardAPI.approveUser(id, action)
      toast.success(data.message)
      fetchPending()
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">{total} total users in the system</p>
        </div>
        <FiUsers size={28} className="text-gray-600" />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'all' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'btn-ghost'
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'btn-ghost'
          }`}
        >
          <FiClock size={14} />
          Pending Approvals
          {pending.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center">
              {pending.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'pending' ? (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {pendingLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-neutral-700 border-t-yellow-500 rounded-full animate-spin" />
              </div>
            ) : pending.length === 0 ? (
              <div className="card text-center py-16">
                <FiCheck size={36} className="text-green-500 mx-auto mb-3" />
                <p className="text-white font-semibold">All caught up!</p>
                <p className="text-neutral-500 text-sm mt-1">No pending hospital approvals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(u => (
                  <div key={u._id} className="card border-yellow-900/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-bold text-yellow-400 uppercase shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{u.name}</p>
                        <p className="text-neutral-500 text-xs">{u.email}</p>
                        <p className="text-yellow-400/70 text-[11px] mt-0.5">
                          🏥 Role: {u.role} · Registered: {formatDateTime(u.createdAt)}
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
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Search name or email..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="input pl-9 text-sm" />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="select text-sm w-auto px-3">
                <option value="">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={() => { setRoleFilter(''); setSearch('') }} className="btn-ghost text-sm">Clear</button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-dark-600 border-t-blood-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u._id}>
                        <td className="font-medium text-white">{u.name}</td>
                        <td className="text-gray-400 text-xs">{u.email}</td>
                        <td><StatusBadge status={u.role} type="role" /></td>
                        <td>
                          {u.isApproved
                            ? <span className="badge border-green-500/30 text-green-400 bg-green-500/10">Active</span>
                            : <span className="badge border-yellow-500/30 text-yellow-400 bg-yellow-500/10">Pending</span>
                          }
                        </td>
                        <td className="text-gray-500 text-xs">{formatDateTime(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-10 text-gray-500 text-sm">No users match this filter</div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
