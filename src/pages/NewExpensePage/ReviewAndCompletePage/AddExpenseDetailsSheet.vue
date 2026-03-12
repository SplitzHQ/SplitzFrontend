<script setup lang="ts">
import { PhCamera, PhCircleNotch, PhGpsFix, PhPlus, PhTrash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { storeToRefs } from "pinia";
import { ref, useTemplateRef } from "vue";
import { toast } from "vue-sonner";

import { categoryColorMap } from "@/components/Category/category-color";
import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { getCategory, getMainCategory } from "@/libs/categories";
import reportError from "@/libs/report-error";
import { useTransactionStore } from "@/stores/transaction";

import SelectCategorySheet from "./SelectCategorySheet.vue";

// v-model from parent controls visibility
const model = defineModel<boolean>({ required: true });

const { $t } = useFluent();
const transactionStore = useTransactionStore();
const { transaction, previewPhotoBase64 } = storeToRefs(transactionStore);

// Local editable copies of transaction details
const localName = ref(transaction.value.name ?? "");
const localLocation = ref(transaction.value.geoCoordinate ?? "");
const localCategory = ref(getCategory(transaction.value.icon));

// Category selection sheet
const showCategorySheet = ref(false);

// receipt handling
const receiptFile = ref<File | null>(null);
const receiptPreview = ref<string | undefined>(previewPhotoBase64.value);
const cameraInput = useTemplateRef("cameraInput");
const galleryInput = useTemplateRef("galleryInput");

function triggerCamera() {
  cameraInput.value?.click();
}

function triggerGallery() {
  galleryInput.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    const file = input.files[0];

    const maxReceiptSizeBytes = 15 * 1024 * 1024;
    if (!file.type.startsWith("image/")) {
      toast.error($t("new-expense-review-error-receipt-not-image"));
      input.value = "";
      return;
    }
    if (file.size > maxReceiptSizeBytes) {
      toast.error($t("new-expense-review-error-receipt-too-large", { maxMb: 15 }));
      input.value = "";
      return;
    }

    receiptFile.value = file;
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      receiptPreview.value = e.target?.result as string;
    });
    reader.readAsDataURL(file);
  }
  input.value = "";
}

function removeReceipt() {
  receiptPreview.value = undefined;
  receiptFile.value = null;
}

// Save details back to transaction store
const saveDetailsLoading = ref(false);
async function saveDetails() {
  try {
    saveDetailsLoading.value = true;
    transaction.value.name = localName.value.trim() || undefined;
    transaction.value.icon = localCategory.value;
    transaction.value.geoCoordinate = localLocation.value.trim() || undefined;
    previewPhotoBase64.value = receiptPreview.value;
    await transactionStore.saveTransaction();
    if (receiptFile.value) await transactionStore.uploadTransactionReceipt(receiptFile.value);
    model.value = false;
  } catch (error) {
    toast.error($t("new-expense-review-error-saving-transaction"));
    reportError("saveTransaction", error);
  } finally {
    saveDetailsLoading.value = false;
  }
}

// location handling
const locationLoading = ref(false);
/**
 * Get user's current location and convert to human-readable address
 */
function getLocation() {
  if ("geolocation" in navigator) {
    locationLoading.value = true;
    setTimeout(() => {
      locationLoading.value = false;
    }, 10000); // timeout after 10 seconds

    // use browser geolocation API to get coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          const { latitude, longitude } = position.coords;
          // use Nominatim API to reverse geocode coordinates to address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${String(latitude)}&lon=${String(longitude)}`
            );
            const data = (await response.json()) as { display_name?: string } | null;
            if (data?.display_name) {
              localLocation.value = data.display_name;
            } else {
              localLocation.value = `${String(latitude)}, ${String(longitude)}`;
            }
          } catch (error) {
            reportError("fetchLocationName", error);
            localLocation.value = `${String(latitude)}, ${String(longitude)}`;
          } finally {
            locationLoading.value = false;
          }
        })();
      },
      (error) => {
        reportError("getCurrentPosition", error);
        locationLoading.value = false;
      }
    );
  }
}
</script>

