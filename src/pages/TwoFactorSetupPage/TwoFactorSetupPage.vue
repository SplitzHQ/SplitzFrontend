<script setup lang="ts">
import { PhCopy, PhKey, PhShieldCheck, PhShieldWarning } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import QRCode from "qrcode";
import { ref, onMounted, watch } from "vue";
import { toast } from "vue-sonner";

import config from "@/backend/config";
import { SplitzBackendApi, type TwoFactorResponse } from "@/backend/openapi";
import FormField from "@/components/FormField/FormField.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { copyToClipboard } from "@/libs/copy-to-clipboard";
import { useUserStore } from "@/stores/user";

const api = new SplitzBackendApi(config);
const userStore = useUserStore();
const { $t } = useFluent();

const isLoading = ref(true);
const isTwoFactorEnabled = ref(false);
const sharedKey = ref("");
const qrCodeUrl = ref("");
const verificationCode = ref("");
const recoveryCodes = ref<string[]>([]);
const enabling = ref(false);
const disabling = ref(false);
const generatingCodes = ref(false);
const showDisableConfirm = ref(false);

async function loadTwoFactorStatus() {
  isLoading.value = true;
  try {
    const response = await api.accountManage2faPost({ twoFactorRequest: {} });
    updateState(response);

    if (
      !response.isTwoFactorEnabled && // If not enabled, we might want to ensure we have a shared key to show
      !response.sharedKey
    ) {
      const setupResponse = await api.accountManage2faPost({ twoFactorRequest: { resetSharedKey: true } });
      updateState(setupResponse);
    }
  } catch (error) {
    console.error("Failed to load 2FA status", error);
    toast.error($t("two-factor-load-failed"));
  } finally {
    isLoading.value = false;
  }
}

function updateState(response: TwoFactorResponse) {
  isTwoFactorEnabled.value = response.isTwoFactorEnabled;
  sharedKey.value = response.sharedKey;
  if (response.recoveryCodes) {
    recoveryCodes.value = response.recoveryCodes;
  }
}

// The user profile loads independently of the 2FA status, so build the QR code whenever both inputs are ready.
watch(
  [sharedKey, () => userStore.user?.email],
  ([key, email]) => {
    if (!key || !email) {
      qrCodeUrl.value = "";
      return;
    }

    void generateQRCode(`otpauth://totp/Splitz:${email}?secret=${key}&issuer=Splitz`);
  },
  { immediate: true }
);

async function generateQRCode(text: string) {
  try {
    qrCodeUrl.value = await QRCode.toDataURL(text, { margin: 1, width: 192 });
  } catch (error) {
    console.error(error);
  }
}

async function enableTwoFactor() {
  if (enabling.value) return;

  if (!verificationCode.value.trim()) {
    toast.error($t("two-factor-code-required"));
    return;
  }

  enabling.value = true;
  try {
    const response = await api.accountManage2faPost({
      twoFactorRequest: {
        enable: true,
        twoFactorCode: verificationCode.value.trim(),
      },
    });

    if (response.isTwoFactorEnabled) {
      toast.success($t("two-factor-enable-success"));
      updateState(response);
      verificationCode.value = "";
    } else {
      toast.error($t("two-factor-enable-invalid"));
    }
  } catch (error) {
    console.error("Failed to enable 2FA", error);
    toast.error($t("two-factor-enable-failed"));
  } finally {
    enabling.value = false;
  }
}

async function disableTwoFactor() {
  if (disabling.value) return;

  disabling.value = true;
  try {
    const response = await api.accountManage2faPost({
      twoFactorRequest: {
        enable: false,
      },
    });
    updateState(response);
    toast.success($t("two-factor-disable-success"));
    showDisableConfirm.value = false;
    recoveryCodes.value = [];
    verificationCode.value = "";

    // Re-fetch shared key for next setup
    const setupResponse = await api.accountManage2faPost({ twoFactorRequest: { resetSharedKey: true } });
    updateState(setupResponse);
  } catch (error) {
    console.error("Failed to disable 2FA", error);
    toast.error($t("two-factor-disable-failed"));
  } finally {
    disabling.value = false;
  }
}

