<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { ref } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";

const model = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  submit: [friendId: string, remark: string | undefined];
}>();

const { $t } = useFluent();

const friendId = ref("");
const remark = ref("");
const loading = ref(false);

async function submit() {
  const id = friendId.value.trim();
  if (!id) return;

  loading.value = true;
  try {
    emit("submit", id, remark.value.trim() || undefined);
  } finally {
    loading.value = false;
    friendId.value = "";
    remark.value = "";
  }
}
</script>

<template>
  <Sheet v-model="model" detent="medium" :show-close-button="true">
    <div class="flex flex-col gap-4 px-4 pt-2 pb-6">
      <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("profile-add-friend-title") }}</h2>

      <div class="flex flex-col gap-2">
        <div class="text-sm font-semibold text-base-text-primary">{{ $t("profile-add-friend-id-label") }}</div>
        <div class="flex items-center gap-2 overflow-clip rounded-full bg-util-alpha-black-5 px-4 py-3">
          <TextInput v-model="friendId" class="w-full" :placeholder="$t('profile-add-friend-id-placeholder')" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="text-sm font-semibold text-base-text-primary">{{ $t("profile-add-friend-remark-label") }}</div>
        <div class="flex items-center gap-2 overflow-clip rounded-full bg-util-alpha-black-5 px-4 py-3">
          <TextInput v-model="remark" class="w-full" :placeholder="$t('profile-add-friend-remark-placeholder')" />
        </div>
      </div>

      <SButton
        variant="primary"
        color="brand"
        size="xxl"
        class="w-full"
        :disabled="!friendId.trim()"
        :loading="loading"
        @click="submit"
      >
        {{ $t("profile-add-friend-submit") }}
      </SButton>
    </div>
  </Sheet>
</template>
