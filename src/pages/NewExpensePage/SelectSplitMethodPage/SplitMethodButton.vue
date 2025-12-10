<script setup lang="ts">
import { PhEquals, PhPencilSimple, PhPercent, PhPlusMinus, PhRowsPlusTop } from '@phosphor-icons/vue'
import { useFluent } from 'fluent-vue'
import { ref } from 'vue'

import SButton from '@/components/SButton/SButton.vue'
import Sheet from '@/components/Sheet/Sheet.vue'
import { useTransactionStore } from '@/stores/transaction'
import type { SplitMethod } from '@/types/split-method'

// i18n
const { $t } = useFluent()

// transaction store
const transactionStore = useTransactionStore()

// sheet related
/** Show sheet */
const showSheet = ref(false)

const setSplitMethod = (splitMethod: SplitMethod) => {
  transactionStore.splitMethod = splitMethod
  showSheet.value = false
}
</script>

<template>
  <SButton
    v-if="transactionStore.splitMethod === 'equally'"
    size="sm"
    variant="secondary"
    color="brand"
    @click="showSheet = true"
  >
    {{ $t('new-expense-split-types-equally') }}
    <template #icon-left>
      <PhEquals />
    </template>
  </SButton>
  <SButton
    v-else-if="transactionStore.splitMethod === 'percentage'"
    size="sm"
    variant="secondary"
    color="brand"
    @click="showSheet = true"
  >
    {{ $t('new-expense-split-types-percentage') }}
    <template #icon-left>
      <PhPercent />
    </template>
  </SButton>
  <SButton
    v-else-if="transactionStore.splitMethod === 'shares'"
    size="sm"
    variant="secondary"
    color="brand"
    @click="showSheet = true"
  >
    {{ $t('new-expense-split-types-shares') }}
    <template #icon-left>
      <PhRowsPlusTop />
    </template>
  </SButton>
  <SButton
    v-else-if="transactionStore.splitMethod === 'adjustment'"
    size="sm"
    variant="secondary"
    color="brand"
    @click="showSheet = true"
  >
    {{ $t('new-expense-split-types-adjustment') }}
    <template #icon-left>
      <PhPlusMinus />
    </template>
  </SButton>
  <SButton
    v-else-if="transactionStore.splitMethod === 'custom'"
    size="sm"
    variant="secondary"
    color="brand"
    @click="showSheet = true"
  >
    {{ $t('new-expense-split-types-custom') }}
    <template #icon-left>
      <PhPencilSimple />
    </template>
  </SButton>

  <Sheet v-model="showSheet" detent="medium">
    <div class="flex flex-col gap-4">
      <button class="flex items-center gap-2" @click="setSplitMethod('equally')">
        <PhEquals />
        <span>{{ $t('new-expense-split-types-equally') }}</span>
      </button>
      <button class="flex items-center gap-2" @click="setSplitMethod('percentage')">
        <PhPercent />
        <span>{{ $t('new-expense-split-types-percentage') }}</span>
      </button>
      <button class="flex items-center gap-2" @click="setSplitMethod('shares')">
        <PhRowsPlusTop />
        <span>{{ $t('new-expense-split-types-shares') }}</span>
      </button>
      <button class="flex items-center gap-2" @click="setSplitMethod('adjustment')">
        <PhPlusMinus />
        <span>{{ $t('new-expense-split-types-adjustment') }}</span>
      </button>
      <button class="flex items-center gap-2" @click="setSplitMethod('custom')">
        <PhPencilSimple />
        <span>{{ $t('new-expense-split-types-custom') }}</span>
      </button>
    </div>
  </Sheet>
</template>
