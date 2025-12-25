// sort-imports-ignore
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FluentBundle } from "@fluent/bundle";
import { createFluentVue } from "fluent-vue";
import { createPinia } from "pinia";
import { PiniaColada } from "@pinia/colada";
import { createApp } from "vue";

import App from "./App.vue";
import "./assets/base.css";
import "./assets/color.css";
// @ts-expect-error - translation files
import enNewExpense from "./locales/en/new-expense.ftl";
// @ts-expect-error - translation files
import enCategories from "./locales/en/categories.ftl";
// @ts-expect-error - translation files
import enHome from "./locales/en/home.ftl";
// @ts-expect-error - translation files
import zhcnNewExpense from "./locales/zh-cn/new-expense.ftl";
// @ts-expect-error - translation files
import zhcnCategories from "./locales/zh-cn/categories.ftl";
// @ts-expect-error - translation files
import zhcnHome from "./locales/zh-cn/home.ftl";
import router from "./router";

const app = createApp(App);

// Create bundles for locales that will be used
const enBundle = new FluentBundle("en");
const zhcnBundle = new FluentBundle("zh-cn");

[enNewExpense, enCategories, enHome].forEach((resource) => enBundle.addResource(resource));
[zhcnNewExpense, zhcnCategories, zhcnHome].forEach((resource) => zhcnBundle.addResource(resource));

const fluent = createFluentVue({
  bundles: [enBundle, zhcnBundle]
});

app.use(createPinia());
app.use(PiniaColada, {});
app.use(router);
app.use(fluent);

app.mount("#app");
