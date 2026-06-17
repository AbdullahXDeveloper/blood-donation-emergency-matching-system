import { Link } from 'react-router-dom'
import { FiShield } from 'react-icons/fi'

export default function Unauthorized() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="text-center">
        <FiShield size={48} className="text-blood-700 mx-auto mb-4" />
        <h1 className="text-3xl font-black text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-8">You don't have permission to view this page.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  )
}
