<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import SButton from "@/components/SButton/SButton.vue";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { $t } = useFluent();

const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMessageKey = ref<string | null>(null);

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
  if (!resetRequestContext.value || loading.value) {
    return;
  }

  errorMessageKey.value = null;

  if (newPassword.value !== confirmPassword.value) {
    errorMessageKey.value = "auth-reset-password-mismatch";
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
    console.error(error);
    errorMessageKey.value = "auth-reset-password-error";
  } finally {
    loading.value = false;
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
    <section class="w-full max-w-md space-y-8">
      <div class="space-y-3 text-center">
        <h1 class="text-3xl text-gray-900 font-bold tracking-tight">
          {{ $t(isInvalidLink ? "auth-reset-password-invalid-title" : "auth-reset-password-title") }}
        </h1>
        <p class="text-gray-600 text-sm">
          {{ $t(isInvalidLink ? "auth-reset-password-invalid-body" : "auth-reset-password-body") }}
        </p>
      </div>

      <div v-if="isInvalidLink" class="bg-indigo-50 text-indigo-900 rounded-md p-4 text-sm">
        <p>{{ $t("auth-reset-password-invalid-help") }}</p>
      </div>

      <form v-else class="space-y-6" @submit.prevent="handleResetPassword">
        <div class="space-y-4">
          <div>
            <label for="new-password" class="sr-only">{{ $t("auth-new-password-label") }}</label>
            <input
              id="new-password"
              v-model="newPassword"
              name="new-password"
              type="password"
              autocomplete="new-password"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              :placeholder="$t('auth-new-password-placeholder')"
            />
          </div>
          <div>
            <label for="confirm-password" class="sr-only">{{ $t("auth-confirm-password-label") }}</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              :placeholder="$t('auth-confirm-password-placeholder')"
            />
          </div>
          <p v-if="errorMessageKey" class="text-red-600 text-sm">{{ $t(errorMessageKey) }}</p>
        </div>

        <SButton
          color="brand"
          variant="primary"
          size="lg"
          :loading="loading"
          class="w-full justify-center"
          data-test="reset-password-submit"
          @click="handleResetPassword"
        >
          {{ $t("auth-reset-password-action") }}
        </SButton>
      </form>

      <div class="flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-center">
        <RouterLink :to="{ name: 'forgotPassword' }" class="text-indigo-600 hover:text-indigo-500 font-medium">
          {{ $t("auth-reset-password-forgot-link") }}
        </RouterLink>
        <RouterLink :to="{ name: 'login' }" class="text-indigo-600 hover:text-indigo-500 font-medium">
          {{ $t("auth-reset-password-login-link") }}
        </RouterLink>
      </div>
    </section>
  </main>
</template>
