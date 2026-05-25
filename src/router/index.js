import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '../api/index.js'

const routes = [
  { path: '/auth', name: 'auth', component: () => import('../views/AuthView.vue') },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/bills', name: 'bills', component: () => import('../views/BillsView.vue'), meta: { requiresAuth: true } },
  { path: '/stats', name: 'stats', component: () => import('../views/StatsView.vue'), meta: { requiresAuth: true } },
  { path: '/budgets', name: 'budgets', component: () => import('../views/BudgetView.vue'), meta: { requiresAuth: true } },
  { path: '/categories', name: 'categories', component: () => import('../views/CategoriesView.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) return '/auth'
})

export default router
