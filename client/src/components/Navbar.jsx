import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLogOut, FiDroplet, FiUser, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'

const roleHome = { donor: '/donor', patient: '/patient', hospital: '/hospital', admin: '/admin' }

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  // If user is logged in and not on Landing Page, we will hide the Navbar on desktop and use Sidebar instead.
  // But for now, we'll keep it as a top nav for mobile or Landing page.
  // Actually, per prompt, the Navbar is for the landing page or when not in dashboard. Dashboard uses Sidebar.
  const isDashboard = user !== null && location.pathname !== '/'

  if (isDashboard) {
    return null; // Will be handled by Dashboard layout/sidebar (created per page or via a layout component)
  }

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="LifeLink Logo" className="w-10 h-10 object-contain" />
          <span className="font-['Space_Grotesk'] font-bold text-2xl text-white">LifeLink</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">How it Works</a>
          <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Donate</Link>
          <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Request</Link>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="btn-secondary text-sm px-6 py-2.5">Login</Link>
              <Link to="/register" className="btn-primary text-sm px-6 py-2.5">Register</Link>
            </>
          ) : (
            <Link to={roleHome[user.role]} className="btn-primary text-sm px-6 py-2.5">Go to Dashboard</Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-neutral-400 hover:text-white">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0d0d0d] px-6 py-4 space-y-4"
          >
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-neutral-400 hover:text-white">How it Works</a>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-neutral-400 hover:text-white">Donate</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-neutral-400 hover:text-white">Request</Link>
            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
              {!user ? (
                <>
                  <Link to="/login" className="btn-secondary text-sm w-full justify-center">Login</Link>
                  <Link to="/register" className="btn-primary text-sm w-full justify-center">Register</Link>
                </>
              ) : (
                <Link to={roleHome[user.role]} className="btn-primary text-sm w-full justify-center">Go to Dashboard</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
