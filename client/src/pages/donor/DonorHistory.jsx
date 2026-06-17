import { useState, useEffect } from 'react'
import { donorAPI } from '../../api'
import BloodGroupBadge from '../../components/BloodGroupBadge'
import { formatDate, getErrorMessage } from '../../utils'
import { FiInbox, FiDroplet } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function DonorHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    donorAPI.getHistory()
      .then(({ data }) => setHistory(data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-dark-600 border-t-blood-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="page-container">
      <h1 className="section-title">Donation History</h1>
      <p className="section-subtitle">Your completed blood donations</p>

      {/* Stats bar */}
      <div className="card mb-6 flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blood-900/50 flex items-center justify-center">
            <FiDroplet size={18} className="text-blood-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{history.length}</div>
            <div className="text-xs text-gray-400">Total Donations</div>
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">
            {history.reduce((sum, h) => sum + h.units, 0)}
          </div>
          <div className="text-xs text-gray-400">Units Donated</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-16">
          <FiInbox size={40} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No donation history yet</p>
          <p className="text-gray-600 text-sm mt-1">Accept match requests to build your history</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Blood Group</th>
                <th>Hospital</th>
                <th>Units</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h._id}>
                  <td className="font-medium text-white">{h.requestId?.patientName || '—'}</td>
                  <td><BloodGroupBadge group={h.requestId?.bloodGroup} /></td>
                  <td className="text-gray-400">{h.hospitalName}</td>
                  <td><span className="badge bg-blood-900/40 border-blood-800/40 text-blood-300">{h.units}</span></td>
                  <td className="text-gray-500 text-xs">{formatDate(h.donatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
