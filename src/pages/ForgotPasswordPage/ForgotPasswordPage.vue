<script setup lang="ts">
import { PhPaperPlaneTilt } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import AuthShell from "@/components/AuthShell/AuthShell.vue";
import AuthStatusIcon from "@/components/AuthShell/AuthStatusIcon.vue";
import Notice from "@/components/Notice/Notice.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import SLinkButton from "@/components/SButton/SLinkButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";
import { useUserStore } from "@/stores/user";

type RecoveryState = "checking" | "available" | "unavailable" | "submitted";

const userStore = useUserStore();
const { $t } = useFluent();

const email = ref("");
const state = ref<RecoveryState>("checking");
const loading = ref(false);
const errorMessageKey = ref<string | null>(null);
const recoveryCooldown = useRateLimitCooldown();

const inputDisabled = computed(() => state.value === "checking" || state.value === "unavailable");
const submitDisabled = computed(() => inputDisabled.value || loading.value || recoveryCooldown.isActive.value);

onMounted(async () => {
  try {
    const capabilities = await userStore.fetchEmailCapabilities();
    // Password recovery depends on outbound email; keep the form closed when the backend reports it unavailable.
    state.value = capabilities.passwordResetEnabled === true ? "available" : "unavailable";
  } catch (error) {
    console.error(error);
    state.value = "unavailable";
  }
});

async function handleForgotPassword() {
  if (submitDisabled.value) {
    return;
  }

  loading.value = true;
  errorMessageKey.value = null;
  try {
    await userStore.forgotPassword(email.value);
    state.value = "submitted";
  } catch (error) {
    console.error(error);
    if (!recoveryCooldown.startFromError(error)) {
      errorMessageKey.value = "auth-forgot-password-error";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthShell
    v-if="state === 'submitted'"
    status
    :title="$t('auth-forgot-password-success-title')"
    :subtitle="$t('auth-forgot-password-success-body', { email })"
    :highlight="email"
  >
    <template #icon>
      <AuthStatusIcon tone="success">
        <PhPaperPlaneTilt />
      </AuthStatusIcon>
    </template>

    <template #actions>
      <SLinkButton variant="primary" size="xl" class="w-full" href="/login">
        {{ $t("auth-forgot-password-login-link") }}
      </SLinkButton>
    </template>
  </AuthShell>

  <AuthShell
    v-else
    :title="$t('auth-forgot-password-title')"
    :subtitle="$t('auth-forgot-password-body')"
    @submit="handleForgotPassword"
  >
    <TextInput
      id="forgot-password-email"
      v-model="email"
      name="email"
      type="email"
      autocomplete="email"
      inputmode="email"
      required
      :disabled="inputDisabled"
      :invalid="errorMessageKey !== null"
      :described-by="errorMessageKey ? 'forgot-password-error' : undefined"
      :label="$t('auth-email-label')"
      :placeholder="$t('auth-email-placeholder')"
    />

    <Notice
      v-if="state === 'unavailable'"
      tone="warning"
      :title="$t('auth-forgot-password-unavailable-title')"
      announce
    >
      <p>{{ $t("auth-forgot-password-unavailable-body") }}</p>
    </Notice>

    <Notice v-if="errorMessageKey" id="forgot-password-error" tone="error" announce>
      <p>{{ $t(errorMessageKey) }}</p>
    </Notice>

    <RateLimitCountdown
      class="px-3.25"
      :seconds="recoveryCooldown.remainingSeconds.value"
      message-key="auth-rate-limit-countdown"
      data-test="recovery-rate-limit"
    />

    <template #actions>
      <SButton
        type="submit"
        variant="primary"
        size="xl"
        :disabled="submitDisabled"
        :loading="loading"
        class="w-full"
        data-test="forgot-password-submit"
      >
        {{ $t("auth-forgot-password-action") }}
      </SButton>
    </template>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-forgot-password-login-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
