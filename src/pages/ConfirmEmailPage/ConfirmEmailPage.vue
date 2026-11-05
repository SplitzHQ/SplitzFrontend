<script setup lang="ts">
import { PhCheck, PhCircleNotch, PhHourglassMedium, PhLinkBreak } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import AuthShell from "@/components/AuthShell/AuthShell.vue";
import AuthStatusIcon from "@/components/AuthShell/AuthStatusIcon.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import SLinkButton from "@/components/SButton/SLinkButton.vue";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";
import { useUserStore } from "@/stores/user";

type ConfirmationState = "loading" | "success" | "invalid" | "error" | "rateLimited";

const route = useRoute();
const userStore = useUserStore();
const { $t } = useFluent();

const state = ref<ConfirmationState>("loading");
const requestPending = ref(false);
const confirmationCooldown = useRateLimitCooldown();

// Only accept single query values so arrays or missing fields cannot be forwarded as token parameters.
const confirmEmailRequest = computed(() => {
  const userId = getSingleQueryValue(route.query.userId);
  const code = getSingleQueryValue(route.query.code);
  const changedEmail = getSingleQueryValue(route.query.changedEmail);

  if (!userId || !code) {
    return null;
  }

  return {
    ...(changedEmail ? { changedEmail } : {}),
    code,
    userId,
  };
});

const copyByState: Record<ConfirmationState, { body: string; title: string }> = {
  error: { body: "auth-confirm-email-error-body", title: "auth-confirm-email-error-title" },
  invalid: { body: "auth-confirm-email-invalid-body", title: "auth-confirm-email-invalid-title" },
  loading: { body: "auth-confirm-email-loading-body", title: "auth-confirm-email-loading-title" },
  rateLimited: { body: "auth-confirm-email-rate-limit-body", title: "auth-confirm-email-rate-limit-title" },
  success: { body: "auth-confirm-email-success-body", title: "auth-confirm-email-success-title" },
};

const copy = computed(() => copyByState[state.value]);

onMounted(confirmEmail);

async function confirmEmail() {
  if (requestPending.value || confirmationCooldown.isActive.value) {
    return;
  }

  if (!confirmEmailRequest.value) {
    state.value = "invalid";
    return;
  }

  requestPending.value = true;
  state.value = "loading";
  try {
    await userStore.confirmEmail(confirmEmailRequest.value);
    state.value = "success";
  } catch (error) {
    state.value = confirmationCooldown.startFromError(error) ? "rateLimited" : "error";
  } finally {
    requestPending.value = false;
  }
}

function getSingleQueryValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return undefined;
}
</script>

<template>
  <AuthShell status :title="$t(copy.title)" :subtitle="$t(copy.body)">
    <template #icon>
      <AuthStatusIcon v-if="state === 'loading'" tone="brand">
        <PhCircleNotch class="animate-spin" />
      </AuthStatusIcon>
      <AuthStatusIcon v-else-if="state === 'success'" tone="success">
        <PhCheck weight="bold" />
      </AuthStatusIcon>
      <AuthStatusIcon v-else-if="state === 'rateLimited'" tone="warning">
        <PhHourglassMedium weight="duotone" />
      </AuthStatusIcon>
      <AuthStatusIcon v-else tone="error">
        <PhLinkBreak weight="duotone" />
      </AuthStatusIcon>
    </template>

    <template v-if="state === 'rateLimited'" #default>
      <RateLimitCountdown
        class="px-3.25"
        :seconds="confirmationCooldown.remainingSeconds.value"
        message-key="auth-rate-limit-countdown"
        data-test="confirmation-rate-limit"
      />
    </template>

    <template v-if="state === 'success'" #actions>
      <SLinkButton variant="primary" size="xl" class="w-full" href="/login">
        {{ $t("auth-confirm-email-login-link") }}
      </SLinkButton>
    </template>

    <template v-else-if="state === 'rateLimited'" #actions>
      <SButton
        variant="primary"
        size="xl"
        class="w-full"
        :disabled="confirmationCooldown.isActive.value"
        :loading="requestPending"
        data-test="confirmation-retry"
        @click="confirmEmail"
      >
        {{ $t("auth-confirm-email-retry") }}
      </SButton>
    </template>

    <template v-else-if="state === 'invalid' || state === 'error'" #actions>
      <SLinkButton variant="primary" size="xl" class="w-full" href="/login" data-test="confirmation-resend">
        {{ $t("auth-confirm-email-resend-link") }}
      </SLinkButton>
    </template>

    <template v-if="state === 'invalid' || state === 'error'" #footer>
      <RouterLink :to="{ name: 'register' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-confirm-email-register-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
