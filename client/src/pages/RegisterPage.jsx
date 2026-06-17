import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { FiDroplet, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils'

const roles = [
  { value: 'donor',       label: '🩸 Donor',       desc: 'I want to donate blood' },
  { value: 'patient',     label: '🤒 Patient',      desc: 'I need blood for a patient' },
  { value: 'hospital',    label: '🏥 Hospital',     desc: 'Manage hospital requests' },
  { value: 'coordinator', label: '🤝 Coordinator',  desc: 'Coordinate donations' },
]

const roleHome = { donor: '/donor', patient: '/patient', admin: '/admin', hospital: '/hospital', coordinator: '/admin' }

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20 }
}

export default function RegisterPage() {
  const [searchParams]             = useSearchParams()
  const [form, setForm]            = useState({
    name: '', email: '', password: '', role: searchParams.get('role') || 'donor', hospitalAffiliation: ''
  })
  const [showPass, setShowPass]    = useState(false)
  const [loading, setLoading]      = useState(false)
  const [pendingMsg, setPendingMsg] = useState('')
  const { register }               = useAuth()
  const navigate                   = useNavigate()

  const hasMinLength = form.password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const hasSymbol = /[^a-zA-Z0-9\s]/.test(form.password);
  const isNotEmpty = form.password.length > 0;

  const getRuleColor = (isValid) => {
    if (isValid) return 'text-green-500';
    return isNotEmpty ? 'text-red-500' : 'text-neutral-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (!/[a-zA-Z]/.test(form.password)) { toast.error('Password must contain at least one letter'); return }
    if (!/\d/.test(form.password)) { toast.error('Password must contain at least one number'); return }
    if (!/[^a-zA-Z0-9\s]/.test(form.password)) { toast.error('Password must contain at least one special character/symbol'); return }
    if (form.role === 'coordinator' && !form.hospitalAffiliation.trim()) {
      toast.error('Please enter the name of your hospital affiliation'); return
    }
    setLoading(true)
    try {
      const result = await register(form)
      // If result has pending=true, hospital/coordinator awaiting approval
      if (result?.pending) {
        setPendingMsg(result.message)
      } else {
        toast.success(`Account created! Welcome, ${result.name}!`)
        navigate(roleHome[result.role] || '/')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Show pending approval screen
  if (pendingMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="w-full max-w-md">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-10 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
              <FiClock size={32} className="text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3 font-['Space_Grotesk']">Pending Approval</h1>
            <p className="text-neutral-400 text-sm mb-6">{pendingMsg}</p>
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-left text-xs text-yellow-300 space-y-1 mb-6">
              {form.role === 'hospital' ? (
                <>
                  <p>✔ Your hospital account has been created.</p>
                  <p>✔ The Admin will review and approve your account.</p>
                  <p>✔ You can login once approved.</p>
                </>
              ) : (
                <>
                  <p>✔ Your coordinator account has been created.</p>
                  <p>✔ <strong>{form.hospitalAffiliation}</strong> hospital admins will review your request.</p>
                  <p>✔ You can login once approved.</p>
                </>
              )}
            </div>
            <Link to="/login" className="btn-primary w-full">Go to Login</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-800/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-lg relative z-10">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img src="/logo.png" alt="LifeLink Logo" className="w-14 h-14 object-contain" />
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
                  onClick={() => setForm(p => ({ ...p, role: r.value, hospitalAffiliation: '' }))}
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
            {/* Approval notice */}
            {(form.role === 'hospital' || form.role === 'coordinator') && (
              <div className="mt-3 flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-3 py-2">
                <FiClock size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-300">
                  {form.role === 'hospital'
                    ? 'Hospital accounts require Admin approval before you can login.'
                    : 'Coordinator accounts require Hospital approval before you can login.'}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input id="reg-name" type="text" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input pl-10"
                  placeholder={form.role === 'hospital' ? 'Official hospital name' : 'Your full name'} />
              </div>
              {form.role === 'hospital' && (
                <p className="text-xs text-neutral-500 mt-1">⚠ Use your official hospital name — this is used to match blood requests.</p>
              )}
            </div>

            {/* Hospital affiliation field for coordinators */}
            {form.role === 'coordinator' && (
              <div>
                <label className="input-label">Hospital Affiliation</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">🏥</span>
                  <input id="reg-hospital" type="text" required value={form.hospitalAffiliation}
                    onChange={e => setForm(p => ({ ...p, hospitalAffiliation: e.target.value }))}
                    className="input pl-9" placeholder="Name of your hospital" />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Must match the exact hospital name registered in the system.</p>
              </div>
            )}

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
                  minLength={8} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Password strength requirements */}
              <div className="mt-2 space-y-1.5 p-3 rounded-xl bg-neutral-900/50 border border-white/5">
                <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Password Requirements</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${getRuleColor(hasMinLength)}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Min 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${getRuleColor(hasLetter)}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>At least 1 letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${getRuleColor(hasNumber)}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>At least 1 number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${getRuleColor(hasSymbol)}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>At least 1 symbol</span>
                  </div>
                </div>
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
