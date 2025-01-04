import { createRouter, createWebHistory } from 'vue-router'

import EnterValuePage from '@/pages/NewExpensePage/EnterValuePage/EnterValuePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: EnterValuePage
    }
  ]
})

export default router
