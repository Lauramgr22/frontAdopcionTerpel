const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('pagoclaro_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'No fue posible completar la solicitud')
  return data
}

export const api = {
  login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  dashboard: () => request('/api/dashboard'),
  payments: (status = '') => request(`/api/payments${status ? `?status=${status}` : ''}`),
  createPayment: (payload) => request('/api/payments', { method: 'POST', body: JSON.stringify(payload) }),
  updatePayment: (id, payload) => request(`/api/payments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
}

