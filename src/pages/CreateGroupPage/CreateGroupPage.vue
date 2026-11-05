<script setup lang="ts">
import { PhCopy } from "@phosphor-icons/vue";
import { useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import { GroupApi, type GroupDto, type GroupJoinLinkDto } from "@/backend";
import config from "@/backend/config";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import BottomAction from "@/components/Layout/BottomAction.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

const routerHistoryStore = useRouterHistoryStore();

const { $t } = useFluent();
const queryCache = useQueryCache();

const groupApi = new GroupApi(config);
const userStore = useUserStore();

const groupName = ref("");
const loading = ref(false);

const createdGroup = ref<GroupDto | null>(null);
const submitFailed = ref(false);
const joinLink = ref<GroupJoinLinkDto | null>(null);

const joinUrl = computed(() => {
  if (!joinLink.value) return null;
  try {
    return `${globalThis.location.origin}/group/join/${joinLink.value.groupJoinLinkId}`;
  } catch {
    return null;
  }
});

const canSubmit = computed(() => {
  return !!userStore.user && groupName.value.trim().length > 0 && !loading.value;
});

async function submit() {
  // `canSubmit` keeps the button disabled until the user loads.
  if (!userStore.user) return;

  const name = groupName.value.trim();
  if (!name) return;

  loading.value = true;
  submitFailed.value = false;
  try {
    const group = await groupApi.createGroup({
      groupInputDto: {
        membersId: [userStore.user.id],
        name,
      },
    });

    createdGroup.value = group;

    const link = await groupApi.createGroupJoinLink({ groupId: group.groupId });
    joinLink.value = link;

    queryCache.invalidateQueries({ key: ["getGroups"] });
    toast.success($t("create-group-success"));
  } catch (error) {
    console.error(error);
    submitFailed.value = true;
  } finally {
    loading.value = false;
  }
}

async function copyJoinLink() {
  if (!joinUrl.value) return;

  try {
    await globalThis.navigator.clipboard.writeText(joinUrl.value);
    toast.success($t("create-group-copy-success"));
  } catch (error) {
    console.error(error);
    toast.error($t("create-group-copy-failed"));
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-close-button="true">
        {{ $t("create-group-title") }}
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4 pt-4 pb-28">
        <TextInput
          id="group-name"
          v-model="groupName"
          :label="$t('create-group-name-label')"
          :placeholder="$t('create-group-name-placeholder')"
        />

        <div v-if="joinUrl" class="flex flex-col gap-2 rounded-2xl bg-base-bg-secondary_alt p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold text-base-text-primary">{{ $t("create-group-share-link-label") }}</div>
            <SIconButton variant="ghost" size="sm" :aria-label="$t('create-group-copy-link')" @click="copyJoinLink">
              <PhCopy />
            </SIconButton>
          </div>
          <a class="text-sm font-medium break-all text-util-color-brand-700" :href="joinUrl">
            {{ joinUrl }}
          </a>
          <div class="text-xs text-base-text-tertiary">{{ $t("create-group-share-link-hint") }}</div>
        </div>

        <div v-if="createdGroup" class="text-sm text-base-text-tertiary">
          {{ $t("create-group-created-hint") }}
        </div>

        <Notice v-if="submitFailed" tone="error" announce data-test="create-group-error">
          <p>{{ $t("create-group-error-submit-failed") }}</p>
        </Notice>

        <BottomAction>
          <SButton
            v-if="!joinUrl"
            variant="primary"
            size="xl"
            class="w-full"
            :disabled="!canSubmit"
            :loading="loading"
            @click="submit"
          >
            {{ $t("create-group-submit") }}
          </SButton>

          <SButton
            v-else
            variant="primary"
            size="xl"
            class="w-full"
            @click="() => routerHistoryStore.restoreSnapshot()"
          >
            {{ $t("create-group-done") }}
          </SButton>
        </BottomAction>
      </div>
    </template>
  </Layout>
</template>
