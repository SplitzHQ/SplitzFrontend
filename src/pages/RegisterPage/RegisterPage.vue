<script setup lang="ts">
import { PhEnvelopeSimple, PhLockSimple, PhPaperPlaneTilt } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import AuthShell from "@/components/AuthShell/AuthShell.vue";
import StatusBadge from "@/components/AuthShell/StatusBadge.vue";
import FormField from "@/components/FormField/FormField.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
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

async function handleRegister() {
  if (loading.value || registrationCooldown.isActive.value) {
    return;
  }

  if (password.value !== confirmPassword.value) {
    toast.error($t("auth-register-password-mismatch"));
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
      toast.success($t("auth-register-success-email-enabled"));
      return;
    }

    toast.success($t("auth-register-success"));
    await router.push({ name: "login" });
  } catch (error) {
    console.error(error);
    if (!registrationCooldown.startFromError(error)) {
      toast.error($t("auth-register-failed"));
    }
  } finally {
    loading.value = false;
  }
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

    <SButton color="brand" variant="primary" size="xxl" class="w-full" @click="router.push({ name: 'login' })">
      {{ $t("auth-register-login-link") }}
    </SButton>
  </AuthShell>

  <AuthShell v-else :title="$t('auth-register-title')" :subtitle="$t('auth-register-subtitle')">
    <form class="flex flex-col gap-5" @submit.prevent="handleRegister">
      <FormField
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
      </FormField>

      <FormField
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
      </FormField>

      <FormField
        id="confirm-password"
        v-model="confirmPassword"
        name="confirm-password"
        type="password"
        autocomplete="new-password"
        required
        :label="$t('auth-confirm-password-label')"
        :placeholder="$t('auth-confirm-password-placeholder')"
        :invalid="confirmPassword.length > 0 && confirmPassword !== password"
      >
        <template #icon>
          <PhLockSimple />
        </template>
      </FormField>

      <RateLimitCountdown
        :seconds="registrationCooldown.remainingSeconds.value"
        message-key="auth-rate-limit-countdown"
        data-test="register-rate-limit"
      />

      <SButton
        type="submit"
        color="brand"
        variant="primary"
        size="xxl"
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
