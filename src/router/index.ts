import { createRouter, createWebHistory } from 'vue-router'

import ReportView from '@/views/ReportView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/',
      redirect: '/dashboard',
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresGuest: true,
      },
    },

    {
      path: '/',
      component: DashboardLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'reports',
          name: 'reports',
          component: ReportView,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return '/dashboard'
  }

  return true
})

export default router
