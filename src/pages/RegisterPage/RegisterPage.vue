<script setup lang="ts">
import { PhEnvelopeSimple, PhLockSimple, PhPaperPlaneTilt } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { ResponseError, type HttpValidationProblemDetails } from "@/backend/openapi";
import AuthShell from "@/components/AuthShell/AuthShell.vue";
import Notice from "@/components/Notice/Notice.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import SLinkButton from "@/components/SButton/SLinkButton.vue";
import StatusBadge from "@/components/StatusBadge/StatusBadge.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const { $t } = useFluent();
const router = useRouter();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const registrationComplete = ref(false);
const registrationCooldown = useRateLimitCooldown();
const errorKey = ref<string | null>(null);

async function handleRegister() {
  if (loading.value || registrationCooldown.isActive.value) {
    return;
  }

  // The confirm field already shows the error text, so a toast would repeat it.
  if (password.value !== confirmPassword.value) {
    return;
  }

  loading.value = true;
  errorKey.value = null;
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

/** Select the registered-email message only for explicit Identity duplicate errors. */
async function getRegistrationErrorMessageKey(error: unknown): Promise<string> {
  if (error instanceof ResponseError && error.response.status === 400) {
    try {
      const body = (await error.response.clone().json()) as HttpValidationProblemDetails | null;
      const errorCodes = Object.keys(body?.errors ?? {});
      if (errorCodes.includes("DuplicateEmail") || errorCodes.includes("DuplicateUserName")) {
        return "auth-register-email-already-registered";
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
    centered
    :title="$t('auth-register-complete-title')"
    :subtitle="$t('auth-register-success-email-enabled')"
  >
    <template #hero>
      <div class="flex justify-center">
        <StatusBadge tone="success">
          <PhPaperPlaneTilt weight="duotone" />
        </StatusBadge>
      </div>
    </template>

    <SLinkButton variant="primary" size="xl" class="w-full" href="/login">
      {{ $t("auth-register-login-link") }}
    </SLinkButton>
  </AuthShell>

  <AuthShell v-else :title="$t('auth-register-title')" :subtitle="$t('auth-register-subtitle')">
    <form class="flex flex-col gap-5" @submit.prevent="handleRegister">
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
      >
        <template #icon>
          <PhEnvelopeSimple />
        </template>
      </TextInput>

      <TextInput
        id="password"
        v-model="password"
        name="password"
        type="password"
        autocomplete="new-password"
        required
        :label="$t('auth-password-label')"
        :placeholder="$t('auth-password-placeholder')"
        :hint="$t('auth-password-hint')"
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
        :error="
          confirmPassword.length > 0 && confirmPassword !== password ? $t('auth-register-password-mismatch') : undefined
        "
      >
        <template #icon>
          <PhLockSimple />
        </template>
      </TextInput>

      <RateLimitCountdown
        :seconds="registrationCooldown.remainingSeconds.value"
        message-key="auth-rate-limit-countdown"
        data-test="register-rate-limit"
      />

      <Notice v-if="errorKey" tone="error" announce data-test="register-error">
        <p>{{ $t(errorKey) }}</p>
      </Notice>

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
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-register-sign-in-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
