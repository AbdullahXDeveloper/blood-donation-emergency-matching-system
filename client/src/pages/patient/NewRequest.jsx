import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestAPI } from '../../api'
import { motion } from 'framer-motion'
import { FiDroplet, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils'

const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

const urgencyInfo = {
  critical: { label: '🔴 Critical',  desc: 'Life-threatening, needed within hours', color: 'border-red-700 bg-red-900/30 text-red-300' },
  urgent:   { label: '🟠 Urgent',    desc: 'Needed within 24-48 hours',             color: 'border-orange-700 bg-orange-900/30 text-orange-300' },
  normal:   { label: '🟢 Normal',    desc: 'Can wait 2-3 days',                     color: 'border-green-700 bg-green-900/30 text-green-300' },
}

export default function NewRequest() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    patientName: '', bloodGroup: '', unitsRequired: 1,
    hospital: '', city: '', urgency: 'urgent', additionalNotes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await requestAPI.create(form)
      toast.success('Blood request submitted! Hospital will verify shortly.')
      navigate('/patient')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">🩸 New Blood Request</h1>
        <p className="section-subtitle">Fill in all details accurately — this information helps find the right donor.</p>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient name */}
            <div>
              <label className="input-label">Patient Name *</label>
              <input id="req-patient" type="text" required value={form.patientName}
                onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))}
                className="input" placeholder="Full name of patient" />
            </div>

            {/* Blood Group + Units */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Blood Group Needed *</label>
                <select id="req-bloodgroup" value={form.bloodGroup}
                  onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}
                  className="select" required>
                  <option value="">Select blood group</option>
                  {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Units Required *</label>
                <input id="req-units" type="number" min={1} max={20} required
                  value={form.unitsRequired}
                  onChange={e => setForm(p => ({ ...p, unitsRequired: parseInt(e.target.value) }))}
                  className="input" />
              </div>
            </div>

            {/* Hospital + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Hospital Name *</label>
                <input id="req-hospital" type="text" required value={form.hospital}
                  onChange={e => setForm(p => ({ ...p, hospital: e.target.value }))}
                  className="input" placeholder="e.g. Aga Khan Hospital" />
              </div>
              <div>
                <label className="input-label">City *</label>
                <input id="req-city" type="text" required value={form.city}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  className="input" placeholder="e.g. Karachi" />
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="input-label mb-3 block">Urgency Level *</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(urgencyInfo).map(([val, info]) => (
                  <button key={val} type="button"
                    onClick={() => setForm(p => ({ ...p, urgency: val }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.urgency === val ? info.color : 'border-white/5 bg-dark-700/50 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    <div className="text-sm font-semibold">{info.label}</div>
                    <div className="text-xs mt-1 opacity-70">{info.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="input-label">Additional Notes</label>
              <textarea id="req-notes" rows={3} value={form.additionalNotes}
                onChange={e => setForm(p => ({ ...p, additionalNotes: e.target.value }))}
                className="input resize-none"
                placeholder="Any additional context (e.g. surgery type, urgency reason)..." />
            </div>

            {/* Warning box */}
            <div className="bg-blood-950/40 border border-blood-900/40 rounded-xl p-4 text-sm text-red-300">
              ⚠️ Submitting false requests is a violation of our policy. Hospital staff will verify your request before donors are contacted.
            </div>

            <div className="flex gap-3">
              <button id="submit-request" type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><FiSend size={16} /> Submit Blood Request</>
                }
              </button>
              <button type="button" onClick={() => navigate('/patient')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
