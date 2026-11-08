<!--
  @fallthroughAttributes true
  The type check accepts the native attributes of the root element, such as `id` or `tabindex`, on this component.
-->
<script setup lang="ts">
import { PhCheckCircle, PhCircle } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";

import { PASSWORD_RULES } from "@/libs/password-policy";

/**
 * The rules of a new password under its field. Each rule gets a check when the password passes it.
 * The rules are in `auth-shell.usage.ts`. The side space lines the text up with the text in the field.
 */
const { password } = defineProps<{ password: string }>();

const { $t } = useFluent();
</script>

<template>
  <ul class="flex flex-col gap-1.5 px-3.25">
    <li
      v-for="rule in PASSWORD_RULES"
      :key="rule.labelKey"
      :class="[
        'flex items-center gap-2 text-sm transition-colors duration-state ease-standard',
        rule.passes(password) ? 'text-base-text-secondary' : 'text-base-text-tertiary',
      ]"
    >
      <PhCheckCircle
        v-if="rule.passes(password)"
        weight="fill"
        aria-hidden="true"
        class="size-4 shrink-0 text-util-color-success-600"
      />
      <PhCircle v-else aria-hidden="true" class="size-4 shrink-0 text-base-text-quaternary" />
      {{ $t(rule.labelKey) }}
      <span class="sr-only">{{
        $t(rule.passes(password) ? "auth-password-rule-met" : "auth-password-rule-unmet")
      }}</span>
    </li>
  </ul>
</template>
