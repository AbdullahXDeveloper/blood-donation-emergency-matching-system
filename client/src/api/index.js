import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

// ── Donor ─────────────────────────────────────────────────
export const donorAPI = {
  createOrUpdateProfile: (data) => api.post('/donors/profile', data),
  getProfile:            ()     => api.get('/donors/profile'),
  toggleAvailability:    ()     => api.put('/donors/availability'),
  getRequests:           ()     => api.get('/donors/requests'),
  respond:               (matchId, data) => api.put(`/donors/respond/${matchId}`, data),
  getHistory:            ()     => api.get('/donors/history'),
}

// ── Blood Requests ────────────────────────────────────────
export const requestAPI = {
  create:    (data)   => api.post('/requests', data),
  getAll:    (params) => api.get('/requests', { params }),
  getOne:    (id)     => api.get(`/requests/${id}`),
  getMy:     ()       => api.get('/requests/my'),
  verify:    (id)     => api.put(`/requests/${id}/verify`),
  cancel:    (id)     => api.put(`/requests/${id}/cancel`),
  close:     (id, data) => api.put(`/requests/${id}/close`, data),
}

// ── Matching ──────────────────────────────────────────────
export const matchAPI = {
  trigger:      (requestId)       => api.post(`/match/${requestId}`),
  getMatches:   (requestId)       => api.get(`/match/${requestId}`),
  updateStatus: (matchId, data)   => api.put(`/match/${matchId}/status`, data),
}

// ── Dashboard ─────────────────────────────────────────────
export const dashboardAPI = {
  getStats:    ()           => api.get('/dashboard/stats'),
  getUsers:    (params)     => api.get('/dashboard/users', { params }),
  getPending:  ()           => api.get('/dashboard/pending'),
  approveUser: (id, action) => api.put(`/dashboard/users/${id}/approve`, { action }),
}

export default api
