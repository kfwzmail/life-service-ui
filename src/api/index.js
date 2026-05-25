const BASE = '/api'

const store = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
}

async function request(path, body = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (store.token) headers['Authorization'] = 'Bearer ' + store.token

  const res = await fetch(BASE + path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
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
  login: (body) => request('/auth/login', body),
  register: (body) => request('/auth/register', body),

  // Bills
  getBills: (body) => request('/bills/list', body),
  createBill: (body) => request('/bills/create', body),
  updateBill: (body) => request('/bills/update', body),
  deleteBill: (id) => request('/bills/delete', { id }),
  importBills: (body) => request('/bills/import', body),

  // Categories
  getCategories: () => request('/categories/list'),
  createCategory: (body) => request('/categories/create', body),
  deleteCategory: (id) => request('/categories/delete', { id }),

  // Stats
  getTodayStats: () => request('/stats/today'),
  getMonthStats: (yearMonth) => request('/stats/month', { yearMonth }),
  getDailyTrend: (yearMonth) => request('/stats/daily-trend', { yearMonth }),
  getYearlyStats: (year) => request('/stats/yearly', { year }),

  // Budget
  getBudgets: (month) => request('/budgets/list', { month }),
  saveBudgets: (body) => request('/budgets/save', body),
  getBudgetComparison: (month) => request('/budgets/comparison', { month }),
}

export function getStore() { return store }
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
export function isLoggedIn() { return !!store.token }
