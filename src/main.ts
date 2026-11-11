// sort-imports-ignore
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PiniaColada } from "@pinia/colada";
import { createPinia } from "pinia";

import "./assets/base.css";
import "./assets/color.css";
import { createApp } from "vue";

import { createAppFluent } from "@/libs/fluent";
import { preventPageZoom } from "@/libs/prevent-page-zoom";

import App from "./App.vue";
import router from "./router";

preventPageZoom();

const app = createApp(App);

app.use(createPinia());
app.use(PiniaColada, {});
app.use(router);
app.use(createAppFluent());

app.mount("#app");