async function generateRecoveryCodes() {
  if (generatingCodes.value) return;

  generatingCodes.value = true;
  try {
    const response = await api.accountManage2faPost({
      twoFactorRequest: {
        resetRecoveryCodes: true,
      },
    });
    updateState(response);
    toast.success($t("two-factor-recovery-codes-success"));
  } catch (error) {
    console.error("Failed to generate recovery codes", error);
    toast.error($t("two-factor-recovery-codes-failed"));
  } finally {
    generatingCodes.value = false;
  }
}

async function copyText(text: string) {
  if (await copyToClipboard(text)) {
    toast.success($t("two-factor-copy-success"));
  } else {
    toast.error($t("two-factor-copy-failed"));
  }
}

onMounted(() => {
  void loadTwoFactorStatus();
});
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <span class="text-base font-medium text-base-text-primary">{{ $t("two-factor-title") }}</span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4 px-4 pt-2 pb-10">
        <!-- Loading skeleton -->
        <template v-if="isLoading">
          <div class="h-24 skeleton rounded-3xl" />
          <div class="h-80 skeleton rounded-3xl" />
          <div class="h-40 skeleton rounded-3xl" />
        </template>

        <template v-else>
          <!-- Status card -->
          <div
            :class="[
              'flex items-start gap-4 rounded-3xl p-5',
              isTwoFactorEnabled ? 'bg-util-color-success-50' : 'bg-util-color-warning-50',
            ]"
          >
            <div
              :class="[
                'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                isTwoFactorEnabled
                  ? 'bg-util-color-success-100 text-util-color-success-700'
                  : 'bg-util-color-warning-100 text-util-color-warning-700',
              ]"
            >
              <PhShieldCheck v-if="isTwoFactorEnabled" weight="duotone" class="size-7" />
              <PhShieldWarning v-else weight="duotone" class="size-7" />
            </div>
            <div class="flex min-w-0 flex-col gap-1">
              <p
                :class="[
                  'text-base font-semibold',
                  isTwoFactorEnabled ? 'text-util-color-success-900' : 'text-util-color-warning-900',
                ]"
              >
                {{ $t(isTwoFactorEnabled ? "two-factor-enabled-title" : "two-factor-disabled-title") }}
              </p>
              <p
                :class="['text-sm', isTwoFactorEnabled ? 'text-util-color-success-800' : 'text-util-color-warning-800']"
              >
                {{ $t(isTwoFactorEnabled ? "two-factor-enabled-body" : "two-factor-disabled-body") }}
              </p>
            </div>
          </div>

          <!-- Setup flow -->
          <template v-if="!isTwoFactorEnabled">
            <section class="flex flex-col gap-4 rounded-3xl bg-util-alpha-black-5 p-5">
              <div class="flex items-start gap-3">
                <span
                  class="flex size-7 shrink-0 items-center justify-center rounded-full bg-util-color-brand-700 text-sm font-bold text-base-text-primary-reverse"
                >
                  1
                </span>
                <div class="flex flex-col gap-1">
                  <h2 class="text-base font-semibold text-base-text-primary">{{ $t("two-factor-step-scan-title") }}</h2>
                  <p class="text-sm text-base-text-tertiary">{{ $t("two-factor-step-scan-body") }}</p>
                </div>
              </div>

              <!-- QR codes must stay dark-on-white to scan reliably, so this tile ignores the theme. -->
              <div class="mx-auto flex size-56 items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
                <img v-if="qrCodeUrl" :src="qrCodeUrl" :alt="$t('two-factor-qr-alt')" class="size-full" />
                <p v-else class="text-sm text-core-color-grey-400">{{ $t("two-factor-qr-loading") }}</p>
              </div>

              <div class="flex flex-col gap-1.5">
                <p class="text-xs font-semibold tracking-wide text-base-text-quaternary uppercase">
                  {{ $t("two-factor-manual-key-label") }}
                </p>
                <div class="flex items-center gap-2 rounded-2xl bg-base-bg-primary px-4 py-2">
                  <PhKey class="size-5 shrink-0 text-base-fg-quaternary" />
                  <code class="min-w-0 flex-1 font-mono text-sm wrap-anywhere text-base-text-primary select-all">
                    {{ sharedKey }}
                  </code>
                  <SIconButton
                    variant="ghost"
                    color="neutral"
                    size="md"
                    :aria-label="$t('two-factor-copy-key')"
                    @click="copyText(sharedKey)"
                  >
                    <PhCopy />
                  </SIconButton>
                </div>
              </div>
            </section>

            <section class="flex flex-col gap-4 rounded-3xl bg-util-alpha-black-5 p-5">
              <div class="flex items-start gap-3">
                <span
                  class="flex size-7 shrink-0 items-center justify-center rounded-full bg-util-color-brand-700 text-sm font-bold text-base-text-primary-reverse"
                >
                  2
                </span>
                <div class="flex flex-col gap-1">
                  <h2 class="text-base font-semibold text-base-text-primary">
                    {{ $t("two-factor-step-verify-title") }}
                  </h2>
                  <p class="text-sm text-base-text-tertiary">{{ $t("two-factor-step-verify-body") }}</p>
                </div>
              </div>

              <form class="flex flex-col gap-4" @submit.prevent="enableTwoFactor">
                <FormField
                  id="verification-code"
                  v-model="verificationCode"
                  name="verification-code"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  :label="$t('two-factor-code-label')"
                  :placeholder="$t('two-factor-code-placeholder')"
                >
                  <template #icon>
                    <PhShieldCheck />
                  </template>
                </FormField>
                <SButton type="submit" color="brand" variant="primary" size="xxl" class="w-full" :loading="enabling">
                  {{ $t("two-factor-enable-action") }}
                </SButton>
              </form>
            </section>
          </template>

          <!-- Enabled: recovery codes and danger zone -->
          <template v-else>
            <section class="flex flex-col gap-4 rounded-3xl bg-util-alpha-black-5 p-5">
              <div class="flex flex-col gap-1">
                <h2 class="text-base font-semibold text-base-text-primary">
                  {{ $t("two-factor-recovery-codes-title") }}
                </h2>
                <p class="text-sm text-base-text-tertiary">{{ $t("two-factor-recovery-codes-body") }}</p>
              </div>

              <div v-if="recoveryCodes.length > 0" class="flex flex-col gap-3">
                <ul class="grid grid-cols-2 gap-2">
                  <li
                    v-for="code in recoveryCodes"
                    :key="code"
                    class="rounded-xl bg-base-bg-primary px-3 py-2 text-center font-mono text-sm tracking-wide text-base-text-primary select-all"
                  >
                    {{ code }}
                  </li>
                </ul>
                <SButton
                  variant="secondary"
                  color="neutral"
                  size="lg"
                  class="w-full"
                  @click="copyText(recoveryCodes.join('\n'))"
                >
                  <template #icon-left>
                    <PhCopy />
                  </template>
                  {{ $t("two-factor-recovery-codes-copy") }}
                </SButton>
              </div>

              <p class="text-xs text-base-text-quaternary">{{ $t("two-factor-recovery-codes-hint") }}</p>
              <SButton
                variant="outline"
                color="neutral"
                size="lg"
                class="w-full"
                :loading="generatingCodes"
                @click="generateRecoveryCodes"
              >
                {{ $t("two-factor-recovery-codes-regenerate") }}
              </SButton>
            </section>

            <SButton variant="outline" color="error" size="xxl" class="w-full" @click="showDisableConfirm = true">
              {{ $t("two-factor-disable-action") }}
            </SButton>
          </template>
        </template>
      </div>
    </template>
  </Layout>

  <Sheet v-model="showDisableConfirm" detent="medium">
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-2">
        <p class="text-lg font-semibold text-base-text-primary">{{ $t("two-factor-disable-confirm-title") }}</p>
        <p class="text-sm text-base-text-secondary">{{ $t("two-factor-disable-confirm-body") }}</p>
      </div>
      <div class="flex flex-col gap-2">
        <SButton variant="primary" color="error" size="xxl" :loading="disabling" @click="disableTwoFactor">
          {{ $t("two-factor-disable-confirm-yes") }}
        </SButton>
        <SButton
          variant="secondary"
          color="neutral"
          size="xxl"
          :disabled="disabling"
          @click="showDisableConfirm = false"
        >
          {{ $t("two-factor-disable-confirm-cancel") }}
        </SButton>
      </div>
    </div>
  </Sheet>
</template>
