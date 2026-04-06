/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createRouter, createWebHistory, type RouteRecordNameGeneric } from "vue-router";

import HomePage from "@/pages/HomePage/HomePage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: HomePage,
      name: "home",
      path: "/",
    },
    {
      component: () => import("@/pages/CreateGroupPage/CreateGroupPage.vue"),
      name: "createGroup",
      path: "/group/create",
    },
    {
      component: () => import("@/pages/GroupDetailPage/GroupDetailPage.vue"),
      name: "groupDetail",
      path: "/group/:groupId",
    },
    {
      component: () => import("@/pages/TransactionDetailPage/TransactionDetailPage.vue"),
      name: "transactionDetail",
      path: "/group/:groupId/transaction/:transactionId",
    },
    {
      component: () => import("@/pages/JoinGroupPage/JoinGroupPage.vue"),
      name: "joinGroup",
      path: "/group/join/:joinLinkId",
    },
    {
      name: "newExpense",
      path: "/new-expense",
      redirect: "/new-expense/enter-amount",
    },
    {
      component: () => import("@/pages/NewExpensePage/EnterAmountPage/EnterAmountPage.vue"),
      name: "newExpenseEnterAmount",
      path: "/new-expense/enter-amount",
    },
    {
      component: () => import("@/pages/NewExpensePage/SelectPeoplePage/SelectPeoplePage.vue"),
      name: "newExpenseSelectPeople",
      path: "/new-expense/select-people",
    },
    {
      component: () => import("@/pages/NewExpensePage/SelectSplitMethodPage/SelectSplitMethodPage.vue"),
      name: "newExpenseSelectSplitMethod",
      path: "/new-expense/select-split-method",
    },
    {
      component: () => import("@/pages/NewExpensePage/ReviewAndCompletePage/ReviewAndCompletePage.vue"),
      name: "newExpenseReviewAndComplete",
      path: "/new-expense/review-and-complete",
    },
    {
      component: () => import("@/pages/LoginPage/LoginPage.vue"),
      name: "login",
      path: "/login",
    },
    {
      component: () => import("@/pages/RegisterPage/RegisterPage.vue"),
      name: "register",
      path: "/register",
    },
    {
      component: () => import("@/pages/TwoFactorSetupPage/TwoFactorSetupPage.vue"),
      name: "2faSetup",
      path: "/2fa-setup",
    },
    {
      component: () => import("@/pages/ProfilePage/ProfilePage.vue"),
      name: "profile",
      path: "/profile",
    },
    {
      name: "settleUp",
      path: "/group/:groupId/settle-up",
      redirect: (to) => `/group/${to.params.groupId as string}/settle-up/select-transactions`,
    },
    {
      component: () => import("@/pages/SettleUpPage/SelectTransactionsPage.vue"),
      name: "settleUpSelectTransactions",
      path: "/group/:groupId/settle-up/select-transactions",
    },
    {
      component: () => import("@/pages/SettleUpPage/ConfirmDetailsPage.vue"),
      name: "settleUpConfirmDetails",
      path: "/group/:groupId/settle-up/confirm-details",
    },
    {
      component: () => import("@/pages/SettleUpPage/DonePage.vue"),
      name: "settleUpDone",
      path: "/group/:groupId/settle-up/done",
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  if (!isAuthenticated && !publicRoutes.includes(to.name)) {
    next({ name: "login" });
    return;
  }
  next();
});

export const publicRoutes: RouteRecordNameGeneric[] = ["login", "register"];

export default router;
