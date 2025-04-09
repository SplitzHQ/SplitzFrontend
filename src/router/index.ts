/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/HomePage/HomePage.vue'
import EnterAmountPage from '@/pages/NewExpensePage/EnterAmountPage/EnterAmountPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/new-expense',
      redirect: '/new-expense/enter-amount'
    },
    {
      path: '/new-expense/enter-amount',
      name: 'newExpenseEnterAmount',
      component: EnterAmountPage
    }
  ]
})

export default router
