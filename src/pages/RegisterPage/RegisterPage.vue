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
const confirmPassword = ref("");
const loading = ref(false);

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    toast.error("Passwords do not match");
    return;
  }

  loading.value = true;
  try {
    await userStore.register({
      email: email.value,
      password: password.value
    });
    toast.success("Registration successful. Please login.");
    await router.push("/login");
  } catch (error: any) {
    console.error(error);
    toast.error("Registration failed.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-gray-50 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl text-gray-900 mt-6 text-center font-bold tracking-tight">Create your account</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
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
              autocomplete="new-password"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="Password"
            />
          </div>
          <div class="mb-4">
            <label for="confirm-password" class="sr-only">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 relative block w-full rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="Confirm Password"
            />
          </div>
        </div>

        <div class="flex items-center justify-end">
          <div class="text-sm">
            <RouterLink to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
              Already have an account? Sign in
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
            Register
          </SButton>
        </div>
      </form>
    </div>
  </div>
</template>
