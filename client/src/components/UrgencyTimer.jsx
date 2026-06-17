import { useState, useEffect } from 'react'
import { timeUntil } from '../utils'

const UrgencyTimer = ({ expiresAt, urgency }) => {
  const [timeLeft, setTimeLeft] = useState(timeUntil(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(timeUntil(expiresAt)), 60000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isExpired  = timeLeft === 'Expired'
  const isCritical = urgency === 'critical'

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
        Expired
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isCritical ? 'text-red-400 animate-pulse' : 'text-orange-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`} />
      {timeLeft} left
    </span>
  )
}

export default UrgencyTimer
