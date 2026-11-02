// sort-imports-ignore
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import "@/assets/base.css";
import "@/assets/color.css";
import "vue-sonner/style.css";
import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { createAppFluent } from "@/libs/fluent";

import DesignSystemApp from "./DesignSystemApp.vue";

// Some components render RouterLink, so the page needs a router. The page does not navigate.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ component: { render: () => null }, path: "/" }],
});

createApp(DesignSystemApp).use(router).use(createAppFluent()).mount("#app");
