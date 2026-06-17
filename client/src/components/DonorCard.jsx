import BloodGroupBadge from './BloodGroupBadge'
import StatusBadge from './StatusBadge'
import { formatDate, isEligibleToDonate } from '../utils'
import { FiMapPin, FiPhone, FiActivity, FiCheck, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'

const DonorCard = ({ donor, match, showContact = false, actions }) => {
  if (!donor) return null
  const user = donor.userId || {}
  const eligible = isEligibleToDonate(donor.lastDonationDate)

  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm">{user.name?.charAt(0) || '?'}</span>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm font-['Space_Grotesk']">{user.name || 'Anonymous'}</h3>
            <p className="text-xs text-neutral-500">{donor.area}, {donor.city}</p>
          </div>
        </div>
        <BloodGroupBadge group={donor.bloodGroup} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-[#1a1a1a] border border-white/5">
          <div className="text-lg font-bold text-white font-['Space_Grotesk']">{donor.totalDonations}</div>
          <div className="text-xs text-neutral-500">Donations</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#1a1a1a] border border-white/5">
          <div className={`text-sm font-semibold ${donor.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
            {donor.isAvailable ? '✓ On' : '✗ Off'}
          </div>
          <div className="text-xs text-neutral-500">Available</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#1a1a1a] border border-white/5">
          <div className={`text-sm font-semibold ${eligible ? 'text-green-400' : 'text-orange-400'}`}>
            {eligible ? '✓' : '✗'}
          </div>
          <div className="text-xs text-neutral-500">Eligible</div>
        </div>
      </div>

      {/* Contact — only shown if revealed */}
      {showContact ? (
        <div className="space-y-1.5 mb-3">
          {donor.phone && (
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <FiPhone size={11} className="text-green-500" />
              <span>{donor.phone}</span>
            </div>
          )}
          {user.email && (
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <FiActivity size={11} className="text-blue-500" />
              <span>{user.email}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
          <FiX size={11} />
          Contact hidden until donor accepts
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
        <span>Last donation: {formatDate(donor.lastDonationDate)}</span>
        {match && <StatusBadge status={match.status} />}
      </div>

      {/* Actions */}
      {actions && <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">{actions}</div>}
    </motion.div>
  )
}

export default DonorCard
