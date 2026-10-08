<script setup lang="ts">
import { PhEnvelopeSimple, PhPaperPlaneTilt, PhWarningCircle } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { toast } from "vue-sonner";

import AuthShell from "@/components/AuthShell/AuthShell.vue";
import Notice from "@/components/Notice/Notice.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import StatusBadge from "@/components/StatusBadge/StatusBadge.vue";
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
    toast.success($t("auth-forgot-password-success-toast"));
  } catch (error) {
    console.error(error);
    if (!recoveryCooldown.startFromError(error)) {
      errorMessageKey.value = "auth-forgot-password-error";
      toast.error($t("auth-forgot-password-error"));
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthShell
    v-if="state === 'submitted'"
    centered
    :title="$t('auth-forgot-password-success-title')"
    :subtitle="$t('auth-forgot-password-success-body')"
  >
    <template #hero>
      <div class="flex justify-center">
        <StatusBadge tone="success">
          <PhPaperPlaneTilt weight="duotone" />
        </StatusBadge>
      </div>
    </template>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-forgot-password-login-link") }}
      </RouterLink>
    </template>
  </AuthShell>

  <AuthShell v-else :title="$t('auth-forgot-password-title')" :subtitle="$t('auth-forgot-password-body')">
    <form class="flex flex-col gap-5" @submit.prevent="handleForgotPassword">
      <Notice v-if="state === 'unavailable'" tone="warning" :title="$t('auth-forgot-password-unavailable-title')">
        <template #icon>
          <PhWarningCircle />
        </template>
        <p>{{ $t("auth-forgot-password-unavailable-body") }}</p>
      </Notice>

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
        :label="$t('auth-email-label')"
        :placeholder="$t('auth-email-placeholder')"
      >
        <template #icon>
          <PhEnvelopeSimple />
        </template>
      </TextInput>

      <Notice v-if="errorMessageKey" tone="error">
        <template #icon>
          <PhWarningCircle />
        </template>
        <p>{{ $t(errorMessageKey) }}</p>
      </Notice>

      <RateLimitCountdown
        :seconds="recoveryCooldown.remainingSeconds.value"
        message-key="auth-rate-limit-countdown"
        data-test="recovery-rate-limit"
      />

      <SButton
        type="submit"
        color="brand"
        variant="primary"
        size="xxl"
        :disabled="submitDisabled"
        :loading="loading"
        class="w-full"
        data-test="forgot-password-submit"
      >
        {{ $t("auth-forgot-password-action") }}
      </SButton>
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'login' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-forgot-password-login-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
