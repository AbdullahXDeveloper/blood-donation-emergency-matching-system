import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

import Navbar from './components/Navbar'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import Unauthorized   from './pages/Unauthorized'

import DonorDashboard     from './pages/donor/DonorDashboard'
import DonorRequests      from './pages/donor/DonorRequests'
import DonorHistory       from './pages/donor/DonorHistory'

import PatientDashboard   from './pages/patient/PatientDashboard'
import NewRequest         from './pages/patient/NewRequest'

import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminUsers         from './pages/admin/AdminUsers'
import AdminRequests      from './pages/admin/AdminRequests'
import RequestDetail      from './pages/admin/RequestDetail'

import HospitalDashboard  from './pages/hospital/HospitalDashboard'
import HospitalRequests   from './pages/hospital/HospitalRequests'

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
    exit={{ opacity: 0, y: -20 }}
  >
    {children}
  </motion.div>
)

const RoleRedirect = () => {
  const { user } = useAuth()
  const map = { donor: '/donor', patient: '/patient', admin: '/admin', hospital: '/hospital', coordinator: '/admin' }
  return <Navigate to={map[user?.role] || '/'} replace />
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-[#080808] font-sans flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public */}
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
          <Route path="/login"    element={isAuthenticated ? <RoleRedirect /> : <PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/register" element={isAuthenticated ? <RoleRedirect /> : <PageWrapper><RegisterPage /></PageWrapper>} />
          <Route path="/unauthorized" element={<PageWrapper><Unauthorized /></PageWrapper>} />

          {/* Donor Dashboard */}
          <Route path="/donor" element={<ProtectedRoute allowedRoles={['donor']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<PageWrapper><DonorDashboard /></PageWrapper>} />
            <Route path="requests" element={<PageWrapper><DonorRequests /></PageWrapper>} />
            <Route path="history"  element={<PageWrapper><DonorHistory /></PageWrapper>} />
          </Route>

          {/* Patient Dashboard */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<PageWrapper><PatientDashboard /></PageWrapper>} />
            <Route path="new-request" element={<PageWrapper><NewRequest /></PageWrapper>} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'coordinator']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<PageWrapper><AdminDashboard /></PageWrapper>} />
            <Route path="users" element={<PageWrapper><AdminUsers /></PageWrapper>} />
            <Route path="requests" element={<PageWrapper><AdminRequests /></PageWrapper>} />
            <Route path="requests/:id" element={<PageWrapper><RequestDetail /></PageWrapper>} />
          </Route>

          {/* Hospital Dashboard */}
          <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<PageWrapper><HospitalDashboard /></PageWrapper>} />
            <Route path="requests" element={<PageWrapper><HospitalRequests /></PageWrapper>} />
            <Route path="requests/:id" element={<PageWrapper><RequestDetail /></PageWrapper>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
