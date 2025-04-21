import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404/index.vue'),
  },
  {
    path: '/',
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home/index.vue'),
        children: [
          {
            path: 'bubu',
            name: 'bubu',
            component: () => import('@/views/Home/components/bubu.vue'),
          },
          {
            path: 'yier',
            name: 'yier',
            component: () => import('@/views/Home/components/yier.vue'),
          },
          {
            path: 'family',
            component: () => import('@/views/Home/components/family.vue'),
          },
        ],
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/views/User/index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
function isTokenExpired(token: string) {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp
    const now = Math.floor(Date.now() / 1000) // 当前时间戳（秒）
    return now > exp
  } catch (e) {
    console.error('Invalid token:', e)
    return true // 无法解析的 token 认为已过期
  }
}

router.beforeEach((to, _, next) => {
  if (to.matched.some(record => record.meta?.requiresAuth)) {
    const token = localStorage.getItem('token')
    if (!token || isTokenExpired(token)) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  }
  else {
    next()
  }
})
export default router
