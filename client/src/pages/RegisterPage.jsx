import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { FiDroplet, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils'

const roles = [
  { value: 'donor',    label: '🩸 Donor',    desc: 'I want to donate blood' },
  { value: 'patient',  label: '🏥 Patient',  desc: 'I need blood for a patient' },
  { value: 'admin',    label: '⚙️ Admin',    desc: 'System administrator' },
]

const roleHome = { donor: '/donor', patient: '/patient', admin: '/admin' }

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20 }
}

export default function RegisterPage() {
  const [searchParams]          = useSearchParams()
  const [form, setForm]         = useState({
    name: '', email: '', password: '', role: searchParams.get('role') || 'donor'
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { register }            = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Account created! Welcome, ${user.name}!`)
      navigate(roleHome[user.role] || '/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-800/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-lg relative z-10">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 glow-red-sm">
              <FiDroplet size={24} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white font-['Space_Grotesk']">Create Account</h1>
            <p className="text-neutral-400 text-sm mt-1">Join the LifeLink network</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="input-label mb-3 block">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button key={r.value} type="button"
                  onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.role === r.value
                      ? 'border-red-500 bg-red-500/10 text-white'
                      : 'border-white/5 bg-[#1a1a1a] text-neutral-400 hover:border-white/10 hover:text-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input id="reg-name" type="text" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input pl-10" placeholder="Your full name" />
              </div>
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input id="reg-email" type="email" required value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input id="reg-password" type={showPass ? 'text' : 'password'} required
                  minLength={6} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-red-500 hover:text-red-400 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
