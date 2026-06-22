<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import SButton from "@/components/SButton/SButton.vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const { $t } = useFluent();
const router = useRouter();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const registrationComplete = ref(false);
const registrationSuccessMessageKey = ref("auth-register-success-email-enabled");

async function handleRegister() {
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
    const capabilities = await userStore.fetchEmailCapabilities();
    if (capabilities.emailEnabled === true) {
      registrationComplete.value = true;
      toast.success($t("auth-register-success-email-enabled"));
      return;
    }

    toast.success($t("auth-register-success"));
    await router.push({ name: "login" });
  } catch (error) {
    console.error(error);
    toast.error($t("auth-register-failed"));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-gray-50 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl text-gray-900 mt-6 text-center font-bold tracking-tight">
          {{ $t(registrationComplete ? "auth-register-complete-title" : "auth-register-title") }}
        </h2>
      </div>
      <div v-if="registrationComplete" class="bg-indigo-50 text-indigo-900 space-y-6 rounded-md p-4 text-sm">
        <p>{{ $t("auth-register-success-email-enabled") }}</p>
        <RouterLink :to="{ name: 'login' }" class="text-indigo-600 hover:text-indigo-500 font-medium">
          {{ $t("auth-register-login-link") }}
        </RouterLink>
      </div>
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleRegister">
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
              autocomplete="new-password"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              :placeholder="$t('auth-password-placeholder')"
            />
          </div>
          <div class="mb-4">
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
        </div>

        <div class="flex items-center justify-end">
          <div class="text-sm">
            <RouterLink :to="{ name: 'login' }" class="text-indigo-600 hover:text-indigo-500 font-medium">
              {{ $t("auth-register-sign-in-link") }}
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
            @click="handleRegister"
          >
            {{ $t("auth-register-action") }}
          </SButton>
        </div>
      </form>
    </div>
  </div>
</template>
