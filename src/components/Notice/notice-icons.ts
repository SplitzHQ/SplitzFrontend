import { PhCheckCircle, PhInfo, PhWarning, PhWarningCircle } from "@phosphor-icons/vue";
import type { Component } from "vue";

import type { NoticeProps } from "./Notice.vue";

/**
 * The default icon of each tone. A warning has a triangle and an error has a circle, so the shape also separates them.
 * The rules are in `notice.usage.ts`.
 */
export const NOTICE_ICONS: Record<NonNullable<NoticeProps["tone"]>, Component> = {
  error: PhWarningCircle,
  info: PhInfo,
  success: PhCheckCircle,
  warning: PhWarning,
};
