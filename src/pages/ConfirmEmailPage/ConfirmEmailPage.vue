<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
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
  <main class="bg-gray-50 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <section class="w-full max-w-md space-y-6 text-center">
      <div v-if="state === 'loading'" class="space-y-3">
        <h1 class="text-3xl text-gray-900 font-bold tracking-tight">{{ $t("auth-confirm-email-loading-title") }}</h1>
        <p class="text-gray-600 text-sm">{{ $t("auth-confirm-email-loading-body") }}</p>
      </div>

      <div v-else-if="state === 'success'" class="space-y-6">
        <div class="space-y-3">
          <h1 class="text-3xl text-gray-900 font-bold tracking-tight">{{ $t("auth-confirm-email-success-title") }}</h1>
          <p class="text-gray-600 text-sm">{{ $t("auth-confirm-email-success-body") }}</p>
        </div>
        <RouterLink :to="{ name: 'login' }" class="inline-flex">
          <SButton color="brand" variant="primary" size="lg">
            {{ $t("auth-confirm-email-login-link") }}
          </SButton>
        </RouterLink>
      </div>

      <div v-else-if="state === 'rateLimited'" class="space-y-6">
        <div class="space-y-3">
          <h1 class="text-3xl text-gray-900 font-bold tracking-tight">
            {{ $t("auth-confirm-email-rate-limit-title") }}
          </h1>
          <p class="text-gray-600 text-sm">{{ $t("auth-confirm-email-rate-limit-body") }}</p>
          <RateLimitCountdown
            :seconds="confirmationCooldown.remainingSeconds.value"
            message-key="auth-rate-limit-countdown"
            data-test="confirmation-rate-limit"
          />
        </div>
        <SButton
          color="brand"
          variant="primary"
          size="lg"
          :disabled="confirmationCooldown.isActive.value"
          :loading="requestPending"
          data-test="confirmation-retry"
          @click="confirmEmail"
        >
          {{ $t("auth-confirm-email-retry") }}
        </SButton>
      </div>

      <div v-else class="space-y-6">
        <div class="space-y-3">
          <h1 class="text-3xl text-gray-900 font-bold tracking-tight">
            {{ $t(state === "invalid" ? "auth-confirm-email-invalid-title" : "auth-confirm-email-error-title") }}
          </h1>
          <p class="text-gray-600 text-sm">
            {{ $t(state === "invalid" ? "auth-confirm-email-invalid-body" : "auth-confirm-email-error-body") }}
          </p>
        </div>
        <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <RouterLink :to="{ name: 'login' }" class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            {{ $t("auth-confirm-email-resend-link") }}
          </RouterLink>
          <RouterLink :to="{ name: 'register' }" class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            {{ $t("auth-confirm-email-register-link") }}
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
