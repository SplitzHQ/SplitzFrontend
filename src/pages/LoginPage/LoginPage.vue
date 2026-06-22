<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { toast } from "vue-sonner";

import SButton from "@/components/SButton/SButton.vue";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const { $t } = useFluent();

const email = ref("");
const password = ref("");
const twoFactorCode = ref("");
const showTwoFactor = ref(false);
const showResendConfirmation = ref(false);
const loading = ref(false);
const resendLoading = ref(false);

async function handleLogin() {
  loading.value = true;
  showResendConfirmation.value = false;
  try {
    await userStore.login({
      email: email.value,
      password: password.value,
      twoFactorCode: showTwoFactor.value ? twoFactorCode.value : undefined,
    });
    toast.success($t("auth-login-success"));
    await router.push("/");
  } catch (error) {
    console.error(error);
    showResendConfirmation.value = email.value.trim().length > 0;
    toast.error($t("auth-login-failed"));
  } finally {
    loading.value = false;
  }
}

async function handleResendConfirmation() {
  resendLoading.value = true;
  try {
    await userStore.resendConfirmationEmail(email.value);
    // Keep the response generic so this flow cannot confirm whether an account exists.
    toast.success($t("auth-resend-confirmation-success"));
  } catch (error) {
    console.error(error);
    toast.error($t("auth-resend-confirmation-failed"));
  } finally {
    resendLoading.value = false;
  }
}
</script>

<template>
  <div class="bg-gray-50 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl text-gray-900 mt-6 text-center font-bold tracking-tight">{{ $t("auth-login-title") }}</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="-space-y-px rounded-md shadow-sm">
          <div class="mb-4">
            <label for="email-address" class="sr-only">{{ $t("auth-email-label") }}</label>
            <input
              id="email-address"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              :placeholder="$t('auth-email-placeholder')"
            />
          </div>
          <div class="mb-4">
            <label for="password" class="sr-only">{{ $t("auth-password-label") }}</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              :placeholder="$t('auth-password-placeholder')"
            />
          </div>
          <div v-if="showTwoFactor" class="mb-4">
            <label for="2fa-code" class="sr-only">{{ $t("auth-two-factor-label") }}</label>
            <input
              id="2fa-code"
              v-model="twoFactorCode"
              name="2fa-code"
              type="text"
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              :placeholder="$t('auth-two-factor-placeholder')"
            />
          </div>
        </div>

        <div v-if="showResendConfirmation" class="bg-indigo-50 text-indigo-900 rounded-md p-4 text-sm">
          <p>{{ $t("auth-login-resend-confirmation") }}</p>
          <SButton
            color="brand"
            variant="secondary"
            size="sm"
            :loading="resendLoading"
            class="mt-3"
            data-test="resend-confirmation"
            @click="handleResendConfirmation"
          >
            {{ $t("auth-resend-confirmation-action") }}
          </SButton>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <a
              href="#"
              class="text-indigo-600 hover:text-indigo-500 font-medium"
              data-test="toggle-two-factor"
              @click.prevent="showTwoFactor = !showTwoFactor"
            >
              {{ showTwoFactor ? $t("auth-hide-two-factor") : $t("auth-show-two-factor") }}
            </a>
          </div>
          <div class="text-sm">
            <RouterLink :to="{ name: 'register' }" class="text-indigo-600 hover:text-indigo-500 font-medium">
              {{ $t("auth-login-register-link") }}
            </RouterLink>
          </div>
        </div>

        <div>
          <SButton
            color="brand"
            variant="primary"
            size="lg"
            :loading="loading"
            class="w-full justify-center"
            @click="handleLogin"
          >
            {{ $t("auth-sign-in-action") }}
          </SButton>
        </div>
      </form>
    </div>
  </div>
</template>
