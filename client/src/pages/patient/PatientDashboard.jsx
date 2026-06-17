import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { requestAPI } from '../../api'
import RequestCard from '../../components/RequestCard'
import { getErrorMessage } from '../../utils'
import { FiPlus, FiInbox, FiActivity, FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

export default function PatientDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    requestAPI.getMy()
      .then(({ data }) => setRequests(data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return
    try {
      await requestAPI.cancel(id)
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r))
      toast.success('Request cancelled')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const active    = requests.filter(r => ['pending','verified','matching'].includes(r.status))
  const fulfilled = requests.filter(r => r.status === 'fulfilled')
  const closed    = requests.filter(r => ['expired','cancelled'].includes(r.status))

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="page-container">
      {/* Big centered CTA card */}
      <div className="card text-center py-16 px-6 flex flex-col items-center justify-center mb-12 border-dashed border-2 border-red-500/20 bg-red-500/5">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
          <FiActivity className="text-red-500 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-white mb-2">Need Blood?</h2>
        <p className="text-neutral-400 max-w-md mx-auto mb-8">
          Submit an emergency blood request. Our matching engine will instantly connect you with verified donors in your city.
        </p>
        <Link to="/patient/new-request" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto">
          Request Now <FiArrowRight className="ml-2" />
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-white">My Requests</h1>
          <p className="text-sm text-neutral-400 mt-1">Track the status of your emergency requests</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FiInbox size={48} className="text-neutral-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white mb-2">No Requests Found</h2>
          <p className="text-neutral-500 text-sm">You haven't made any blood requests yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                Active Requests
              </h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {active.map(req => (
                  <RequestCard key={req._id} request={req}
                    actions={
                      ['pending','verified'].includes(req.status) && (
                        <button onClick={() => handleCancel(req._id)} className="px-4 py-2 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 text-red-400 text-xs font-semibold rounded-lg transition-all">
                          Cancel Request
                        </button>
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}
          
          {fulfilled.length > 0 && (
            <div>
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white mb-4">Fulfilled</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {fulfilled.map(req => <RequestCard key={req._id} request={req} />)}
              </div>
            </div>
          )}
          
          {closed.length > 0 && (
            <div>
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-neutral-500 mb-4">Closed / Expired</h2>
              <div className="grid lg:grid-cols-2 gap-6 opacity-60">
                {closed.map(req => <RequestCard key={req._id} request={req} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
