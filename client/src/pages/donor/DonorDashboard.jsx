import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { donorAPI } from '../../api'
import StatsCard from '../../components/StatsCard'
import BloodGroupBadge from '../../components/BloodGroupBadge'
import StatusBadge from '../../components/StatusBadge'
import { formatDate, isEligibleToDonate, getErrorMessage } from '../../utils'
import { FiDroplet, FiClock, FiActivity, FiEdit, FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

const citiesPreset = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];
const areasPreset = ['DHA', 'Gulshan', 'Clifton', 'Nazimabad', 'Bahria Town', 'Johar Town', 'Model Town', 'Cantt', 'Gulberg'];

export default function DonorDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    bloodGroup: '', city: '', area: '', phone: '', lastDonationDate: '', consentGiven: true
  })
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [isOtherArea, setIsOtherArea] = useState(false);

  const handleCitySelect = (val) => {
    if (val === 'Other') {
      setIsOtherCity(true);
      setForm(p => ({ ...p, city: '' }));
    } else {
      setIsOtherCity(false);
      setForm(p => ({ ...p, city: val }));
    }
  };

  const handleAreaSelect = (val) => {
    if (val === 'Other') {
      setIsOtherArea(true);
      setForm(p => ({ ...p, area: '' }));
    } else {
      setIsOtherArea(false);
      setForm(p => ({ ...p, area: val }));
    }
  };

  // We could fetch recent requests and history here if the backend provided it on getProfile,
  // but we'll stick to updating the UI for the profile and toggle first.
  
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await donorAPI.getProfile()
      setProfile(data)
      setForm({
        bloodGroup: data.bloodGroup || '',
        city: data.city || '',
        area: data.area || '',
        phone: data.phone || '',
        lastDonationDate: data.lastDonationDate ? data.lastDonationDate.split('T')[0] : '',
        consentGiven: data.consentGiven ?? true,
      })
      setIsOtherCity(data.city && !citiesPreset.includes(data.city));
      setIsOtherArea(data.area && !areasPreset.includes(data.area));
    } catch {
      setEditMode(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await donorAPI.createOrUpdateProfile(form)
      setProfile(data)
      setEditMode(false)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async () => {
    try {
      const { data } = await donorAPI.toggleAvailability()
      setProfile(p => ({ ...p, isAvailable: data.isAvailable }))
      toast.success(data.message)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const eligible = profile ? isEligibleToDonate(profile.lastDonationDate) : false

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="page-container">
      {/* Profile Completion Banner */}
      {!profile && !editMode && (
        <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.1)]">
          <div className="flex items-center gap-4">
            <FiAlertTriangle className="text-red-500" size={24} />
            <div>
              <h3 className="font-bold text-white text-lg font-['Space_Grotesk']">Incomplete Profile</h3>
              <p className="text-sm text-neutral-400">Complete your profile to start receiving emergency match requests.</p>
            </div>
          </div>
          <button onClick={() => setEditMode(true)} className="btn-primary text-sm px-6 py-2.5">
            Complete Profile
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-white">Donor Overview</h1>
          <p className="text-sm text-neutral-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        {profile && (
          <button onClick={() => setEditMode(!editMode)} className="btn-secondary text-sm px-4 py-2">
            <FiEdit size={14} /> Edit Profile
          </button>
        )}
      </div>

      {/* Stats row */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={FiDroplet} label="Blood Group" value={profile.bloodGroup} color="red" />
          <StatsCard icon={FiActivity} label="Total Donations" value={profile.totalDonations} color="green" />
          <StatsCard icon={FiClock} label="Last Donation" value={formatDate(profile.lastDonationDate) || 'Never'} color="blue" />
          <StatsCard icon={FiActivity} label="Eligibility" value={eligible ? 'Eligible' : 'Cooling'} color={eligible ? 'green' : 'orange'} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Availability Toggle Box */}
        {profile && (
          <div className="card col-span-1 flex flex-col items-center justify-center py-10">
            <h2 className="font-bold text-white mb-6 text-lg font-['Space_Grotesk']">Availability Status</h2>
            
            <button 
              onClick={handleToggle}
              className={`relative flex items-center w-64 h-20 rounded-full p-2 transition-all duration-300 ${
                profile.isAvailable 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              {/* Sliding Pill */}
              <div className={`absolute w-[calc(50%-8px)] h-[calc(100%-16px)] rounded-full transition-all duration-300 shadow-lg ${
                profile.isAvailable 
                ? 'translate-x-[100%] bg-green-500 shadow-green-500/30' 
                : 'translate-x-0 bg-red-500 shadow-red-500/30'
              }`} />
              
              <div className="relative z-10 w-1/2 text-center text-sm font-bold text-white transition-colors">
                UNAVAILABLE
              </div>
              <div className="relative z-10 w-1/2 text-center text-sm font-bold text-white transition-colors">
                AVAILABLE
              </div>
            </button>
            <p className="text-sm text-neutral-400 mt-6 text-center px-4">
              {profile.isAvailable ? 'You are visible to hospitals for matching' : 'You are currently hidden from new matches'}
            </p>
          </div>
        )}

        {/* Profile form */}
        <div className={`card ${profile ? 'lg:col-span-2' : 'col-span-3'}`}>
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="font-bold text-white text-lg font-['Space_Grotesk']">
              {profile ? (editMode ? 'Edit Details' : 'Donor Details') : 'Setup Your Profile'}
            </h2>
          </div>

          {!editMode && profile ? (
            <div className="grid grid-cols-2 gap-6">
              {[
                ['Blood Group', <BloodGroupBadge group={profile.bloodGroup} />],
                ['City',        profile.city],
                ['Area',        profile.area || '—'],
                ['Phone',       profile.phone],
                ['Consent',     profile.consentGiven ? <span className="text-green-400 flex items-center gap-1"><FiCheck/> Given</span> : <span className="text-red-400 flex items-center gap-1">Not given</span>],
              ].map(([label, val]) => (
                <div key={label} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-neutral-500 mb-1">{label}</div>
                  <div className="text-white text-sm font-medium">{val}</div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Blood Group *</label>
                  <select value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))} className="select" required>
                    <option value="">Select blood group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Phone *</label>
                  <input type="text" value={form.phone} required onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input" placeholder="0300-1234567" />
                </div>
                <div>
                  <label className="input-label">City *</label>
                  <select 
                    value={isOtherCity ? 'Other' : (citiesPreset.includes(form.city) ? form.city : '')} 
                    onChange={e => handleCitySelect(e.target.value)} 
                    className="select mb-2"
                    required={!isOtherCity}
                  >
                    <option value="">Select city</option>
                    {citiesPreset.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {isOtherCity && (
                    <input 
                      type="text" 
                      value={form.city} 
                      required 
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))} 
                      className="input" 
                      placeholder="Enter city name" 
                    />
                  )}
                </div>
                <div>
                  <label className="input-label">Area</label>
                  <select 
                    value={isOtherArea ? 'Other' : (areasPreset.includes(form.area) ? form.area : '')} 
                    onChange={e => handleAreaSelect(e.target.value)} 
                    className="select mb-2"
                  >
                    <option value="">Select area</option>
                    {areasPreset.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {isOtherArea && (
                    <input 
                      type="text" 
                      value={form.area} 
                      onChange={e => setForm(p => ({ ...p, area: e.target.value }))} 
                      className="input" 
                      placeholder="Enter area name" 
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <label className="input-label">Last Donation Date</label>
                  <input type="date" value={form.lastDonationDate} onChange={e => setForm(p => ({ ...p, lastDonationDate: e.target.value }))} className="input" max={new Date().toISOString().split('T')[0]} />
                  <p className="text-xs text-neutral-500 mt-1">Leave blank if you've never donated before</p>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="consent-check" checked={form.consentGiven} onChange={e => setForm(p => ({ ...p, consentGiven: e.target.checked }))} className="w-5 h-5 rounded accent-red-600 bg-[#1a1a1a] border-white/10" />
                  <label htmlFor="consent-check" className="text-sm text-neutral-400 cursor-pointer">
                    I consent to be contacted for emergency blood requests
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Save Profile'}
                </button>
                {profile && (
                  <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1">Cancel</button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}
