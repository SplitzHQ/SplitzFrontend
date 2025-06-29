<script setup lang="ts">
import { useFluent } from 'fluent-vue'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Keyboard from '@/components/Keyboard/Keyboard.vue'
import Layout from '@/components/Layout/Layout.vue'
import { useTransactionStore } from '@/stores/transaction'

import PaidByButton from './PaidByButton.vue'
import SplitMethodButton from './SplitMethodButton.vue'
import UserItem from './UserItem.vue'
import { useKeyboardControl } from './use-keyboard-control'

// i18n
const { $t } = useFluent()

// transaction store
const transaction = useTransactionStore()
const { keyboardValue, focusedInputUserId, setFocusedInputUserId } = useKeyboardControl()

// Handle click outside to close the keyboard
const handleClickOutside = () => {
  if (focusedInputUserId.value) {
    setFocusedInputUserId(null)
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// get header's height to adjust the layout
const headerHeight = ref(0)
onMounted(() => {
  const headerElement = document.querySelector('header')
  if (headerElement) {
    headerHeight.value = headerElement.clientHeight
  }
})
</script>

<template>
  <Layout class="h-dvh">
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t('Select-split-method') }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div class="flex flex-col grow" :style="{ height: `calc(100% - ${headerHeight}px)` }">
        <div v-bind="layoutAttrs" class="flex flex-col gap-4 shrink grow min-h-0 overflow-y-auto">
          <div class="flex gap-4 items-center">
            <PaidByButton />
            <div class="w-[1px] h-6 bg-base-border-secondary" />
            <SplitMethodButton />
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center">
              <div class="text-base-text-tertiary text-sm font-medium">
                {{ $t('Included_People', { count: transaction.includedMembersId.length }) }}
              </div>
              <div class="flex justify-start items-start gap-1">
                <div class="justify-start text-base-text-quaternary text-sm font-medium leading-tight">
                  {{ $t('Total_Amount') }}
                </div>
                <div class="justify-start text-base-text-primary text-sm font-medium leading-tight">
                  {{
                    transaction.transaction.amount?.toLocaleString(undefined, {
                      style: 'currency',
                      currency: transaction.transaction.currency ?? 'USD'
                    })
                  }}
                </div>
              </div>
            </div>
            <UserItem v-for="memberId in transaction.includedMembersId" :key="memberId" :user-id="memberId" />
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center">
              <div class="text-base-text-tertiary text-sm font-medium">
                {{ $t('Not_Included_People', { count: transaction.excludedMembersId.length }) }}
              </div>
            </div>
            <UserItem v-for="memberId in transaction.excludedMembersId" :key="memberId" :user-id="memberId" />
          </div>
        </div>
        <Transition name="slide-fade">
          <div v-if="focusedInputUserId" class="flex-shrink-0 -mt-4" @click.stop>
            <Keyboard v-model="keyboardValue" class="pb-4 px-4" varient="primary" enable-calculator />
          </div>
        </Transition>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
