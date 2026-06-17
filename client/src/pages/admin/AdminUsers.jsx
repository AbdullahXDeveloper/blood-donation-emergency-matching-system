import { useState, useEffect } from 'react'
import { dashboardAPI } from '../../api'
import StatusBadge from '../../components/StatusBadge'
import { formatDateTime, getErrorMessage } from '../../utils'
import { FiUsers, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

const roles = ['donor','patient','hospital','admin']

export default function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [roleFilter])

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

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">All Users</h1>
          <p className="section-subtitle">{total} total users in the system</p>
        </div>
        <FiUsers size={28} className="text-gray-600" />
      </div>

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
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td className="font-medium text-white">{u.name}</td>
                  <td className="text-gray-400 text-xs">{u.email}</td>
                  <td><StatusBadge status={u.role} type="role" /></td>
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
    </div>
  )
}
