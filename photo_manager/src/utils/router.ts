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
router.beforeEach((to, _, next) => {
  if (to.matched.some(record => record.meta?.requiresAuth)) {
    if (!localStorage.getItem('token')) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    }
    else {
      next()
    }
  }
  else {
    next()
  }
})
export default router