<template>
  <Sheet v-model="model" detent="large" show-close-button>
    <div class="flex flex-col gap-5">
      <div class="text-lg font-medium text-base-text-primary">{{ $t("new-expense-review-actions-add-details") }}</div>
      <div class="flex flex-col gap-4">
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-base-text-secondary" for="name">
            {{ $t("new-expense-review-fields-name-label") }}
          </label>
          <div class="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open categories selection"
              :class="[categoryColorMap[getMainCategory(localCategory)], 'rounded-05xl p-3 icon-6']"
              @click="showCategorySheet = true"
            >
              <CategoryIcon :category="localCategory" />
            </button>
            <div class="grow rounded-xl p-3 outline-1 -outline-offset-1 outline-base-border-primary outline-solid">
              <TextInput
                id="name"
                v-model="localName"
                :placeholder="$t('new-expense-review-fields-name-placeholder')"
                class="w-full text-base"
              />
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-base-text-secondary" for="location">
            {{ $t("new-expense-review-fields-location") }}
          </label>
          <div class="flex items-stretch gap-2">
            <button
              type="button"
              aria-label="Get current location"
              class="flex cursor-pointer items-center justify-center rounded-xl p-3.5 outline -outline-offset-1 outline-base-border-primary"
              @click="getLocation"
            >
              <PhGpsFix v-if="!locationLoading" class="icon-5 text-base-fg-primary" />
              <PhCircleNotch v-else class="animate-spin icon-5 text-base-fg-primary" />
            </button>
            <div
              class="flex grow items-center gap-2 rounded-xl p-3 outline-1 -outline-offset-1 outline-base-border-primary outline-solid"
            >
              <TextInput
                id="location"
                v-model="localLocation"
                :placeholder="$t('new-expense-review-fields-location-placeholder')"
                class="w-full text-base"
              />
            </div>
          </div>
          <span class="text-xs text-base-text-quaternary">
            {{ $t("new-expense-review-fields-location-disclaimer") }}
          </span>
        </div>

        <!-- Receipt -->
        <div class="flex flex-col gap-2">
          <!-- The following inputs are triggered programmatically via refs, so they should not be related to a label -->
          <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
          <label class="text-sm font-semibold text-base-text-secondary">
            {{ $t("new-expense-review-fields-receipt") }}
          </label>
          <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
          <input
            ref="cameraInput"
            type="file"
            accept="image/*"
            capture="environment"
            class="hidden"
            @change="handleFileChange"
          />
          <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
          <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />

          <div v-if="receiptPreview" class="relative w-fit">
            <img
              :src="receiptPreview"
              alt="Receipt preview"
              class="h-24 w-24 rounded-lg border border-base-border-primary object-cover"
            />
            <button
              type="button"
              aria-label="Remove receipt"
              class="absolute -top-2 -right-2 cursor-pointer rounded-full border border-base-border-secondary bg-base-bg-primary p-1 shadow-sm"
              @click="removeReceipt"
            >
              <PhTrash class="icon-4 text-base-fg-error" />
            </button>
          </div>
          <div v-else class="flex gap-2">
            <button
              type="button"
              aria-label="Select image from camera"
              class="flex cursor-pointer items-center justify-start gap-2 rounded-lg bg-core-color-brand-50 p-5"
              @click="triggerCamera"
            >
              <PhCamera class="icon-8 text-base-fg-brand" />
            </button>
            <button
              type="button"
              aria-label="Select image from gallery"
              class="flex cursor-pointer items-center justify-start gap-2 rounded-lg bg-core-color-brand-50 p-5"
              @click="triggerGallery"
            >
              <PhPlus class="icon-8 text-base-fg-brand" />
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-base-text-secondary" for="notes">
            {{ $t("new-expense-review-fields-notes-label") }}
          </label>
          <div class="rounded-xl p-3 outline-1 -outline-offset-1 outline-base-border-primary outline-solid">
            <textarea
              id="notes"
              rows="3"
              :placeholder="$t('new-expense-review-fields-notes-placeholder')"
              class="w-full bg-transparent text-base font-normal text-base-text-primary placeholder:text-base placeholder:font-normal placeholder:text-base-text-placeholder focus-visible:outline-hidden"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <SButton
            :loading="saveDetailsLoading"
            class="flex-1"
            variant="primary"
            size="lg"
            color="brand"
            @click="saveDetails"
          >
            {{ $t("new-expense-review-actions-done") }}
          </SButton>
        </div>
      </div>
    </div>
  </Sheet>

  <SelectCategorySheet v-model="showCategorySheet" v-model:category="localCategory" />
</template>

<style scoped></style>
