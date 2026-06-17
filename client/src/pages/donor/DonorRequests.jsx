import { useState, useEffect } from 'react'
import { donorAPI } from '../../api'
import DonorCard from '../../components/DonorCard'
import { getErrorMessage } from '../../utils'
import { FiInbox } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function DonorRequests() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMatches() }, [])

  const fetchMatches = async () => {
    try {
      const { data } = await donorAPI.getRequests()
      setMatches(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (matchId, status) => {
    try {
      await donorAPI.respond(matchId, { status })
      toast.success(status === 'committed' ? '✅ You accepted this request! Contact details revealed.' : 'Request declined.')
      fetchMatches()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-dark-600 border-t-blood-600 rounded-full animate-spin" />
    </div>
  )

  const pending   = matches.filter(m => m.status === 'contacted')
  const responded = matches.filter(m => m.status !== 'contacted')

  return (
    <div className="page-container">
      <h1 className="section-title">Match Requests</h1>
      <p className="section-subtitle">Blood requests you've been matched with</p>

      {matches.length === 0 ? (
        <div className="card text-center py-16">
          <FiInbox size={40} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No match requests yet</p>
          <p className="text-gray-600 text-sm mt-1">Make sure your profile is set to Available</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending responses */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse inline-block" />
                Awaiting Your Response ({pending.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pending.map(match => {
                  const req = match.requestId
                  return (
                    <div key={match._id} className="card border border-yellow-900/40">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white">{req?.patientName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            req?.urgency === 'critical' ? 'bg-red-900/50 text-red-400' :
                            req?.urgency === 'urgent'   ? 'bg-orange-900/50 text-orange-400' :
                                                          'bg-green-900/40 text-green-400'
                          }`}>{req?.urgency?.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-400">{req?.hospital} — {req?.city}</p>
                        <p className="text-xs text-gray-500 mt-1">Blood Group: <strong className="text-white">{req?.bloodGroup}</strong> — {req?.unitsRequired} unit(s)</p>
                        {req?.additionalNotes && (
                          <p className="text-xs text-gray-600 italic mt-2 border-l-2 border-dark-600 pl-2">{req.additionalNotes}</p>
                        )}
                      </div>
                      <div className="bg-dark-700/40 rounded-lg p-3 mb-4 text-xs text-gray-500">
                        🔒 Contact details will be revealed after you accept
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRespond(match._id, 'committed')}
                          className="btn-success flex-1 justify-center text-sm">
                          ✓ Accept & Donate
                        </button>
                        <button onClick={() => handleRespond(match._id, 'declined')}
                          className="btn-danger flex-1 justify-center text-sm">
                          ✗ Decline
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Responded */}
          {responded.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Previous Responses ({responded.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {responded.map(match => {
                  const req = match.requestId
                  const showContact = match.status === 'committed' || match.status === 'donated'
                  return (
                    <div key={match._id} className={`card border ${showContact ? 'border-green-900/40' : 'border-dark-600'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-bold text-white">{req?.patientName}</p>
                          <p className="text-xs text-gray-500">{req?.hospital}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          match.status === 'committed' ? 'bg-green-900/50 text-green-400' :
                          match.status === 'donated'   ? 'bg-emerald-900/50 text-emerald-400' :
                                                         'bg-red-900/50 text-red-400'
                        }`}>{match.status}</span>
                      </div>
                      {showContact && req?.createdBy && (
                        <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-xs">
                          <p className="text-green-400 font-semibold mb-1">✓ Contact Revealed</p>
                          <p className="text-gray-300">Contact the hospital at: <strong>{req.hospital}</strong></p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
