<script setup lang="ts">
import { PhCopy } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import { AccountApi, GroupApi, type GroupDto, type GroupJoinLinkDto } from "@/backend";
import config from "@/backend/config";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import SLinkButton from "@/components/SButton/SLinkButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";

const { $t } = useFluent();

const accountApi = new AccountApi(config);
const groupApi = new GroupApi(config);

const { state: userInfo } = useQuery({ key: ["getUserInfo"], query: () => accountApi.getUserInfo() });

const groupName = ref("");
const loading = ref(false);

const createdGroup = ref<GroupDto | null>(null);
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
  return !!userInfo.value.data && groupName.value.trim().length > 0 && !loading.value;
});

async function submit() {
  if (!userInfo.value.data) {
    toast.error($t("create-group-error-user-not-ready"));
    return;
  }

  const name = groupName.value.trim();
  if (!name) return;

  loading.value = true;
  try {
    const group = await groupApi.createGroup({
      groupInputDto: {
        name,
        membersId: [userInfo.value.data.id]
      }
    });

    createdGroup.value = group;

    const link = await groupApi.createGroupJoinLink({ groupId: group.groupId });
    joinLink.value = link;

    toast.success($t("create-group-success"));
  } catch (error) {
    console.error(error);
    toast.error($t("create-group-error-submit-failed"));
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
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t("create-group-title") }}
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4 px-4 pt-4 pb-28">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-semibold text-base-text-primary">{{ $t("create-group-name-label") }}</div>
          <div class="flex items-center gap-2 overflow-clip rounded-full bg-util-alpha-black-5 px-4 py-3">
            <TextInput v-model="groupName" :placeholder="$t('create-group-name-placeholder')" />
          </div>
        </div>

        <div v-if="joinUrl" class="flex flex-col gap-2 rounded-2xl bg-base-bg-secondary_alt p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold text-base-text-primary">{{ $t("create-group-share-link-label") }}</div>
            <SIconButton variant="ghost" color="neutral" size="md" @click="copyJoinLink">
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

        <div class="fixed inset-x-3 bottom-4">
          <SButton
            v-if="!joinUrl"
            variant="primary"
            color="brand"
            size="xxl"
            class="w-full"
            :disabled="!canSubmit"
            :loading="loading"
            @click="submit"
          >
            {{ $t("create-group-submit") }}
          </SButton>

          <SLinkButton v-else variant="primary" color="brand" size="xxl" class="w-full" href="/">
            {{ $t("create-group-done") }}
          </SLinkButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
