<script setup lang="ts">
import QRCode from "qrcode";
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";

import config from "@/backend/config";
import { SplitzBackendApi, type TwoFactorResponse } from "@/backend/openapi";
import SButton from "@/components/SButton/SButton.vue";
import { useUserStore } from "@/stores/user";

const api = new SplitzBackendApi(config);
const userStore = useUserStore();

const isLoading = ref(true);
const isTwoFactorEnabled = ref(false);
const sharedKey = ref("");
const authenticatorUri = ref("");
const qrCodeUrl = ref("");
const verificationCode = ref("");
const recoveryCodes = ref<string[]>([]);
const showRecoveryCodes = ref(false);

async function loadTwoFactorStatus() {
  isLoading.value = true;
  try {
    const response = await api.accountManage2faPost({ twoFactorRequest: {} });
    await updateState(response);

    if (
      !response.isTwoFactorEnabled && // If not enabled, we might want to ensure we have a shared key to show
      !response.sharedKey
    ) {
      const setupResponse = await api.accountManage2faPost({ twoFactorRequest: { resetSharedKey: true } });
      await updateState(setupResponse);
    }
  } catch (error) {
    console.error("Failed to load 2FA status", error);
    toast.error("Failed to load 2FA status");
  } finally {
    isLoading.value = false;
  }
}

async function updateState(response: TwoFactorResponse) {
  isTwoFactorEnabled.value = response.isTwoFactorEnabled;
  sharedKey.value = response.sharedKey;
  if (response.recoveryCodes) {
    recoveryCodes.value = response.recoveryCodes;
  }

  if (response.sharedKey && userStore.userId) {
    const email = "user@splitz.com"; // TODO: Get actual email
    authenticatorUri.value = `otpauth://totp/Splitz:${email}?secret=${response.sharedKey}&issuer=Splitz`;
    await generateQRCode(authenticatorUri.value);
  }
}

async function generateQRCode(text: string) {
  try {
    qrCodeUrl.value = await QRCode.toDataURL(text);
  } catch (error) {
    console.error(error);
  }
}

async function enableTwoFactor() {
  if (!verificationCode.value) {
    toast.error("Please enter the verification code");
    return;
  }

  try {
    const response = await api.accountManage2faPost({
      twoFactorRequest: {
        enable: true,
        twoFactorCode: verificationCode.value
      }
    });

    if (response.isTwoFactorEnabled) {
      toast.success("2FA enabled successfully");
      await updateState(response);
      showRecoveryCodes.value = true;
    } else {
      toast.error("Failed to enable 2FA. Check the code.");
    }
  } catch (error) {
    console.error("Failed to enable 2FA", error);
    toast.error("Failed to enable 2FA");
  }
}

async function disableTwoFactor() {
  // eslint-disable-next-line no-alert
  if (!confirm("Are you sure you want to disable 2FA?")) return;

  try {
    const response = await api.accountManage2faPost({
      twoFactorRequest: {
        enable: false
      }
    });
    await updateState(response);
    toast.success("2FA disabled successfully");
    showRecoveryCodes.value = false;
    verificationCode.value = "";

    // Re-fetch shared key for next setup
    const setupResponse = await api.accountManage2faPost({ twoFactorRequest: { resetSharedKey: true } });
    await updateState(setupResponse);
  } catch (error) {
    console.error("Failed to disable 2FA", error);
    toast.error("Failed to disable 2FA");
  }
}

async function generateRecoveryCodes() {
  try {
    const response = await api.accountManage2faPost({
      twoFactorRequest: {
        resetRecoveryCodes: true
      }
    });
    await updateState(response);
    toast.success("Recovery codes generated");
    showRecoveryCodes.value = true;
  } catch (error) {
    console.error("Failed to generate recovery codes", error);
    toast.error("Failed to generate recovery codes");
  }
}

onMounted(() => {
  void loadTwoFactorStatus();
});
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="text-2xl text-gray-900 mb-6 font-bold">Two-Factor Authentication (2FA)</h1>

    <div v-if="isLoading" class="text-center">
      <p>Loading...</p>
    </div>

    <div v-else>
      <div v-if="isTwoFactorEnabled" class="bg-green-50 mb-6 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-green-800 text-sm font-medium">2FA is currently enabled</h3>
            <div class="text-green-700 mt-2 text-sm">
              <p>Your account is secure.</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-yellow-50 mb-6 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-yellow-800 text-sm font-medium">2FA is not enabled</h3>
            <div class="text-yellow-700 mt-2 text-sm">
              <p>Enable 2FA to increase the security of your account.</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isTwoFactorEnabled">
        <div class="mb-6">
          <h2 class="text-gray-900 mb-2 text-lg font-medium">1. Scan QR Code</h2>
          <p class="text-gray-500 mb-4 text-sm">
            Use an authenticator app (like Google Authenticator or Microsoft Authenticator) to scan the QR code below.
          </p>
          <div class="border-gray-200 mx-auto mb-4 flex w-fit justify-center rounded border bg-white p-4">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="2FA QR Code" />
            <div v-else class="bg-gray-100 text-gray-400 flex h-48 w-48 items-center justify-center">Loading QR...</div>
          </div>
          <p class="text-gray-500 text-center text-sm">
            Or enter this key manually:
            <code class="bg-gray-100 rounded px-1 py-0.5 font-mono select-all">{{ sharedKey }}</code>
          </p>
        </div>

        <div class="mb-6">
          <h2 class="text-gray-900 mb-2 text-lg font-medium">2. Enter Verification Code</h2>
          <p class="text-gray-500 mb-4 text-sm">Enter the 6-digit code from your authenticator app.</p>
          <div class="flex gap-4">
            <label for="verification-code" class="sr-only">Verification Code</label>
            <input
              id="verification-code"
              v-model="verificationCode"
              type="text"
              placeholder="000000"
              class="text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 block w-40 rounded-md border-0 px-3 py-1.5 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
            />
            <SButton color="brand" variant="primary" size="md" @click="enableTwoFactor"> Verify & Enable </SButton>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="mb-6">
          <h2 class="text-gray-900 mb-4 text-lg font-medium">Actions</h2>
          <div class="flex gap-4">
            <SButton color="error" variant="outline" size="md" @click="disableTwoFactor"> Disable 2FA </SButton>
            <SButton color="neutral" variant="outline" size="md" @click="generateRecoveryCodes">
              Reset Recovery Codes
            </SButton>
          </div>
        </div>

        <div v-if="recoveryCodes.length > 0 || showRecoveryCodes" class="mt-8 border-t pt-6">
          <h2 class="text-gray-900 mb-2 text-lg font-medium">Recovery Codes</h2>
          <p class="text-gray-500 mb-4 text-sm">
            Save these codes in a safe place. You can use them to log in if you lose access to your authenticator app.
          </p>
          <div class="bg-gray-50 border-gray-200 rounded-md border p-4">
            <ul class="grid grid-cols-2 gap-2 font-mono text-sm">
              <li v-for="code in recoveryCodes" :key="code">{{ code }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
