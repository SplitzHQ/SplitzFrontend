<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();

const joinLinkId = computed(() => String(route.params.joinLinkId ?? ""));

const groupApi = new GroupApi(config);

const { state: groupInfo } = useQuery({
  key: ["getGroupInfoByLink", joinLinkId.value],
  query: () => groupApi.getGroupInfoByLink({ joinLinkId: joinLinkId.value })
});

const joining = ref(false);

async function join() {
  if (!joinLinkId.value) return;
  joining.value = true;
  try {
    await groupApi.joinGroupByLink({ joinLinkId: joinLinkId.value });
    toast.success($t("join-group-success"));
    await router.push("/");
  } catch (error) {
    console.error(error);
    toast.error($t("join-group-error-join-failed"));
  } finally {
    joining.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        {{ $t("join-group-title") }}
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4 px-4 pt-4 pb-28">
        <div class="rounded-2xl bg-base-bg-secondary_alt p-4">
          <div class="text-sm font-semibold text-base-text-primary">{{ $t("join-group-group-label") }}</div>
          <div class="mt-2 text-base font-medium text-base-text-primary">
            {{ groupInfo.data?.name ?? $t("join-group-loading") }}
          </div>
        </div>

        <div class="fixed inset-x-3 bottom-4">
          <SButton
            variant="primary"
            color="brand"
            size="xxl"
            class="w-full"
            :loading="joining"
            :disabled="!joinLinkId"
            @click="join"
          >
            {{ $t("join-group-join") }}
          </SButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
