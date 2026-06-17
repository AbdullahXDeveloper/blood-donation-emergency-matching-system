import BloodGroupBadge from './BloodGroupBadge'
import StatusBadge from './StatusBadge'
import UrgencyTimer from './UrgencyTimer'
import { formatDate } from '../utils'
import { FiMapPin, FiDroplet, FiClock } from 'react-icons/fi'
import { motion } from 'framer-motion'

const RequestCard = ({ request, actions, showCreator = false }) => {
  if (!request) return null

  const urgencyBorder = {
    critical: 'border-red-500/50 shadow-red-500/20',
    urgent:   'border-orange-500/50 shadow-orange-500/20',
    normal:   'border-white/5 shadow-transparent',
  }

  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }}
      className={`card ${urgencyBorder[request.urgency] || 'border-white/5'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <BloodGroupBadge group={request.bloodGroup} />
          <div>
            <h3 className="font-bold text-white text-base leading-tight font-['Space_Grotesk']">{request.patientName}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{request.hospital}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={request.status} />
          <StatusBadge status={request.urgency} />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <FiMapPin size={12} className="text-neutral-500 shrink-0" />
          <span>{request.city}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <FiDroplet size={12} className="text-red-500 shrink-0" />
          <span>{request.unitsRequired} unit{request.unitsRequired > 1 ? 's' : ''} needed</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <FiClock size={12} className="text-neutral-500 shrink-0" />
          <span>{formatDate(request.createdAt)}</span>
        </div>
        <UrgencyTimer expiresAt={request.expiresAt} urgency={request.urgency} />
      </div>

      {request.additionalNotes && (
        <p className="text-xs text-neutral-500 italic mb-4 border-l-2 border-neutral-800 pl-3">
          {request.additionalNotes}
        </p>
      )}

      {showCreator && request.createdBy && (
        <p className="text-xs text-neutral-500 mb-3">
          By: <span className="text-neutral-400">{request.createdBy.name}</span>
        </p>
      )}

      {/* Actions */}
      {actions && <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-white/5">{actions}</div>}
    </motion.div>
  )
}

export default RequestCard
