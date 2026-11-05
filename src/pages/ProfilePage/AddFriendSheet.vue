<script setup lang="ts">
import { useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { AccountApi, ResponseError } from "@/backend";
import config from "@/backend/config";
import Notice from "@/components/Notice/Notice.vue";
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
const errorKey = ref<string | null>(null);

const GENERIC_ERROR = "profile-add-friend-error";
/** The backend named a problem with the ID, so the error shows under that field. */
const idErrorKey = computed(() => (errorKey.value === GENERIC_ERROR ? null : errorKey.value));

watch(friendId, () => {
  errorKey.value = null;
});
watch(model, (open) => {
  if (!open) errorKey.value = null;
});

/** Send a friend request and refresh the account and pending requests. */
async function submit() {
  const id = friendId.value.trim();
  if (!id) return;

  loading.value = true;
  errorKey.value = null;
  try {
    await accountApi.sendFriendRequest({
      sendFriendRequestRequest: { friendId: id, remark: remark.value.trim() || undefined },
    });
    await userStore.fetchUserInfo();
    await queryCache.invalidateQueries({ key: ["getFriendRequests"] });
    model.value = false;
    friendId.value = "";
    remark.value = "";
    toast.success($t("profile-add-friend-success"));
  } catch (error) {
    errorKey.value = await describeAddFriendError(error);
  } finally {
    loading.value = false;
  }
}

/** Map the backend's 400 reasons to specific messages; everything else is a generic failure. */
async function describeAddFriendError(error: unknown): Promise<string> {
  if (error instanceof ResponseError && error.response.status === 400) {
    const reason = await error.response.text().catch(() => "");
    if (reason.includes("yourself")) return "profile-add-friend-self";
    if (reason.includes("Already friends")) return "profile-add-friend-already-friends";
  }
  return GENERIC_ERROR;
}
</script>

<template>
  <Sheet v-model="model" :title="$t('profile-add-friend-title')" detent="medium" :show-close-button="true">
    <div class="flex flex-col gap-4">
      <TextInput
        id="add-friend-id"
        v-model="friendId"
        :label="$t('profile-add-friend-id-label')"
        :placeholder="$t('profile-add-friend-id-placeholder')"
        :error="idErrorKey ? $t(idErrorKey) : undefined"
      />

      <TextInput
        id="add-friend-remark"
        v-model="remark"
        :label="$t('profile-add-friend-remark-label')"
        :placeholder="$t('profile-add-friend-remark-placeholder')"
      />
    </div>

    <template #actions>
      <Notice v-if="errorKey === GENERIC_ERROR" tone="error" announce data-test="add-friend-error">
        <p>{{ $t(GENERIC_ERROR) }}</p>
      </Notice>

      <SButton variant="primary" size="xl" :disabled="!friendId.trim()" :loading="loading" @click="submit">
        {{ $t("profile-add-friend-submit") }}
      </SButton>
    </template>
  </Sheet>
</template>
