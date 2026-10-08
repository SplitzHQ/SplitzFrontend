<script setup lang="ts">
import { PhLinkBreak, PhUsersThree } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import StatusBadge from "@/components/AuthShell/StatusBadge.vue";
import Avatar from "@/components/Avatar/Avatar.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";

const { $t } = useFluent();
const queryCache = useQueryCache();
const route = useRoute();
const router = useRouter();

const joinLinkId = computed(() => String(route.params.joinLinkId ?? ""));

const groupApi = new GroupApi(config);

const { state: groupInfo } = useQuery({
  key: ["getGroupInfoByLink", joinLinkId.value],
  query: () => groupApi.getGroupInfoByLink({ joinLinkId: joinLinkId.value }),
});

const group = computed(() => groupInfo.value.data);
const isLoading = computed(() => groupInfo.value.status === "pending");
const isUnavailable = computed(() => !joinLinkId.value || groupInfo.value.status === "error");

const joining = ref(false);

async function join() {
  if (!joinLinkId.value) return;
  joining.value = true;
  try {
    await groupApi.joinGroupByLink({ joinLinkId: joinLinkId.value });
    queryCache.invalidateQueries({ key: ["getGroups"] });
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
        <span class="text-base font-medium text-base-text-primary">{{ $t("join-group-title") }}</span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col px-4 pt-2 pb-28">
        <!-- Invite card -->
        <div
          class="relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl bg-core-alpha-brand-10 px-6 pt-10 pb-8 text-center"
        >
          <div aria-hidden="true" class="pointer-events-none absolute inset-0">
            <div class="absolute -top-16 -right-16 size-48 rounded-full border border-core-alpha-brand-10" />
            <div class="absolute -top-28 -right-28 size-72 rounded-full border border-core-alpha-brand-5" />
            <div class="absolute -bottom-20 -left-20 size-56 rounded-full border border-core-alpha-brand-10" />
          </div>

          <!-- Unavailable link -->
          <template v-if="isUnavailable">
            <StatusBadge tone="error">
              <PhLinkBreak weight="duotone" />
            </StatusBadge>
            <div class="relative flex flex-col gap-2">
              <h2 class="text-display-xs font-semibold text-base-text-primary">
                {{ $t("join-group-error-not-found-title") }}
              </h2>
              <p class="text-sm text-base-text-tertiary">{{ $t("join-group-error-not-found-body") }}</p>
            </div>
          </template>

          <!-- Loading -->
          <template v-else-if="isLoading">
            <div class="size-20 skeleton rounded-3xl" />
            <div class="relative flex flex-col items-center gap-2">
              <div class="h-4 w-24 skeleton" />
              <div class="h-7 w-44 skeleton" />
              <div class="h-4 w-56 skeleton" />
            </div>
          </template>

          <!-- Invite -->
          <template v-else-if="group">
            <div class="relative rounded-3xl p-1 ring-4 ring-core-alpha-brand-20">
              <Avatar v-if="group.photo" size="lg" :images="[{ src: group.photo, alt: group.name }]" />
              <div
                v-else
                class="flex size-16 items-center justify-center rounded-2xl bg-util-color-brand-100 text-util-color-brand-700"
              >
                <PhUsersThree weight="duotone" class="size-8" />
              </div>
            </div>
            <div class="relative flex flex-col gap-2">
              <p class="text-xs font-semibold tracking-wide text-util-color-brand-700 uppercase">
                {{ $t("join-group-invited-title") }}
              </p>
              <h2 class="text-display-sm font-semibold tracking-tight text-base-text-primary">{{ group.name }}</h2>
              <p class="text-sm text-base-text-tertiary">{{ $t("join-group-invited-body") }}</p>
            </div>
          </template>
        </div>

        <div class="fixed inset-x-3 bottom-4">
          <SButton
            v-if="isUnavailable"
            variant="outline"
            color="neutral"
            size="xxl"
            class="w-full"
            @click="router.push({ name: 'home' })"
          >
            {{ $t("join-group-back-home") }}
          </SButton>
          <SButton
            v-else
            variant="primary"
            color="brand"
            size="xxl"
            class="w-full"
            :loading="joining"
            :disabled="isLoading"
            @click="join"
          >
            {{ $t("join-group-join") }}
          </SButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
