<script setup lang="ts">
import { PhLinkBreak, PhLockSimple, PhWarningCircle } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { ResponseError, type HttpValidationProblemDetails } from "@/backend/openapi";
import AuthShell from "@/components/AuthShell/AuthShell.vue";
import Notice from "@/components/Notice/Notice.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import StatusBadge from "@/components/StatusBadge/StatusBadge.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { $t } = useFluent();

const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMessageKey = ref<string | null>(null);
const resetCooldown = useRateLimitCooldown();

// Reset links are only useful when both token-bearing query parameters are single string values.
const resetRequestContext = computed(() => {
  const email = getSingleQueryValue(route.query.email);
  const resetCode = getSingleQueryValue(route.query.resetCode);

  if (!email || !resetCode) {
    return null;
  }

  return { email, resetCode };
});

const isInvalidLink = computed(() => resetRequestContext.value === null);

watch([newPassword, confirmPassword], () => {
  if (errorMessageKey.value === "auth-reset-password-mismatch" && newPassword.value === confirmPassword.value) {
    errorMessageKey.value = null;
  }
});

async function handleResetPassword() {
  if (!resetRequestContext.value || loading.value || resetCooldown.isActive.value) {
    return;
  }

  errorMessageKey.value = null;

  if (newPassword.value !== confirmPassword.value) {
    errorMessageKey.value = "auth-reset-password-mismatch";
    return;
  }

  if (!meetsPasswordPolicy(newPassword.value)) {
    errorMessageKey.value = "auth-reset-password-policy";
    return;
  }

  loading.value = true;
  try {
    await userStore.resetPassword({
      email: resetRequestContext.value.email,
      newPassword: newPassword.value,
      resetCode: resetRequestContext.value.resetCode,
    });
    toast.success($t("auth-reset-password-success-toast"));
    await router.push({ name: "login", query: { passwordReset: "success" } });
  } catch (error) {
    if (!resetCooldown.startFromError(error)) {
      errorMessageKey.value = await getResetPasswordErrorMessageKey(error);
    }
  } finally {
    loading.value = false;
  }
}

function meetsPasswordPolicy(password: string): boolean {
  return password.length >= 12 && /[a-z]/.test(password) && /\d/.test(password);
}

async function getResetPasswordErrorMessageKey(error: unknown): Promise<string> {
  if (!(error instanceof ResponseError)) {
    return "auth-reset-password-request-error";
  }

  try {
    const body = (await error.response.clone().json()) as HttpValidationProblemDetails;
    const errorCodes = Object.keys(body.errors ?? {});

    if (errorCodes.some((code) => code.startsWith("Password"))) {
      return "auth-reset-password-policy";
    }

    if (errorCodes.includes("InvalidToken")) {
      return "auth-reset-password-error";
    }
  } catch {
    return "auth-reset-password-request-error";
  }

  return "auth-reset-password-request-error";
}

function getSingleQueryValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return undefined;
}
</script>

<template>
  <AuthShell
    v-if="isInvalidLink"
    centered
    :title="$t('auth-reset-password-invalid-title')"
    :subtitle="$t('auth-reset-password-invalid-body')"
  >
    <template #hero>
      <div class="flex justify-center">
        <StatusBadge tone="error">
          <PhLinkBreak weight="duotone" />
        </StatusBadge>
      </div>
    </template>

    <Notice tone="info">
      <p>{{ $t("auth-reset-password-invalid-help") }}</p>
    </Notice>

    <template #footer>
      <RouterLink :to="{ name: 'forgotPassword' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-reset-password-forgot-link") }}
      </RouterLink>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-reset-password-login-link") }}
      </RouterLink>
    </template>
  </AuthShell>

  <AuthShell v-else :title="$t('auth-reset-password-title')" :subtitle="$t('auth-reset-password-body')">
    <form class="flex flex-col gap-5" @submit.prevent="handleResetPassword">
      <TextInput
        id="new-password"
        v-model="newPassword"
        name="new-password"
        type="password"
        autocomplete="new-password"
        required
        :label="$t('auth-new-password-label')"
        :placeholder="$t('auth-new-password-placeholder')"
        :hint="$t('auth-password-hint')"
        :invalid="errorMessageKey === 'auth-reset-password-policy'"
      >
        <template #icon>
          <PhLockSimple />
        </template>
      </TextInput>

      <TextInput
        id="confirm-password"
        v-model="confirmPassword"
        name="confirm-password"
        type="password"
        autocomplete="new-password"
        required
        :label="$t('auth-confirm-password-label')"
        :placeholder="$t('auth-confirm-password-placeholder')"
        :invalid="errorMessageKey === 'auth-reset-password-mismatch'"
      >
        <template #icon>
          <PhLockSimple />
        </template>
      </TextInput>

      <Notice v-if="errorMessageKey" tone="error">
        <template #icon>
          <PhWarningCircle />
        </template>
        <p>{{ $t(errorMessageKey) }}</p>
      </Notice>

      <RateLimitCountdown
        :seconds="resetCooldown.remainingSeconds.value"
        message-key="auth-rate-limit-countdown"
        data-test="reset-password-rate-limit"
      />

      <SButton
        type="submit"
        color="brand"
        variant="primary"
        size="xxl"
        :disabled="resetCooldown.isActive.value"
        :loading="loading"
        class="w-full"
        data-test="reset-password-submit"
      >
        {{ $t("auth-reset-password-action") }}
      </SButton>
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'forgotPassword' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-reset-password-forgot-link") }}
      </RouterLink>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-reset-password-login-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
