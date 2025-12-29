<script setup lang="ts">
import { PhCamera, PhCircleNotch, PhGpsFix, PhPlus, PhTrash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { storeToRefs } from "pinia";
import { ref, useTemplateRef } from "vue";

import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import { categoryColorMap } from "@/components/Category/category-color";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { getCategory, getMainCategory } from "@/libs/categories";
import { useTransactionStore } from "@/stores/transaction";

// v-model from parent controls visibility
const model = defineModel<boolean>({ required: true });

const { $t } = useFluent();
const transactionStore = useTransactionStore();
const { transaction } = storeToRefs(transactionStore);

// Local editable copies of transaction details
const localName = ref(transaction.value.name ?? "");
const localLocation = ref(transaction.value.geoCoordinate ?? "");
const localCategory = ref(getCategory(transaction.value.icon));
const receiptPreview = ref<string | undefined>(transaction.value.photo as string | undefined);

// Save details back to transaction store
function saveDetails() {
  transaction.value.name = localName.value.trim() || undefined;
  transaction.value.icon = localCategory.value;
  transaction.value.geoCoordinate = localLocation.value.trim() || undefined;
  // do not save receipt to transaction for now
  // the photo should be uploaded separately when submitting the transaction
  // transaction.value.photo = receiptPreview.value;
  model.value = false;
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
            console.error("Error fetching location name:", error);
            localLocation.value = `${String(latitude)}, ${String(longitude)}`;
          } finally {
            locationLoading.value = false;
          }
        })();
      },
      (error) => {
        console.error("Error getting location:", error);
        locationLoading.value = false;
      }
    );
  }
}

// receipt handling
const cameraInput = useTemplateRef("cameraInput");
const galleryInput = useTemplateRef("galleryInput");

function triggerCamera() {
  // false alert
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  cameraInput.value?.click();
}

function triggerGallery() {
  // false alert
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  galleryInput.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    const file = input.files[0];
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
}
</script>

<template>
  <Sheet v-model="model" detent="large" show-close-button>
    <div class="flex flex-col gap-5">
      <div class="text-base-text-primary text-lg font-medium">{{ $t("new-expense-review-actions-add-details") }}</div>
      <div class="flex flex-col gap-4">
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold" for="name">
            {{ $t("new-expense-review-fields-name-label") }}
          </label>
          <div class="gap-2 flex items-center">
            <div :class="[categoryColorMap[getMainCategory(localCategory)], 'p-2.5 icon-7 rounded-05xl']">
              <CategoryIcon :category="localCategory" />
            </div>
            <div class="p-3 rounded-xl outline-solid outline-1 -outline-offset-1 outline-base-border-primary grow">
              <TextInput
                id="name"
                v-model="localName"
                :placeholder="$t('new-expense-review-fields-name-placeholder')"
                class="text-base w-full"
              />
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold" for="location">
            {{ $t("new-expense-review-fields-location") }}
          </label>
          <div class="gap-2 flex items-stretch">
            <button
              type="button"
              aria-label="Get current location"
              class="p-3.5 rounded-xl outline -outline-offset-1 outline-base-border-primary flex justify-center items-center cursor-pointer"
              @click="getLocation"
            >
              <PhGpsFix v-if="!locationLoading" class="icon-5 text-base-fg-primary" />
              <PhCircleNotch v-else class="icon-5 text-base-fg-primary animate-spin" />
            </button>
            <div
              class="p-3 rounded-xl outline-solid outline-1 flex items-center gap-2 -outline-offset-1 outline-base-border-primary grow"
            >
              <TextInput
                id="location"
                v-model="localLocation"
                :placeholder="$t('new-expense-review-fields-location-placeholder')"
                class="text-base w-full"
              />
            </div>
          </div>
          <span class="text-xs text-base-text-quaternary">
            {{ $t("new-expense-review-fields-location-disclaimer") }}
          </span>
        </div>

        <!-- Receipt -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold">
            {{ $t("new-expense-review-fields-receipt") }}
            <input
              ref="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="handleFileChange"
            />
            <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
          </label>

          <div v-if="receiptPreview" class="relative w-fit">
            <img
              :src="receiptPreview"
              alt="Receipt preview"
              class="h-24 w-24 object-cover rounded-lg border border-base-border-primary"
            />
            <button
              type="button"
              aria-label="Remove receipt"
              class="absolute -top-2 -right-2 bg-base-bg-primary rounded-full p-1 border border-base-border-secondary shadow-sm cursor-pointer"
              @click="removeReceipt"
            >
              <PhTrash class="icon-4 text-base-fg-error" />
            </button>
          </div>
          <div v-else class="flex gap-2">
            <button
              type="button"
              aria-label="Select image from camera"
              class="p-5 bg-core-color-brand-50 rounded-lg flex justify-start items-center gap-2 cursor-pointer"
              @click="triggerCamera"
            >
              <PhCamera class="icon-8 text-base-fg-brand" />
            </button>
            <button
              type="button"
              aria-label="Select image from gallery"
              class="p-5 bg-core-color-brand-50 rounded-lg flex justify-start items-center gap-2 cursor-pointer"
              @click="triggerGallery"
            >
              <PhPlus class="icon-8 text-base-fg-brand" />
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold" for="notes">
            {{ $t("new-expense-review-fields-notes-label") }}
          </label>
          <div class="p-3 rounded-xl outline-solid outline-1 -outline-offset-1 outline-base-border-primary">
            <textarea
              id="notes"
              rows="3"
              :placeholder="$t('new-expense-review-fields-notes-placeholder')"
              class="placeholder:text-base-text-placeholder placeholder:font-normal text-base-text-primary font-normal text-base placeholder:text-base w-full bg-transparent focus-visible:outline-hidden"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <SButton class="flex-1" variant="primary" size="lg" color="brand" @click="saveDetails">
            {{ $t("new-expense-review-actions-done") }}
          </SButton>
        </div>
      </div>
    </div>
  </Sheet>
</template>

<style scoped></style>
