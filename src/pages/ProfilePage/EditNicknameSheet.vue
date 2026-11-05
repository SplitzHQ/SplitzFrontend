<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { ref, watch } from "vue";
import { toast } from "vue-sonner";

import { AccountApi } from "@/backend";
import config from "@/backend/config";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useUserStore } from "@/stores/user";

const model = defineModel<boolean>({ required: true });

const props = defineProps<{
  friendId: string;
  friendName: string;
  currentRemark: string;
}>();

const { $t } = useFluent();
const accountApi = new AccountApi(config);
const userStore = useUserStore();

const remark = ref("");
const loading = ref(false);
const saveFailed = ref(false);

watch(
  () => model.value,
  (visible) => {
    if (visible) {
      remark.value = props.currentRemark;
      saveFailed.value = false;
    }
  }
);

async function save() {
  loading.value = true;
  saveFailed.value = false;
  try {
    await accountApi.updateFriendRemark({
      id: props.friendId,
      remark: remark.value.trim(),
    });
    await userStore.fetchUserInfo();
    model.value = false;
    toast.success($t("profile-edit-nickname-success"));
  } catch {
    saveFailed.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Sheet v-model="model" :title="$t('profile-edit-nickname-title')" detent="medium" :show-close-button="true">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-base-text-tertiary">{{ friendName }}</p>

      <TextInput
        id="edit-nickname"
        v-model="remark"
        :label="$t('profile-edit-nickname-label')"
        :placeholder="$t('profile-edit-nickname-placeholder')"
      />
    </div>

    <template #actions>
      <Notice v-if="saveFailed" tone="error" announce data-test="edit-nickname-error">
        <p>{{ $t("profile-edit-nickname-error") }}</p>
      </Notice>

      <SButton variant="primary" size="xl" :loading="loading" @click="save">
        {{ $t("profile-edit-nickname-save") }}
      </SButton>
    </template>
  </Sheet>
</template>
