<script setup lang="ts">
import { PhCloudCheck, PhCloudSlash, PhRobot } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { ReceiptRecognitionApi, ResponseError } from "@/backend";
import config from "@/backend/config";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SSwitch from "@/components/SSwitch/SSwitch.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import reportError from "@/libs/report-error";

const { $t } = useFluent();
const api = new ReceiptRecognitionApi(config);

const { state: settingsQuery, refetch } = useQuery({
  key: ["getReceiptRecognitionSettings"],
  query: () => api.getReceiptRecognitionSettings(),
});
const settings = computed(() => settingsQuery.value.data);
const loading = computed(() => settingsQuery.value.status === "pending");

// Form state. The key field starts empty on purpose: the server never returns the stored key.
const enabled = ref(false);
const endpoint = ref("");
const modelName = ref("");
const apiKey = ref("");

watch(
  settings,
  (next) => {
    if (!next) return;
    enabled.value = next.customProviderEnabled;
    endpoint.value = next.endpoint ?? "";
    modelName.value = next.model ?? "";
    apiKey.value = "";
  },
  { immediate: true }
);

const saving = ref(false);
const removing = ref(false);
const busy = computed(() => saving.value || removing.value);

/** True once anything about a custom provider is stored, so the remove button has something to do. */
const hasStoredProvider = computed(() => {
  const current = settings.value;
  return !!current && (current.customProviderEnabled || !!current.endpoint || !!current.model || current.hasApiKey);
});

/** When the provider is on, the endpoint, model and a key (new or stored) are all required. */
const canSave = computed(() => {
  if (!enabled.value) return true;
  const hasKey = apiKey.value.trim().length > 0 || (settings.value?.hasApiKey ?? false);
  return endpoint.value.trim().length > 0 && modelName.value.trim().length > 0 && hasKey;
});

async function save() {
  if (busy.value || !canSave.value) return;

  saving.value = true;
  try {
    await api.updateReceiptRecognitionSettings({
      receiptRecognitionSettingsInputDto: {
        apiKey: apiKey.value.trim() || null,
        enabled: enabled.value,
        endpoint: endpoint.value.trim() || null,
        model: modelName.value.trim() || null,
      },
    });
    await refetch();
    toast.success($t("receipt-recognition-saved"));
  } catch (error) {
    reportError("receiptRecognition.save", error);
    toast.error($t(await describeSaveError(error)));
  } finally {
    saving.value = false;
  }
}

/** Map the backend's 400 reasons to specific messages; everything else is a generic failure. */
async function describeSaveError(error: unknown): Promise<string> {
  if (error instanceof ResponseError && error.response.status === 400) {
    const reason = await error.response.text().catch(() => "");
    if (reason.includes("Endpoint")) return "receipt-recognition-error-endpoint";
    if (reason.includes("Model")) return "receipt-recognition-error-model";
    if (reason.includes("API key")) return "receipt-recognition-error-key";
    if (reason.includes("turned off")) return "receipt-recognition-custom-not-allowed";
  }
  return "receipt-recognition-error-save";
}

