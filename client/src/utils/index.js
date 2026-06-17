// Blood compatibility helper (mirrors server-side)
export const compatibility = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
}

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const bloodGroupColors = {
  'A+':  'bg-red-900/50 text-red-300 border-red-700/50',
  'A-':  'bg-rose-900/50 text-rose-300 border-rose-700/50',
  'B+':  'bg-orange-900/50 text-orange-300 border-orange-700/50',
  'B-':  'bg-amber-900/50 text-amber-300 border-amber-700/50',
  'AB+': 'bg-purple-900/50 text-purple-300 border-purple-700/50',
  'AB-': 'bg-violet-900/50 text-violet-300 border-violet-700/50',
  'O+':  'bg-blue-900/50 text-blue-300 border-blue-700/50',
  'O-':  'bg-cyan-900/50 text-cyan-300 border-cyan-700/50',
}

export const statusColors = {
  pending:    'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  verified:   'bg-blue-900/40 text-blue-300 border-blue-700/40',
  matching:   'bg-purple-900/40 text-purple-300 border-purple-700/40',
  fulfilled:  'bg-green-900/40 text-green-300 border-green-700/40',
  expired:    'bg-gray-800/60 text-gray-400 border-gray-700/40',
  cancelled:  'bg-red-950/60 text-red-400 border-red-900/40',
}

export const urgencyColors = {
  critical: 'bg-red-900/50 text-red-300 border-red-700/50',
  urgent:   'bg-orange-900/50 text-orange-300 border-orange-700/50',
  normal:   'bg-green-900/40 text-green-300 border-green-700/40',
}

export const matchStatusColors = {
  contacted: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  committed: 'bg-green-900/40 text-green-300 border-green-700/40',
  donated:   'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  declined:  'bg-red-900/40 text-red-400 border-red-700/40',
  'no-show': 'bg-gray-800/60 text-gray-400 border-gray-700/40',
}

export const roleColors = {
  admin:    'bg-purple-900/40 text-purple-300 border-purple-700/40',
  hospital: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  donor:    'bg-red-900/40 text-red-300 border-red-700/40',
  patient:  'bg-orange-900/40 text-orange-300 border-orange-700/40',
}

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const timeAgo = (date) => {
  if (!date) return ''
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60)  return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`
  return `${Math.floor(seconds/86400)}d ago`
}

export const timeUntil = (date) => {
  if (!date) return ''
  const diff = new Date(date) - new Date()
  if (diff <= 0) return 'Expired'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h/24)}d ${h%24}h`
  return `${h}h ${m}m`
}

export const DONATION_COOLDOWN_DAYS = 56

export const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - DONATION_COOLDOWN_DAYS)
  return new Date(lastDonationDate) < cutoff
}

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong'
}
