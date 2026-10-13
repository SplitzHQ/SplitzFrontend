<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

import { GroupApi, NotificationApi, type NotificationPreferenceDto } from "@/backend";
import config from "@/backend/config";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SSwitch from "@/components/SSwitch/SSwitch.vue";
import reportError from "@/libs/report-error";
import { globalOnlyNotificationTypes, notificationSettingGroups } from "@/types/notification";

const { $t } = useFluent();
const route = useRoute();

const notificationApi = new NotificationApi(config);
const groupApi = new GroupApi(config);

/** Present on the per-group route; absent on the global route. */
const groupId = computed(() => (route.params.groupId as string | undefined) ?? null);
const isGroupScope = computed(() => groupId.value !== null);

const { state: typesQuery } = useQuery({
  key: ["getNotificationTypes"],
  query: () => notificationApi.getNotificationTypes(),
});

const { state: globalPrefsQuery, refresh: refreshGlobal } = useQuery({
  key: ["getNotificationPreferences", "global"],
  query: () => notificationApi.getNotificationPreferences({}),
});

const { state: groupPrefsQuery, refresh: refreshGroup } = useQuery({
  enabled: () => isGroupScope.value,
  key: () => ["getNotificationPreferences", groupId.value ?? "none"],
  query: () => notificationApi.getNotificationPreferences({ groupId: groupId.value! }),
});

const { state: groupQuery } = useQuery({
  enabled: () => isGroupScope.value,
  key: () => ["getGroup", groupId.value ?? "none"],
  query: () => groupApi.getGroup({ groupId: groupId.value! }),
});

const loading = computed(
  () =>
    typesQuery.value.status === "pending" ||
    globalPrefsQuery.value.status === "pending" ||
    (isGroupScope.value && groupPrefsQuery.value.status === "pending")
);

const configurableTypes = computed(() => {
  const types = (typesQuery.value.data ?? []).filter((t) => t.configurable).map((t) => t.type);
  return isGroupScope.value ? types.filter((t) => !globalOnlyNotificationTypes.includes(t)) : types;
});

/** Local overlay so toggles respond instantly; the queries refresh afterwards. */
const optimisticUpdateOverlay = ref(new Map<string, boolean>());

function findPreference(list: NotificationPreferenceDto[] | undefined, type: string) {
  return list?.find((p) => p.type === type);
}

interface NotificationPreference {
  type: string;
  enabled: boolean;
  /** True when the group has no override and the value comes from the global setting. */
  inherited: boolean;
}

function getNotificationPreference(type: string): NotificationPreference {
  const globalPref = findPreference(globalPrefsQuery.value.data, type);
  const globalEnabled = globalPref?.enabled ?? true;

  if (!isGroupScope.value) {
    return { enabled: optimisticUpdateOverlay.value.get(type) ?? globalEnabled, inherited: false, type };
  }

  const groupPref = findPreference(groupPrefsQuery.value.data, type);
  const local = optimisticUpdateOverlay.value.get(type);
  if (local !== undefined) return { enabled: local, inherited: false, type };
  return groupPref
    ? { enabled: groupPref.enabled, inherited: false, type }
    : { enabled: globalEnabled, inherited: true, type };
}

const sections = computed(() =>
  notificationSettingGroups
    .map((group) => ({
      key: group.key,
      rows: group.types.filter((t) => configurableTypes.value.includes(t)).map((t) => getNotificationPreference(t)),
    }))
    .filter((section) => section.rows.length > 0)
);

const hasGroupOverrides = computed(
  () => (groupPrefsQuery.value.data?.length ?? 0) > 0 || optimisticUpdateOverlay.value.size > 0
);

async function setEnabled(type: string, enabled: boolean) {
  optimisticUpdateOverlay.value.set(type, enabled);
  try {
    await notificationApi.setNotificationPreference({
      notificationPreferenceInputDto: { enabled, groupId: groupId.value, type },
    });
    await (isGroupScope.value ? refreshGroup() : refreshGlobal());
  } catch (error) {
    reportError("notification.setPreference", error);
    toast.error($t("notification-settings-error"));
  } finally {
    optimisticUpdateOverlay.value.delete(type);
  }
}

const resetting = ref(false);

async function resetGroupNotificationPreferences() {
  if (!groupId.value) return;
  resetting.value = true;
  try {
    await notificationApi.resetGroupNotificationPreferences({ groupId: groupId.value });
    optimisticUpdateOverlay.value.clear();
    await refreshGroup();
    toast.success($t("notification-settings-reset-group-success"));
  } catch (error) {
    reportError("notification.resetGroup", error);
    toast.error($t("notification-settings-error"));
  } finally {
    resetting.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <span class="text-base font-medium text-base-text-primary">
          {{ isGroupScope ? $t("notification-settings-group-title") : $t("notification-settings-title") }}
        </span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-6 px-4 pt-2 pb-10">
        <p class="px-1 text-sm text-base-text-tertiary">
          {{
            isGroupScope
              ? $t("notification-settings-group-intro", { group: groupQuery.data?.name ?? "" })
              : $t("notification-settings-intro")
          }}
        </p>

        <p v-if="loading" class="px-1 text-sm text-base-text-quaternary">{{ $t("notification-settings-loading") }}</p>

        <template v-else>
          <section v-for="section in sections" :key="section.key" class="flex flex-col gap-2">
            <h2 class="px-1 text-sm font-semibold text-base-text-quaternary">
              {{ $t(`notification-settings-section-${section.key}`) }}
            </h2>
            <div class="flex flex-col divide-y divide-base-border-tertiary rounded-3xl bg-util-alpha-black-5">
              <div
                v-for="row in section.rows"
                :key="row.type"
                class="flex items-center gap-3 px-4 py-3"
                :data-test="`pref-${row.type}`"
              >
                <div class="flex min-w-0 flex-1 flex-col">
                  <p :id="`pref-label-${row.type}`" class="text-base font-medium text-base-text-primary">
                    {{ $t(`notification-type-${row.type}`) }}
                  </p>
                  <p class="text-xs text-base-text-quaternary">{{ $t(`notification-type-${row.type}-hint`) }}</p>
                  <p v-if="row.inherited" class="text-xs text-util-color-brand-700">
                    {{ $t("notification-settings-follow-global") }}
                  </p>
                </div>
                <SSwitch
                  :model-value="row.enabled"
                  :inherited="row.inherited"
                  :label="$t(`notification-type-${row.type}`)"
                  @update:model-value="setEnabled(row.type, $event)"
                />
              </div>
            </div>
          </section>

          <SButton
            v-if="isGroupScope && hasGroupOverrides"
            variant="outline"
            color="neutral"
            size="xl"
            class="w-full"
            :loading="resetting"
            @click="resetGroupNotificationPreferences"
          >
            {{ $t("notification-settings-reset-group") }}
          </SButton>
        </template>
      </div>
    </template>
  </Layout>
</template>
