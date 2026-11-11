// sort-imports-ignore
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PiniaColada } from "@pinia/colada";
import { createPinia } from "pinia";

import "./assets/base.css";
import "./assets/color.css";
import { createApp } from "vue";

import { createAppFluent } from "@/libs/fluent";

import App from "./App.vue";
import router from "./router";

// iOS Safari can still start a pinch zoom when `touch-action` does not stop it, for example during a scroll. Only Safari
// sends `gesturestart`. See the viewport tag in `index.html`.
document.addEventListener("gesturestart", (event) => event.preventDefault());

const app = createApp(App);

app.use(createPinia());
app.use(PiniaColada, {});
app.use(router);
app.use(createAppFluent());

app.mount("#app");
