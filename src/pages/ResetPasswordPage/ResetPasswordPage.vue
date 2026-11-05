<script setup lang="ts">
import { PhLinkBreak } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { ResponseError, type HttpValidationProblemDetails } from "@/backend/openapi";
import AuthShell from "@/components/AuthShell/AuthShell.vue";
import AuthStatusIcon from "@/components/AuthShell/AuthStatusIcon.vue";
import PasswordChecklist from "@/components/AuthShell/PasswordChecklist.vue";
import Notice from "@/components/Notice/Notice.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import SLinkButton from "@/components/SButton/SLinkButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { meetsPasswordPolicy } from "@/libs/password-policy";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { $t } = useFluent();

const newPassword = ref("");
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

const POLICY_ERROR = "auth-password-policy";
const EXPIRED_ERROR = "auth-reset-password-error";

// An error about the password shows under its field. The Notice shows only an error about the request.
const noticeErrorKey = computed(() => (errorMessageKey.value === POLICY_ERROR ? null : errorMessageKey.value));

async function handleResetPassword() {
  if (!resetRequestContext.value || loading.value || resetCooldown.isActive.value) {
    return;
  }

  errorMessageKey.value = null;

  if (!meetsPasswordPolicy(newPassword.value)) {
    errorMessageKey.value = POLICY_ERROR;
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

async function getResetPasswordErrorMessageKey(error: unknown): Promise<string> {
  if (!(error instanceof ResponseError)) {
    return "auth-reset-password-request-error";
  }

  try {
    const body = (await error.response.clone().json()) as HttpValidationProblemDetails;
    const errorCodes = Object.keys(body.errors ?? {});

    if (errorCodes.some((code) => code.startsWith("Password"))) {
      return POLICY_ERROR;
    }

    if (errorCodes.includes("InvalidToken")) {
      return EXPIRED_ERROR;
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
    status
    :title="$t('auth-reset-password-invalid-title')"
    :subtitle="$t('auth-reset-password-invalid-help')"
  >
    <template #icon>
      <AuthStatusIcon tone="error">
        <PhLinkBreak weight="duotone" />
      </AuthStatusIcon>
    </template>

    <template #actions>
      <SLinkButton variant="primary" size="xl" class="w-full" href="/forgot-password">
        {{ $t("auth-reset-password-forgot-link") }}
      </SLinkButton>
    </template>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-reset-password-login-link") }}
      </RouterLink>
    </template>
  </AuthShell>

  <AuthShell
    v-else
    :title="$t('auth-reset-password-title')"
    :subtitle="$t('auth-reset-password-body')"
    @submit="handleResetPassword"
  >
    <div class="flex flex-col gap-3">
      <TextInput
        id="new-password"
        v-model="newPassword"
        name="new-password"
        type="password"
        autocomplete="new-password"
        required
        described-by="password-rules"
        :label="$t('auth-new-password-label')"
        placeholder=""
        :error="errorMessageKey === POLICY_ERROR ? $t(POLICY_ERROR) : undefined"
      />
      <PasswordChecklist id="password-rules" :password="newPassword" />
    </div>

    <Notice v-if="noticeErrorKey" tone="error" announce>
      <p>{{ $t(noticeErrorKey) }}</p>
    </Notice>

    <RateLimitCountdown
      class="px-3.25"
      :seconds="resetCooldown.remainingSeconds.value"
      message-key="auth-rate-limit-countdown"
      data-test="reset-password-rate-limit"
    />

    <template #actions>
      <SButton
        type="submit"
        variant="primary"
        size="xl"
        :disabled="resetCooldown.isActive.value"
        :loading="loading"
        class="w-full"
        data-test="reset-password-submit"
      >
        {{ $t("auth-reset-password-action") }}
      </SButton>
    </template>

    <template #footer>
      <!-- A link that expired cannot work again, so the page offers a new one. -->
      <RouterLink
        v-if="errorMessageKey === EXPIRED_ERROR"
        :to="{ name: 'forgotPassword' }"
        class="text-base-text-brand hover:text-base-text-brand_hover"
      >
        {{ $t("auth-reset-password-forgot-link") }}
      </RouterLink>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-reset-password-login-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
