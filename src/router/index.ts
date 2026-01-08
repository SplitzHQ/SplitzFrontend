/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createRouter, createWebHistory, type RouteRecordNameGeneric } from "vue-router";

import HomePage from "@/pages/HomePage/HomePage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage
    },
    {
      path: "/new-expense",
      redirect: "/new-expense/enter-amount"
    },
    {
      path: "/new-expense/enter-amount",
      name: "newExpenseEnterAmount",
      component: () => import("@/pages/NewExpensePage/EnterAmountPage/EnterAmountPage.vue")
    },
    {
      path: "/new-expense/select-people",
      name: "newExpenseSelectPeople",
      component: () => import("@/pages/NewExpensePage/SelectPeoplePage/SelectPeoplePage.vue")
    },
    {
      path: "/new-expense/select-split-method",
      name: "newExpenseSelectSplitMethod",
      component: () => import("@/pages/NewExpensePage/SelectSplitMethodPage/SelectSplitMethodPage.vue")
    },
    {
      path: "/new-expense/review-and-complete",
      name: "newExpenseReviewAndComplete",
      component: () => import("@/pages/NewExpensePage/ReviewAndCompletePage/ReviewAndCompletePage.vue")
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/LoginPage/LoginPage.vue")
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/pages/RegisterPage/RegisterPage.vue")
    },
    {
      path: "/2fa-setup",
      name: "2faSetup",
      component: () => import("@/pages/TwoFactorSetupPage/TwoFactorSetupPage.vue")
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  if (!isAuthenticated && !publicRoutes.includes(to.name)) {
    next({ name: "login" });
  }
  next();
});

export const publicRoutes: RouteRecordNameGeneric[] = ["login", "register"];

export default router;
