<script setup lang="ts">
import { useFluent } from 'fluent-vue'

import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Layout from '@/components/Layout/Layout.vue'

// i18n
const { $t } = useFluent()
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t('Select-split-method') }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4">111</div>
    </template>
  </Layout>
</template>
