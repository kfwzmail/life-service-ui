const BASE = '/api'

const store = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (store.token) headers['Authorization'] = 'Bearer ' + store.token

  const res = await fetch(BASE + path, { ...options, headers })
  const json = await res.json()

  if (json.code === 200) return json.data
  if (json.code === 401) {
    store.token = null
    store.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.hash = '#/auth'
    throw new Error('登录已过期')
  }
  throw new Error(json.message || '请求失败')
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Bills
  getBills: (params) => request('/bills?' + new URLSearchParams(params).toString()),
  createBill: (body) => request('/bills', { method: 'POST', body: JSON.stringify(body) }),
  updateBill: (id, body) => request('/bills/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBill: (id) => request('/bills/' + id, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  deleteCategory: (id) => request('/categories/' + id, { method: 'DELETE' }),

  // Stats
  getTodayStats: () => request('/stats/today'),
  getMonthStats: (ym) => request('/stats/month?yearMonth=' + ym),
}

export function getStore() {
  return store
}

export function setAuth(token, user) {
  store.token = token
  store.user = user
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearAuth() {
  store.token = null
  store.user = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function isLoggedIn() {
  return !!store.token
}
