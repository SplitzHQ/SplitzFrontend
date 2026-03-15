<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { ref, watch } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";

const model = defineModel<boolean>({ required: true });

const props = defineProps<{
  friendName: string;
  currentRemark: string;
}>();

const emit = defineEmits<{
  save: [remark: string];
}>();

const { $t } = useFluent();

const remark = ref("");
const loading = ref(false);

watch(
  () => model.value,
  (visible) => {
    if (visible) {
      remark.value = props.currentRemark;
    }
  }
);

async function save() {
  loading.value = true;
  try {
    emit("save", remark.value.trim());
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Sheet v-model="model" detent="medium" :show-close-button="true">
    <div class="flex flex-col gap-4 px-4 pt-2 pb-6">
      <h2 class="text-lg font-semibold text-base-text-primary">
        {{ $t("profile-edit-nickname-title") }}
      </h2>
      <p class="text-sm text-base-text-tertiary">{{ friendName }}</p>

      <div class="flex flex-col gap-2">
        <div class="text-sm font-semibold text-base-text-primary">{{ $t("profile-edit-nickname-label") }}</div>
        <div class="flex items-center gap-2 overflow-clip rounded-full bg-util-alpha-black-5 px-4 py-3">
          <TextInput v-model="remark" class="w-full" :placeholder="$t('profile-edit-nickname-placeholder')" />
        </div>
      </div>

      <SButton variant="primary" color="brand" size="xxl" class="w-full" :loading="loading" @click="save">
        {{ $t("profile-edit-nickname-save") }}
      </SButton>
    </div>
  </Sheet>
</template>
