import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiDroplet, FiLogOut, FiMenu, FiX, FiUsers, FiActivity, FiClock, FiInbox, FiHome, FiFileText, FiPlusSquare } from 'react-icons/fi'
import { useState } from 'react'

const roleLinks = {
  donor: [
    { to: '/donor', label: 'Dashboard', icon: FiHome },
    { to: '/donor/requests', label: 'My Matches', icon: FiInbox },
    { to: '/donor/history', label: 'History', icon: FiClock }
  ],
  patient: [
    { to: '/patient', label: 'Dashboard', icon: FiHome },
    { to: '/patient/new-request', label: 'New Request', icon: FiPlusSquare }
  ],
  hospital: [
    { to: '/hospital', label: 'Dashboard', icon: FiHome },
    { to: '/hospital/requests', label: 'All Requests', icon: FiFileText }
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: FiHome },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/requests', label: 'Requests', icon: FiActivity }
  ],
}

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const links = user ? roleLinks[user.role] : []

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f5] flex">
      {/* Mobile Header (replaces sidebar on mobile) */}
      <div className="md:hidden fixed top-0 w-full h-16 border-b border-white/5 bg-[#0d0d0d] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <FiDroplet className="text-red-500" size={20} />
          <span className="font-['Space_Grotesk'] font-bold text-lg">LifeLink</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-neutral-400">
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop fixed, Mobile sliding drawer) */}
      <aside className={`fixed top-0 left-0 h-screen w-60 bg-[#0d0d0d] border-r border-white/5 flex flex-col p-4 z-40 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo area */}
        <div className="hidden md:flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <FiDroplet className="text-red-500" size={16} />
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-xl text-white">LifeLink</span>
        </div>

        {/* Mobile top spacer */}
        <div className="h-16 md:hidden"></div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {links.map(l => (
            <NavLink 
              key={l.to} 
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[inset_2px_0_0_0_#ef4444]' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'
                }
              `}
              end={l.to === `/${user?.role}`} // exact match for dashboard home
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        {user && (
          <div className="pt-4 border-t border-white/5 mt-auto">
            <div className="px-4 py-3 bg-[#111] border border-white/5 rounded-xl mb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white uppercase shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-neutral-500 capitalize truncate">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  )
}

export default DashboardLayout
