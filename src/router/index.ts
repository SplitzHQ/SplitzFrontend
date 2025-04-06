/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createRouter, createWebHistory } from 'vue-router'

import EnterAmountPage from '@/pages/NewExpensePage/EnterAmountPage/EnterAmountPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: EnterAmountPage
    }
  ]
})

export default router
