import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { requestAPI, matchAPI } from '../../api'
import RequestCard from '../../components/RequestCard'
import DonorCard from '../../components/DonorCard'
import { getErrorMessage } from '../../utils'
import { FiCheckCircle, FiZap, FiArrowLeft, FiXCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const matchStatuses = ['contacted','committed','donated','declined','no-show']

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

export default function RequestDetail() {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const [request, setReq]   = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    try {
      const [{ data: req }, matchRes] = await Promise.all([
        requestAPI.getOne(id),
        requestAPI.getOne(id).then(() => matchAPI.getMatches(id)).catch(() => ({ data: [] })),
      ])
      setReq(req)
      setMatches(matchRes.data || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    try {
      const { data } = await requestAPI.verify(id)
      setReq(data.request)
      toast.success('Request verified!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleReject = async () => {
    if (!window.confirm('Reject this request?')) return
    try {
      await requestAPI.cancel(id)
      setReq(prev => ({ ...prev, status: 'cancelled' }))
      toast.success('Request rejected')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleTriggerMatch = async () => {
    setTriggering(true)
    try {
      const { data } = await matchAPI.trigger(id)
      toast.success(data.message)
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setTriggering(false)
    }
  }

  const handleMatchStatus = async (matchId, status) => {
    try {
      await matchAPI.updateStatus(matchId, { status })
      toast.success(`Match status updated to ${status}`)
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
    </div>
  )

  if (!request) return <div className="page-container text-center py-20 text-neutral-500">Request not found</div>

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="page-container">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 text-sm transition-colors">
        <FiArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="grid xl:grid-cols-3 gap-8">
        {/* Request details */}
        <div className="xl:col-span-1">
          <h2 className="text-xl font-bold text-white mb-4 font-['Space_Grotesk']">Request Details</h2>
          <RequestCard request={request} showCreator
            actions={
              <div className="flex flex-col gap-3 w-full">
                {request.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button onClick={handleVerify} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold flex justify-center items-center gap-2 rounded-xl transition-all">
                      <FiCheckCircle size={16} /> Verify
                    </button>
                    <button onClick={handleReject} className="px-4 py-2 bg-transparent border border-red-500/50 hover:bg-red-500/10 text-red-500 font-semibold flex justify-center items-center gap-2 rounded-xl transition-all">
                      <FiXCircle size={16} /> Reject
                    </button>
                  </div>
                )}
                {request.status === 'verified' && (
                  <button onClick={handleTriggerMatch} disabled={triggering}
                    className="btn-primary w-full text-sm py-4">
                    {triggering
                      ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      : <><FiZap size={16} /> Run Matching Engine</>
                    }
                  </button>
                )}
                {request.status === 'matching' && (
                  <button onClick={handleTriggerMatch} disabled={triggering}
                    className="btn-secondary w-full text-sm">
                    {triggering
                      ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      : <><FiZap size={16} /> Re-run Matching</>
                    }
                  </button>
                )}
              </div>
            }
          />
        </div>

        {/* Matched donors */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Matched Donors <span className="text-neutral-500 text-sm font-normal ml-2">({matches.length})</span>
            </h2>
          </div>

          {matches.length === 0 ? (
            <div className="card text-center py-16 flex flex-col items-center justify-center border-dashed border-2 border-white/5 bg-transparent">
              <FiZap size={32} className="text-neutral-700 mb-4" />
              <p className="text-neutral-400 font-['Space_Grotesk'] font-bold text-lg">
                {request.status === 'verified'
                  ? 'Click "Run Matching Engine" to find eligible donors'
                  : 'No donors matched yet'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {matches.map(match => (
                <DonorCard
                  key={match._id}
                  donor={match.donorId}
                  match={match}
                  showContact={match.status === 'committed' || match.status === 'donated'}
                  actions={
                    <div className="flex flex-col gap-2 w-full pt-2">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Update Match Status:</span>
                      <div className="flex flex-wrap gap-2">
                        {matchStatuses.map(s => (
                          <button key={s}
                            onClick={() => handleMatchStatus(match._id, s)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              match.status === s
                                ? 'bg-red-500/20 border-red-500 text-red-400 font-bold shadow-[0_0_10px_rgba(220,38,38,0.2)]'
                                : 'bg-[#1a1a1a] border-white/5 text-neutral-400 hover:text-white hover:border-white/20'
                            }`}
                          >{s}</button>
                        ))}
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
