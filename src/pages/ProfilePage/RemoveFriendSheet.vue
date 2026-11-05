<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { ref, watch } from "vue";
import { toast } from "vue-sonner";

import { AccountApi } from "@/backend";
import config from "@/backend/config";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { useUserStore } from "@/stores/user";

/** Asks the user to confirm, then removes the friend. The sheet stays open when the request fails. */
const model = defineModel<boolean>({ required: true });

const { friendId, friendName } = defineProps<{
  friendId: string;
  /** The nickname of the friend, or the user name when the friend has no nickname. */
  friendName: string;
}>();

const { $t } = useFluent();
const accountApi = new AccountApi(config);
const userStore = useUserStore();

const removing = ref(false);
const removeFailed = ref(false);

watch(model, (open) => {
  if (open) removeFailed.value = false;
});

async function remove() {
  removing.value = true;
  removeFailed.value = false;
  try {
    await accountApi.removeFriend({ id: friendId });
    await userStore.fetchUserInfo();
    model.value = false;
    toast.success($t("profile-remove-friend-success"));
  } catch {
    removeFailed.value = true;
  } finally {
    removing.value = false;
  }
}
</script>

<template>
  <Sheet
    v-model="model"
    :title="$t('profile-remove-friend-confirm-title', { name: friendName })"
    :description="$t('profile-remove-friend-confirm-body')"
    detent="medium"
  >
    <template #actions>
      <Notice v-if="removeFailed" tone="error" announce data-test="remove-friend-error">
        <p>{{ $t("profile-remove-friend-error") }}</p>
      </Notice>
      <SButton variant="destructive" size="xl" :loading="removing" data-test="remove-friend-confirm" @click="remove">
        {{ $t("profile-remove-friend-confirm-yes") }}
      </SButton>
      <SButton variant="secondary" size="xl" :disabled="removing" @click="model = false">
        {{ $t("profile-cancel") }}
      </SButton>
    </template>
  </Sheet>
</template>
