<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { toast } from "vue-sonner";

import SButton from "@/components/SButton/SButton.vue";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const twoFactorCode = ref("");
const showTwoFactor = ref(false);
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    await userStore.login({
      email: email.value,
      password: password.value,
      twoFactorCode: showTwoFactor.value ? twoFactorCode.value : undefined
    });
    toast.success("Logged in successfully");
    await router.push("/");
  } catch (error: any) {
    console.error(error);
    toast.error("Login failed. Please check your credentials.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-gray-50 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl text-gray-900 mt-6 text-center font-bold tracking-tight">Sign in to your account</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="-space-y-px rounded-md shadow-sm">
          <div class="mb-4">
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="Email address"
            />
          </div>
          <div class="mb-4">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="Password"
            />
          </div>
          <div v-if="showTwoFactor" class="mb-4">
            <label for="2fa-code" class="sr-only">2FA Code</label>
            <input
              id="2fa-code"
              v-model="twoFactorCode"
              name="2fa-code"
              type="text"
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="2FA Code"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <a
              href="#"
              class="text-indigo-600 hover:text-indigo-500 font-medium"
              @click.prevent="showTwoFactor = !showTwoFactor"
            >
              {{ showTwoFactor ? "Hide 2FA" : "I have a 2FA code" }}
            </a>
          </div>
          <div class="text-sm">
            <RouterLink to="/register" class="text-indigo-600 hover:text-indigo-500 font-medium">
              Don't have an account? Register
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
            Sign in
          </SButton>
        </div>
      </form>
    </div>
  </div>
</template>
