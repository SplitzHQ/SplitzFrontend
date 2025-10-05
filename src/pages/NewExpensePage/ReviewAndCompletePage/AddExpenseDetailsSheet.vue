<script setup lang="ts">
import { useFluent } from 'fluent-vue'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

import CategoryIcon from '@/components/Category/CategoryIcon.vue'
import { categoryColorMap } from '@/components/Category/category-color'
import SButton from '@/components/SButton/SButton.vue'
import Sheet from '@/components/Sheet/Sheet.vue'
import TextInput from '@/components/TextInput/TextInput.vue'
import { getCategory, getMainCategory } from '@/libs/categories'
import { useTransactionStore } from '@/stores/transaction'

// v-model from parent controls visibility
const model = defineModel<boolean>({ required: true })

const { $t } = useFluent()
const transactionStore = useTransactionStore()
const { transaction } = storeToRefs(transactionStore)

const localName = ref(transaction.value.name ?? '')
const localLocation = ref(transaction.value.geoCoordinate ?? '')
const localCategory = ref(getCategory(transaction.value.icon))
const receiptPreview = ref<string | undefined>(transaction.value.photo as string | undefined)

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    const result = reader.result as string
    receiptPreview.value = result
  })
  reader.readAsDataURL(file)
}

function saveDetails() {
  transaction.value.name = localName.value.trim() || undefined
  transaction.value.icon = localCategory.value
  transaction.value.geoCoordinate = localLocation.value.trim() || undefined
  if (receiptPreview.value) {
    transaction.value.photo = receiptPreview.value
  }
  model.value = false
}
</script>

<template>
  <Sheet v-model="model" detent="large" show-close-button>
    <div class="flex flex-col gap-5">
      <div class="text-base-text-primary text-lg font-medium">{{ $t('Add_Details') }}</div>
      <div class="flex flex-col gap-4">
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold">
            {{ $t('Give_It_a_Name') }}
          </label>
          <div class="gap-2 flex items-center">
            <div :class="[categoryColorMap[getMainCategory(localCategory)], 'p-3 text-[1.75rem] rounded-05xl']">
              <CategoryIcon :category="localCategory" />
            </div>
            <div class="p-3 rounded-xl outline-solid outline-1 -outline-offset-1 outline-base-border-primary grow">
              <TextInput
                v-model="localName"
                :placeholder="$t('Whats_this_for')"
                class="text-base placeholder:text-base"
              />
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold">
            {{ $t('Add_Location') }}
          </label>
          <div class="p-3 rounded-xl outline-solid outline-1 -outline-offset-1 outline-base-border-primary">
            <TextInput
              v-model="localLocation"
              :placeholder="$t('Add_Location')"
              class="text-base placeholder:text-base"
            />
          </div>
          <div class="text-base-text-quaternary text-[11px]">(Optional: enter an address or coordinates)</div>
        </div>

        <!-- Receipt -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold">
            {{ $t('Upload_Receipt') }}
          </label>
          <div class="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              class="text-xs text-base-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-base-border-secondary file:bg-base-bg-secondary file:text-base-text-secondary file:text-xs"
              @change="handleFileChange"
            />
            <div v-if="receiptPreview" class="relative">
              <img :src="receiptPreview" alt="Receipt preview" class="max-h-48 rounded-lg object-contain mx-auto" />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-2">
          <label class="text-base-text-secondary text-sm font-semibold">
            {{ $t('Add_Notes') }}
          </label>
          <div class="p-3 rounded-xl outline-solid outline-1 -outline-offset-1 outline-base-border-primary">
            <textarea
              rows="3"
              :placeholder="$t('Add_Notes_Placeholder')"
              class="placeholder:text-base-text-placeholder placeholder:font-normal text-base-text-primary font-normal text-base placeholder:text-base w-full bg-transparent focus-visible:outline-hidden"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <SButton class="flex-1" variant="primary" size="lg" color="brand" @click="saveDetails">
            {{ $t('Done') }}
          </SButton>
        </div>
      </div>
    </div>
  </Sheet>
</template>

<style scoped></style>
