<script setup lang="ts">
import { useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { toast } from "vue-sonner";

import { AccountApi, ResponseError } from "@/backend";
import config from "@/backend/config";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useUserStore } from "@/stores/user";

const model = defineModel<boolean>({ required: true });

const { $t } = useFluent();
const queryCache = useQueryCache();
const accountApi = new AccountApi(config);
const userStore = useUserStore();

const friendId = ref("");
const remark = ref("");
const loading = ref(false);

/** Send a friend request and refresh the account and pending requests. */
async function submit() {
  const id = friendId.value.trim();
  if (!id) return;

  loading.value = true;
  try {
    await accountApi.sendFriendRequest({
      sendFriendRequestRequest: { friendId: id, remark: remark.value.trim() || undefined },
    });
    await userStore.fetchUserInfo();
    await queryCache.invalidateQueries({ key: ["getFriendRequests"] });
    model.value = false;
    toast.success($t("profile-add-friend-success"));
  } catch (error) {
    toast.error($t(await describeAddFriendError(error)));
  } finally {
    loading.value = false;
    friendId.value = "";
    remark.value = "";
  }
}

/** Map the backend's 400 reasons to specific messages; everything else is a generic failure. */
async function describeAddFriendError(error: unknown): Promise<string> {
  if (error instanceof ResponseError && error.response.status === 400) {
    const reason = await error.response.text().catch(() => "");
    if (reason.includes("yourself")) return "profile-add-friend-self";
    if (reason.includes("Already friends")) return "profile-add-friend-already-friends";
  }
  return "profile-add-friend-error";
}
</script>

<template>
  <Sheet v-model="model" detent="medium" :show-close-button="true">
    <div class="flex flex-col gap-4 px-4 pt-2 pb-6">
      <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("profile-add-friend-title") }}</h2>

      <TextInput
        id="add-friend-id"
        v-model="friendId"
        :label="$t('profile-add-friend-id-label')"
        :placeholder="$t('profile-add-friend-id-placeholder')"
      />

      <TextInput
        id="add-friend-remark"
        v-model="remark"
        :label="$t('profile-add-friend-remark-label')"
        :placeholder="$t('profile-add-friend-remark-placeholder')"
      />

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
