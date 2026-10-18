<script setup lang="ts">
import { PhCamera, PhGear, PhImages, PhScan, PhX } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { ReceiptRecognitionApi, ReceiptRecognitionStatus, type ReceiptRecognitionDto } from "@/backend";
import config from "@/backend/config";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { subcategories } from "@/libs/categories";
import reportError from "@/libs/report-error";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";

interface ScanReceiptSheetEvents {
  /** Fired with a successful recognition; the parent decides how to apply it. */
  recognized: [recognition: ReceiptRecognitionDto];
}

/** One picked photo, kept with its preview URL until it is removed or sent. */
interface PendingImage {
  id: number;
  file: File;
  previewUrl: string;
}

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILE_MB = 15;
const DEFAULT_MAX_IMAGES = 6;

// v-model from parent controls visibility
const model = defineModel<boolean>({ required: true });
const emit = defineEmits<ScanReceiptSheetEvents>();

const { $t } = useFluent();
const router = useRouter();
const api = new ReceiptRecognitionApi(config);

// Availability and upload limits can change, so check them each time the sheet opens.
const { state: capabilitiesQuery, refetch: refetchCapabilities } = useQuery({
  key: ["getReceiptRecognitionCapabilities"],
  query: () => api.getReceiptRecognitionCapabilities(),
});
const capabilitiesLoading = computed(() => capabilitiesQuery.value.status === "pending");
const available = computed(() => capabilitiesQuery.value.data?.available ?? false);
const customProviderAllowed = computed(() => capabilitiesQuery.value.data?.customProviderAllowed ?? false);
const maxImages = computed(() => capabilitiesQuery.value.data?.maxImages ?? DEFAULT_MAX_IMAGES);

watch(model, (open) => {
  if (open) void refetchCapabilities();
});

const images = ref<PendingImage[]>([]);
let nextImageId = 0;
const cameraInput = useTemplateRef("cameraInput");
const galleryInput = useTemplateRef("galleryInput");

const recognizing = ref(false);
const cooldown = useRateLimitCooldown();
const controlsDisabled = computed(() => recognizing.value || cooldown.isActive.value);
const canAddMore = computed(() => images.value.length < maxImages.value);
const canRecognize = computed(() => images.value.length > 0 && available.value && !controlsDisabled.value);

function triggerCamera() {
  cameraInput.value?.click();
}

function triggerGallery() {
  galleryInput.value?.click();
}

/** Validate each picked file the same way the single receipt upload does, then keep it for sending. */
function addFiles(list: FileList | null) {
  for (const file of Array.from(list ?? [])) {
    if (!file.type.startsWith("image/")) {
      toast.error($t("new-expense-review-error-receipt-not-image"));
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error($t("new-expense-review-error-receipt-too-large", { maxMb: MAX_FILE_MB }));
      continue;
    }
    if (!canAddMore.value) {
      toast.error($t("new-expense-scan-too-many", { max: maxImages.value }));
      break;
    }
    images.value.push({ file, id: nextImageId++, previewUrl: URL.createObjectURL(file) });
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!controlsDisabled.value) {
    addFiles(input.files);
  }
  input.value = "";
}

function removeImage(id: number) {
  const index = images.value.findIndex((image) => image.id === id);
  if (index === -1) return;
  URL.revokeObjectURL(images.value[index]!.previewUrl);
  images.value.splice(index, 1);
}

function clearImages() {
  for (const image of images.value) {
    URL.revokeObjectURL(image.previewUrl);
  }
  images.value = [];
}

onBeforeUnmount(clearImages);

/**
 * Send every picked image in one request. The category keys go along so the model answers with
 * one the app knows. A model failure comes back as a normal reply with status Failed.
 */
async function recognize() {
  if (!canRecognize.value) return;

  recognizing.value = true;
  try {
    const recognition = await api.recognizeReceipt({
      categories: [...subcategories],
      files: images.value.map((image) => image.file),
    });

    if (recognition.status !== ReceiptRecognitionStatus.Succeeded) {
      reportError("recognizeReceipt", recognition.error);
      toast.error($t("new-expense-scan-failed"));
      return;
    }

    emit("recognized", recognition);
    clearImages();
    model.value = false;
  } catch (error) {
    if (!cooldown.startFromError(error)) {
      reportError("recognizeReceipt", error);
      toast.error($t("new-expense-scan-error"));
    }
  } finally {
    recognizing.value = false;
  }
}

