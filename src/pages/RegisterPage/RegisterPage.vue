<script setup lang="ts">
import { PhPaperPlaneTilt } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
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

const userStore = useUserStore();
const { $t } = useFluent();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const registrationComplete = ref(false);
const registrationCooldown = useRateLimitCooldown();
const errorKey = ref<string | null>(null);

const POLICY_ERROR = "auth-password-policy";

// An error about the password shows under its field. The Notice shows only an error about the request.
const noticeErrorKey = computed(() => (errorKey.value === POLICY_ERROR ? null : errorKey.value));

async function handleRegister() {
  if (loading.value || registrationCooldown.isActive.value) {
    return;
  }

  errorKey.value = null;

  if (!meetsPasswordPolicy(password.value)) {
    errorKey.value = POLICY_ERROR;
    return;
  }

  loading.value = true;
  try {
    await userStore.register({
      email: email.value,
      password: password.value,
    });
    let emailEnabled = false;
    try {
      const capabilities = await userStore.fetchEmailCapabilities();
      emailEnabled = capabilities.emailEnabled === true;
    } catch (error) {
      console.error("Email capability check failed after registration", error);
    }

    if (emailEnabled) {
      registrationComplete.value = true;
      return;
    }

    toast.success($t("auth-register-success"));
    await router.push({ name: "login" });
  } catch (error) {
    console.error(error);
    if (!registrationCooldown.startFromError(error)) {
      errorKey.value = await getRegistrationErrorMessageKey(error);
    }
  } finally {
    loading.value = false;
  }
}

/** Selects a message from the Identity error codes. Other errors get the general message. */
async function getRegistrationErrorMessageKey(error: unknown): Promise<string> {
  if (error instanceof ResponseError && error.response.status === 400) {
    try {
      const body = (await error.response.clone().json()) as HttpValidationProblemDetails | null;
      const errorCodes = Object.keys(body?.errors ?? {});
      if (errorCodes.includes("DuplicateEmail") || errorCodes.includes("DuplicateUserName")) {
        return "auth-register-email-already-registered";
      }
      if (errorCodes.some((code) => code.startsWith("Password"))) {
        return POLICY_ERROR;
      }
    } catch {
      return "auth-register-failed";
    }
  }

  return "auth-register-failed";
}
</script>

<template>
  <AuthShell
    v-if="registrationComplete"
    status
    :title="$t('auth-register-complete-title')"
    :subtitle="$t('auth-register-sent-body', { email })"
    :highlight="email"
  >
    <template #icon>
      <AuthStatusIcon tone="success">
        <PhPaperPlaneTilt />
      </AuthStatusIcon>
    </template>

    <template #actions>
      <SLinkButton variant="primary" size="xl" class="w-full" href="/login">
        {{ $t("auth-register-login-link") }}
      </SLinkButton>
    </template>
  </AuthShell>

  <AuthShell
    v-else
    :title="$t('auth-register-title')"
    :subtitle="$t('auth-register-subtitle')"
    @submit="handleRegister"
  >
    <TextInput
      id="email-address"
      v-model="email"
      name="email"
      type="email"
      autocomplete="email"
      inputmode="email"
      required
      :label="$t('auth-email-label')"
      :placeholder="$t('auth-email-placeholder')"
    />

    <div class="flex flex-col gap-3">
      <TextInput
        id="password"
        v-model="password"
        name="password"
        type="password"
        autocomplete="new-password"
        required
        described-by="password-rules"
        :label="$t('auth-password-label')"
        placeholder=""
        :error="errorKey === POLICY_ERROR ? $t(POLICY_ERROR) : undefined"
      />
      <PasswordChecklist id="password-rules" :password="password" />
    </div>

    <RateLimitCountdown
      class="px-3.25"
      :seconds="registrationCooldown.remainingSeconds.value"
      message-key="auth-rate-limit-countdown"
      data-test="register-rate-limit"
    />

    <Notice v-if="noticeErrorKey" tone="error" announce data-test="register-error">
      <p>{{ $t(noticeErrorKey) }}</p>
    </Notice>

    <template #actions>
      <SButton
        type="submit"
        variant="primary"
        size="xl"
        :disabled="registrationCooldown.isActive.value"
        :loading="loading"
        class="w-full"
        data-test="register-submit"
      >
        {{ $t("auth-register-action") }}
      </SButton>
    </template>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="flex gap-1 text-base-text-brand underline-offset-2 hover:underline">
        <span class="font-normal text-base-text-secondary">{{ $t("auth-register-sign-in-lead") }}</span>
        {{ $t("auth-register-sign-in-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