async function remove() {
  if (busy.value) return;

  removing.value = true;
  try {
    await api.clearReceiptRecognitionSettings();
    await refetch();
    toast.success($t("receipt-recognition-removed"));
  } catch (error) {
    reportError("receiptRecognition.remove", error);
    toast.error($t("receipt-recognition-error-save"));
  } finally {
    removing.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <span class="text-base font-medium text-base-text-primary">{{ $t("receipt-recognition-title") }}</span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-6 px-4 pt-2 pb-10">
        <p class="px-1 text-sm text-base-text-tertiary">{{ $t("receipt-recognition-intro") }}</p>

        <p v-if="loading || !settings" class="px-1 text-sm text-base-text-quaternary">
          {{ $t("receipt-recognition-loading") }}
        </p>

        <template v-else>
          <!-- Built-in model -->
          <section class="flex flex-col gap-2">
            <h2 class="px-1 text-sm font-semibold text-base-text-quaternary">
              {{ $t("receipt-recognition-server-label") }}
            </h2>
            <div class="flex items-center gap-3 rounded-3xl bg-util-alpha-black-5 px-4 py-3" data-test="server-status">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
                <PhCloudCheck v-if="settings.serverProviderAvailable" class="size-5 text-util-color-brand-700" />
                <PhCloudSlash v-else class="size-5 text-base-fg-quaternary" />
              </span>
              <p class="text-sm text-base-text-secondary">
                {{
                  settings.serverProviderAvailable
                    ? $t("receipt-recognition-server-available")
                    : $t("receipt-recognition-server-unavailable")
                }}
              </p>
            </div>
          </section>

          <!-- Custom provider -->
          <section class="flex flex-col gap-2">
            <h2 class="px-1 text-sm font-semibold text-base-text-quaternary">
              {{ $t("receipt-recognition-custom-label") }}
            </h2>

            <p
              v-if="!settings.customProviderAllowed"
              class="rounded-3xl bg-util-alpha-black-5 px-4 py-3 text-sm text-base-text-secondary"
            >
              {{ $t("receipt-recognition-custom-not-allowed") }}
            </p>

            <form v-else class="flex flex-col gap-4" @submit.prevent="save">
              <div class="flex items-center gap-3 rounded-3xl bg-util-alpha-black-5 px-4 py-3">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
                  <PhRobot class="size-5 text-util-color-brand-700" />
                </span>
                <div class="flex min-w-0 flex-1 flex-col">
                  <p id="custom-provider-label" class="text-base font-medium text-base-text-primary">
                    {{ $t("receipt-recognition-custom-toggle") }}
                  </p>
                  <p class="text-xs text-base-text-quaternary">{{ $t("receipt-recognition-custom-hint") }}</p>
                </div>
                <SSwitch
                  v-model="enabled"
                  :disabled="busy"
                  :label="$t('receipt-recognition-custom-toggle')"
                  data-test="custom-toggle"
                />
              </div>

              <Transition name="fields">
                <div v-if="enabled" class="flex flex-col gap-4 px-1" data-test="custom-fields">
                  <TextInput
                    id="receipt-endpoint"
                    v-model="endpoint"
                    :label="$t('receipt-recognition-endpoint-label')"
                    :placeholder="$t('receipt-recognition-endpoint-placeholder')"
                    :hint="$t('receipt-recognition-endpoint-hint')"
                    autocomplete="off"
                    :disabled="busy"
                  />
                  <TextInput
                    id="receipt-model"
                    v-model="modelName"
                    :label="$t('receipt-recognition-model-label')"
                    :placeholder="$t('receipt-recognition-model-placeholder')"
                    autocomplete="off"
                    :disabled="busy"
                  />
                  <TextInput
                    id="receipt-api-key"
                    v-model="apiKey"
                    type="password"
                    :label="$t('receipt-recognition-key-label')"
                    :placeholder="
                      settings.hasApiKey
                        ? $t('receipt-recognition-key-stored-placeholder')
                        : $t('receipt-recognition-key-placeholder')
                    "
                    :hint="
                      settings.hasApiKey
                        ? $t('receipt-recognition-key-hint')
                        : $t('receipt-recognition-key-missing-hint')
                    "
                    autocomplete="off"
                    :disabled="busy"
                  />
                </div>
              </Transition>

              <div class="flex flex-col gap-2">
                <SButton
                  type="submit"
                  variant="primary"
                  color="brand"
                  size="xl"
                  class="w-full"
                  :loading="saving"
                  :disabled="removing || !canSave"
                  data-test="save-settings"
                >
                  {{ $t("receipt-recognition-save") }}
                </SButton>
                <SButton
                  v-if="hasStoredProvider"
                  variant="outline"
                  color="error"
                  size="xl"
                  class="w-full"
                  :loading="removing"
                  :disabled="saving"
                  data-test="remove-settings"
                  @click="remove"
                >
                  {{ $t("receipt-recognition-remove") }}
                </SButton>
              </div>
            </form>
          </section>

          <p class="px-1 text-sm text-base-text-tertiary" data-test="overall-status">
            {{ settings.available ? $t("receipt-recognition-status-ready") : $t("receipt-recognition-status-off") }}
          </p>
        </template>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.fields-enter-active,
.fields-leave-active {
  transition:
    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 150ms ease;
}

.fields-enter-from,
.fields-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