function openSettings() {
  model.value = false;
  void router.push({ name: "receiptRecognitionSettings" });
}
</script>

<template>
  <Sheet v-model="model" detent="large" show-close-button>
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-medium text-base-text-primary">{{ $t("new-expense-scan-title") }}</h2>
        <p class="text-sm text-base-text-tertiary">{{ $t("new-expense-scan-intro") }}</p>
      </div>

      <p v-if="capabilitiesLoading" class="text-sm text-base-text-quaternary">
        {{ $t("new-expense-scan-loading") }}
      </p>

      <div
        v-else-if="!available"
        class="flex flex-col gap-3 rounded-2xl bg-util-alpha-black-5 p-4"
        data-test="scan-unavailable"
      >
        <p class="text-sm text-base-text-secondary">
          {{ $t(customProviderAllowed ? "new-expense-scan-unavailable" : "new-expense-scan-unavailable-fixed") }}
        </p>
        <SButton
          v-if="customProviderAllowed"
          variant="secondary"
          color="brand"
          size="lg"
          data-test="scan-open-settings"
          @click="openSettings"
        >
          <template #icon-left><PhGear /></template>
          {{ $t("new-expense-scan-open-settings") }}
        </SButton>
      </div>

      <template v-else>
        <!-- The inputs are opened from the tiles below, so they carry no label of their own. -->
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          ref="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          :disabled="controlsDisabled"
          @change="handleFileChange"
        />
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          ref="galleryInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          :disabled="controlsDisabled"
          @change="handleFileChange"
        />

        <TransitionGroup tag="div" name="thumb" class="grid grid-cols-3 gap-2">
          <div v-for="image in images" :key="image.id" class="relative aspect-square" data-test="scan-image">
            <img
              :src="image.previewUrl"
              alt=""
              class="size-full rounded-xl border border-base-border-primary object-cover"
            />
            <button
              type="button"
              :aria-label="$t('new-expense-scan-remove-image')"
              class="absolute -top-2 -right-2 cursor-pointer rounded-full border border-base-border-secondary bg-base-bg-primary p-1 shadow-sm"
              :disabled="controlsDisabled"
              @click="removeImage(image.id)"
            >
              <PhX class="icon-4 text-base-fg-error" />
            </button>
          </div>
          <button
            v-if="canAddMore"
            key="add-gallery"
            type="button"
            class="tile flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-core-color-brand-50 text-base-fg-brand"
            :disabled="controlsDisabled"
            data-test="scan-add-gallery"
            @click="triggerGallery"
          >
            <PhImages class="icon-7" />
            <span class="text-xs font-medium">{{ $t("new-expense-scan-add-gallery") }}</span>
          </button>
          <button
            v-if="canAddMore"
            key="add-camera"
            type="button"
            class="tile flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-core-color-brand-50 text-base-fg-brand"
            :disabled="controlsDisabled"
            data-test="scan-add-camera"
            @click="triggerCamera"
          >
            <PhCamera class="icon-7" />
            <span class="text-xs font-medium">{{ $t("new-expense-scan-add-camera") }}</span>
          </button>
        </TransitionGroup>

        <p class="text-xs text-base-text-quaternary">
          {{ $t("new-expense-scan-count", { count: images.length, max: maxImages }) }}
        </p>

        <RateLimitCountdown
          :seconds="cooldown.remainingSeconds.value"
          message-key="new-expense-scan-rate-limit"
          data-test="scan-rate-limit"
        />

        <SButton
          variant="primary"
          color="brand"
          size="xxl"
          class="w-full"
          :loading="recognizing"
          :disabled="!canRecognize"
          data-test="scan-recognize"
          @click="recognize"
        >
          <template #icon-left><PhScan /></template>
          {{ $t(recognizing ? "new-expense-scan-recognizing" : "new-expense-scan-recognize") }}
        </SButton>

        <p class="text-xs text-base-text-quaternary">{{ $t("new-expense-scan-privacy") }}</p>
      </template>
    </div>
  </Sheet>
</template>

<style scoped>
.tile {
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tile:active {
  transform: scale(0.97);
}

.thumb-enter-active,
.thumb-leave-active,
.thumb-move {
  transition:
    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 150ms ease;
}

.thumb-enter-from,
.thumb-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
