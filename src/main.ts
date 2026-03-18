// sort-imports-ignore
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FluentBundle, type FluentResource } from "@fluent/bundle";
import { PiniaColada } from "@pinia/colada";
import { createFluentVue } from "fluent-vue";
import { createPinia } from "pinia";

import "./assets/base.css";
import "./assets/color.css";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Create bundles for locales that will be used
const enBundle = new FluentBundle("en");
for (const ftl of Object.values(import.meta.glob("./locales/en/*.ftl", { eager: true }))) {
  enBundle.addResource((ftl as { default: FluentResource }).default);
}

const zhcnBundle = new FluentBundle("zh-cn");
for (const ftl of Object.values(import.meta.glob("./locales/zh-cn/*.ftl", { eager: true }))) {
  zhcnBundle.addResource((ftl as { default: FluentResource }).default);
}

const fluent = createFluentVue({
  bundles: [enBundle, zhcnBundle],
});

app.use(createPinia());
app.use(PiniaColada, {});
app.use(router);
app.use(fluent);

app.mount("#app");
