import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { requestAPI } from '../../api'
import BloodGroupBadge from '../../components/BloodGroupBadge'
import StatusBadge from '../../components/StatusBadge'
import { formatDate, getErrorMessage } from '../../utils'
import { FiFilter, FiInbox, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const statuses    = ['pending','verified','matching','fulfilled','expired','cancelled']

export default function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [filters, setFilters]   = useState({ status: '', bloodGroup: '' })
  const [city, setCity]         = useState('')

  useEffect(() => { fetchRequests() }, [filters])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data } = await requestAPI.getAll({ ...filters, city: city || undefined, limit: 100 })
      setRequests(data.requests)
      setTotal(data.total)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async (id, status) => {
    try {
      await requestAPI.close(id, { status })
      toast.success(`Request marked as ${status}`)
      fetchRequests()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">All Blood Requests</h1>
          <p className="section-subtitle">{total} total requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiFilter size={14} />
        </div>
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
          className="select text-sm w-auto px-3 py-2">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.bloodGroup} onChange={e => setFilters(p => ({ ...p, bloodGroup: e.target.value }))}
          className="select text-sm w-auto px-3 py-2">
          <option value="">All Blood Groups</option>
          {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="relative">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Filter by city..." value={city}
            onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchRequests()}
            className="input pl-8 text-sm py-2 w-40" />
        </div>
        <button onClick={() => { setFilters({ status: '', bloodGroup: '' }); setCity('') }} className="btn-ghost text-sm">Clear</button>
        <button onClick={fetchRequests} className="btn-secondary text-sm">Search</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-dark-600 border-t-blood-600 rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-16">
          <FiInbox size={40} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No requests match this filter</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Blood Group</th>
                <th>Hospital / City</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td className="font-medium text-white text-sm">{req.patientName}</td>
                  <td><BloodGroupBadge group={req.bloodGroup} /></td>
                  <td className="text-gray-400 text-xs">
                    <div>{req.hospital}</div>
                    <div className="text-gray-600">{req.city}</div>
                  </td>
                  <td><StatusBadge status={req.urgency} type="urgency" /></td>
                  <td><StatusBadge status={req.status} /></td>
                  <td className="text-gray-500 text-xs">{formatDate(req.createdAt)}</td>
                  <td>
                    <div className="flex gap-1">
                      <Link to={`/admin/requests/${req._id}`} className="btn-ghost text-xs px-2 py-1">Detail</Link>
                      {!['fulfilled','expired','cancelled'].includes(req.status) && (
                        <>
                          <button onClick={() => handleClose(req._id, 'fulfilled')}
                            className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-800/30 hover:bg-green-900/50 transition-all">
                            ✓ Fulfill
                          </button>
                          <button onClick={() => handleClose(req._id, 'expired')}
                            className="text-xs px-2 py-1 rounded bg-dark-700 text-gray-500 border border-white/5 hover:text-gray-300 transition-all">
                            Expire
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
