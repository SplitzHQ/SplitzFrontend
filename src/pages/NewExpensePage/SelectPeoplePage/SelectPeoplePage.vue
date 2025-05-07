<script setup lang="ts">
import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Layout from '@/components/Layout/Layout.vue'

import FrequentSelectionList from './FrequentSelectionList.vue'
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t('Select-People-Group') }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4">
        <FrequentSelectionList />
      </div>
    </template>
  </Layout>
</template>
