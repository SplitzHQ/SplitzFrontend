<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { toast } from "vue-sonner";

import SButton from "@/components/SButton/SButton.vue";
import { useUserStore } from "@/stores/user";

type RecoveryState = "checking" | "available" | "unavailable" | "submitted";

const userStore = useUserStore();
const { $t } = useFluent();

const email = ref("");
const state = ref<RecoveryState>("checking");
const loading = ref(false);
const errorMessageKey = ref<string | null>(null);

const formDisabled = computed(() => state.value === "checking" || state.value === "unavailable" || loading.value);

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
  if (formDisabled.value) {
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
    errorMessageKey.value = "auth-forgot-password-error";
    toast.error($t("auth-forgot-password-error"));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="bg-gray-50 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <section class="w-full max-w-md space-y-8">
      <div class="space-y-3 text-center">
        <h1 class="text-3xl text-gray-900 font-bold tracking-tight">
          {{ $t(state === "submitted" ? "auth-forgot-password-success-title" : "auth-forgot-password-title") }}
        </h1>
        <p class="text-gray-600 text-sm">
          {{ $t(state === "submitted" ? "auth-forgot-password-success-body" : "auth-forgot-password-body") }}
        </p>
      </div>

      <div v-if="state === 'unavailable'" class="bg-indigo-50 text-indigo-900 rounded-md p-4 text-sm">
        <p class="font-medium">{{ $t("auth-forgot-password-unavailable-title") }}</p>
        <p class="mt-2">{{ $t("auth-forgot-password-unavailable-body") }}</p>
      </div>

      <form v-if="state !== 'submitted'" class="space-y-6" @submit.prevent="handleForgotPassword">
        <div class="space-y-2">
          <label for="forgot-password-email" class="sr-only">{{ $t("auth-email-label") }}</label>
          <input
            id="forgot-password-email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            :disabled="formDisabled"
            class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 disabled:bg-gray-100 disabled:text-gray-500 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
            :placeholder="$t('auth-email-placeholder')"
          />
          <p v-if="errorMessageKey" class="text-red-600 text-sm">{{ $t(errorMessageKey) }}</p>
        </div>

        <SButton
          color="brand"
          variant="primary"
          size="lg"
          :disabled="formDisabled"
          :loading="loading"
          class="w-full justify-center"
          data-test="forgot-password-submit"
          @click="handleForgotPassword"
        >
          {{ $t("auth-forgot-password-action") }}
        </SButton>
      </form>

      <div class="text-center text-sm">
        <RouterLink :to="{ name: 'login' }" class="text-indigo-600 hover:text-indigo-500 font-medium">
          {{ $t("auth-forgot-password-login-link") }}
        </RouterLink>
      </div>
    </section>
  </main>
</template>
