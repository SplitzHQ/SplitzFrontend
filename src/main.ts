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

const app = createApp(App);

app.use(createPinia());
app.use(PiniaColada, {});
app.use(router);
app.use(createAppFluent());

/*
 * The first navigation of the router is async. If the app mounts before it ends, RouterView first shows the start
 * location `/` with no page, and then the real first page. A redirect, for example to the sign-in page, or a first page
 * that is not `/` then changes the key of the page in `App.vue`, and the page change slides the first page in. The
 * mount waits for the navigation, so the first page shows at once. `finally` mounts the app also when the first
 * navigation fails, and the error stays in the console.
 */
void router.isReady().finally(() => app.mount("#app"));
