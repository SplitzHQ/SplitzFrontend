// sort-imports-ignore
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import "./dev.css";
import "@/assets/color.css";
import { createApp } from "vue";

import DevDashboard from "./DevDashboard.vue";

/*
 * The dev dashboard page. It has its own HTML entry (`index.html` in this folder) and the dev server serves it at
 * `/dev`. The app build uses only the root `index.html`, so the dashboard is not in the production bundle.
 */
createApp(DevDashboard).mount("#app");
