/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/HomePage/HomePage.vue'

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
      component: () => import('@/pages/NewExpensePage/EnterAmountPage/EnterAmountPage.vue')
    },
    {
      path: '/new-expense/select-people',
      name: 'newExpenseSelectPeople',
      component: () => import('@/pages/NewExpensePage/SelectPeoplePage/SelectPeoplePage.vue')
    },
    {
      path: '/new-expense/select-split-method',
      name: 'newExpenseSelectSplitMethod',
      component: () => import('@/pages/NewExpensePage/SelectSplitMethodPage/SelectSplitMethodPage.vue')
    }
  ]
})

export default router
