<script setup lang="ts">
import {
  PhCaretRight,
  PhCopy,
  PhEnvelopeSimple,
  PhIdentificationCard,
  PhPencilSimple,
  PhPlus,
  PhShieldCheck,
  PhTrash,
  PhUser,
  PhUsersThree,
} from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { AccountApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { copyToClipboard } from "@/libs/copy-to-clipboard";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";
import { useUserStore } from "@/stores/user";

import AddFriendSheet from "./AddFriendSheet.vue";
import EditNicknameSheet from "./EditNicknameSheet.vue";

const { $t } = useFluent();
const router = useRouter();
const userStore = useUserStore();
const accountApi = new AccountApi(config);

// Username editing
const isEditingUsername = ref(false);
const editedUsername = ref("");
const savingUsername = ref(false);

function startEditingUsername() {
  editedUsername.value = userStore.user?.userName ?? "";
  isEditingUsername.value = true;
}

function cancelEditingUsername() {
  isEditingUsername.value = false;
}

async function saveUsername() {
  const name = editedUsername.value.trim();
  if (!name) return;

  savingUsername.value = true;
  try {
    await accountApi.updateUserInfo({
      splitzUserUpdateViewModel: { userName: name },
    });
    await userStore.fetchUserInfo();
    isEditingUsername.value = false;
    toast.success($t("profile-save-username-success"));
  } catch {
    toast.error($t("profile-save-username-error"));
  } finally {
    savingUsername.value = false;
  }
}

// Avatar upload
const fileInputRef = useTemplateRef("fileInputRef");
const uploadingAvatar = ref(false);
const avatarCooldown = useRateLimitCooldown();
const avatarControlsDisabled = computed(() => uploadingAvatar.value || avatarCooldown.isActive.value);

function triggerAvatarUpload() {
  fileInputRef.value?.click();
}

const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10 MB

async function handleAvatarFile(event: Event) {
  const input = event.target as HTMLInputElement;
  if (avatarControlsDisabled.value) {
    input.value = "";
    return;
  }

  const file = input.files?.[0];
  if (!file) return;

  if (file.size > MAX_AVATAR_SIZE) {
    toast.error($t("profile-avatar-too-large"));
    input.value = "";
    return;
  }

  uploadingAvatar.value = true;
  try {
    await accountApi.uploadUserAvatar({ file });
    await userStore.fetchUserInfo();
    toast.success($t("profile-avatar-upload-success"));
  } catch (error) {
    if (!avatarCooldown.startFromError(error)) {
      toast.error($t("profile-avatar-upload-error"));
    }
  } finally {
    uploadingAvatar.value = false;
    input.value = "";
  }
}

// User ID (friends add each other by ID)
async function copyUserId() {
  const id = userStore.user?.id;
  if (!id) return;

  if (await copyToClipboard(id)) {
    toast.success($t("profile-copy-success"));
  } else {
    toast.error($t("profile-copy-failed"));
  }
}

// Friends
const friends = computed(() => userStore.user?.friends ?? []);

// Add friend sheet
const showAddFriend = ref(false);

// Remove friend
async function removeFriend(friendId: string) {
  try {
    await accountApi.removeFriend({ id: friendId });
    await userStore.fetchUserInfo();
    toast.success($t("profile-remove-friend-success"));
  } catch {
    toast.error($t("profile-remove-friend-error"));
  }
}

// Edit nickname sheet
const showEditNickname = ref(false);
const editingFriendId = ref("");
const editingFriendName = ref("");
const editingFriendRemark = ref("");

function startEditNickname(friendId: string, userName: string, currentRemark: string | null | undefined) {
  editingFriendId.value = friendId;
  editingFriendName.value = userName;
  editingFriendRemark.value = currentRemark ?? "";
  showEditNickname.value = true;
}

// Logout
function logout() {
  userStore.logout();
  void router.push({ name: "login" });
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <span class="text-base font-medium text-base-text-primary">{{ $t("profile-title") }}</span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-6 px-4 pt-2 pb-28">
        <!-- Identity card -->
        <section
          class="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl bg-core-alpha-brand-10 px-6 pt-8 pb-6 text-center"
        >
          <div aria-hidden="true" class="pointer-events-none absolute inset-0">
            <div class="absolute -top-16 -right-16 size-48 rounded-full border border-core-alpha-brand-10" />
            <div class="absolute -top-28 -right-28 size-72 rounded-full border border-core-alpha-brand-5" />
            <div class="absolute -bottom-24 -left-20 size-56 rounded-full border border-core-alpha-brand-10" />
          </div>

          <div class="relative">
            <div class="rounded-3xl p-1 ring-4 ring-core-alpha-brand-20">
              <Avatar
                :images="[{ src: userStore.user?.photo ?? null, alt: userStore.user?.userName ?? '' }]"
                size="lg"
              />
            </div>
            <button
              type="button"
              class="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-util-color-brand-700 text-base-text-primary-reverse shadow-md ring-2 ring-base-bg-primary disabled:bg-base-bg-disabled disabled:text-base-text-disabled"
              :aria-label="$t('profile-avatar-change')"
              :disabled="avatarControlsDisabled"
              data-test="avatar-upload-trigger"
              @click="triggerAvatarUpload"
            >
              <PhPencilSimple class="size-4" />
            </button>
          </div>

          <div class="relative flex min-w-0 flex-col gap-0.5">
            <p class="truncate text-display-xs font-semibold text-base-text-primary">{{ userStore.user?.userName }}</p>
            <p class="truncate text-sm text-base-text-tertiary">{{ userStore.user?.email }}</p>
          </div>

          <p class="relative text-xs text-base-text-quaternary">{{ $t("profile-avatar-change") }}</p>
          <RateLimitCountdown
            :seconds="avatarCooldown.remainingSeconds.value"
            message-key="profile-avatar-rate-limit"
            class="relative"
            data-test="avatar-rate-limit"
          />
        </section>

        <!-- Account -->
        <section class="flex flex-col gap-2">
          <h2 class="px-1 text-sm font-semibold text-base-text-quaternary">{{ $t("profile-account-label") }}</h2>
          <div class="flex flex-col divide-y divide-base-border-tertiary rounded-3xl bg-util-alpha-black-5">
            <!-- Username -->
            <div class="flex flex-col gap-3 px-4 py-3">
              <div class="flex items-center gap-3">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
                  <PhUser class="size-5 text-util-color-brand-700" />
                </span>
                <div class="flex min-w-0 flex-1 flex-col">
                  <p class="text-xs font-medium text-base-text-quaternary">{{ $t("profile-username-label") }}</p>
                  <p v-if="!isEditingUsername" class="truncate text-base font-medium text-base-text-primary">
                    {{ userStore.user?.userName }}
                  </p>
                </div>
                <SIconButton
                  v-if="!isEditingUsername"
                  variant="ghost"
                  color="neutral"
                  size="md"
                  :aria-label="$t('profile-edit-username')"
                  @click="startEditingUsername"
                >
                  <PhPencilSimple />
                </SIconButton>
              </div>
              <form v-if="isEditingUsername" class="flex flex-col gap-2" @submit.prevent="saveUsername">
                <TextInput
                  id="edit-username"
                  v-model="editedUsername"
                  hide-label
                  :label="$t('profile-username-label')"
                  :placeholder="$t('profile-username-placeholder')"
                />
                <div class="flex justify-end gap-2">
                  <SButton
                    variant="ghost"
                    color="neutral"
                    size="lg"
                    :disabled="savingUsername"
                    @click="cancelEditingUsername"
                  >
                    {{ $t("profile-cancel") }}
                  </SButton>
                  <SButton
                    type="submit"
                    variant="primary"
                    color="brand"
                    size="lg"
                    :loading="savingUsername"
                    :disabled="!editedUsername.trim()"
                  >
                    {{ $t("profile-save-username") }}
                  </SButton>
                </div>
              </form>
            </div>

            <!-- Email (read-only) -->
            <div class="flex items-center gap-3 px-4 py-3">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
                <PhEnvelopeSimple class="size-5 text-util-color-brand-700" />
              </span>
              <div class="flex min-w-0 flex-1 flex-col">
                <p class="text-xs font-medium text-base-text-quaternary">{{ $t("profile-email-label") }}</p>
                <p class="truncate text-base font-medium text-base-text-primary">{{ userStore.user?.email }}</p>
              </div>
            </div>

            <!-- User ID -->
            <div class="flex items-center gap-3 px-4 py-3">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
                <PhIdentificationCard class="size-5 text-util-color-brand-700" />
              </span>
              <div class="flex min-w-0 flex-1 flex-col">
                <p class="text-xs font-medium text-base-text-quaternary">{{ $t("profile-user-id-label") }}</p>
                <p class="truncate font-mono text-sm text-base-text-primary">{{ userStore.user?.id }}</p>
              </div>
              <SIconButton
                variant="ghost"
                color="neutral"
                size="md"
                :aria-label="$t('profile-copy-user-id')"
                :disabled="!userStore.user?.id"
                @click="copyUserId"
              >
                <PhCopy />
              </SIconButton>
            </div>
          </div>
        </section>

        <!-- Security -->
        <section class="flex flex-col gap-2">
          <h2 class="px-1 text-sm font-semibold text-base-text-quaternary">{{ $t("profile-security-label") }}</h2>
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-3xl bg-util-alpha-black-5 px-4 py-3 text-left hover:bg-util-alpha-black-10"
            @click="router.push({ name: '2faSetup' })"
          >
            <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
              <PhShieldCheck class="size-5 text-util-color-brand-700" />
            </span>
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-base font-medium text-base-text-primary">{{ $t("profile-two-factor") }}</span>
              <span class="text-xs text-base-text-quaternary">{{ $t("profile-two-factor-hint") }}</span>
            </span>
            <PhCaretRight class="size-5 shrink-0 text-base-fg-quaternary" />
          </button>
        </section>

        <!-- Friends -->
        <section class="flex flex-col gap-2">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-sm font-semibold text-base-text-quaternary">{{ $t("profile-friends-label") }}</h2>
            <SIconButton
              variant="secondary"
              color="brand"
              size="md"
              :aria-label="$t('profile-add-friend')"
              @click="showAddFriend = true"
            >
              <PhPlus />
            </SIconButton>
          </div>

          <div
            v-if="friends.length === 0"
            class="flex flex-col items-center gap-2 rounded-3xl bg-util-alpha-black-5 px-4 py-8 text-center"
          >
            <span class="flex size-12 items-center justify-center rounded-2xl bg-core-alpha-brand-10">
              <PhUsersThree weight="duotone" class="size-6 text-util-color-brand-700" />
            </span>
            <p class="text-sm font-medium text-base-text-secondary">{{ $t("profile-friends-empty") }}</p>
            <p class="text-xs text-base-text-quaternary">{{ $t("profile-friends-empty-hint") }}</p>
          </div>

          <div v-else class="flex flex-col divide-y divide-base-border-tertiary rounded-3xl bg-util-alpha-black-5">
            <div v-for="friend in friends" :key="friend.friendUser.id" class="flex items-center gap-3 px-4 py-3">
              <Avatar :images="[{ src: friend.friendUser.photo ?? null, alt: friend.friendUser.userName }]" size="xs" />
              <div class="flex min-w-0 flex-1 flex-col">
                <p class="truncate text-base font-medium text-base-text-primary">
                  {{ friend.remark || friend.friendUser.userName }}
                </p>
                <p v-if="friend.remark" class="truncate text-sm text-base-text-quaternary">
                  {{ friend.friendUser.userName }}
                </p>
              </div>
              <SIconButton
                variant="ghost"
                color="neutral"
                size="md"
                :aria-label="$t('profile-edit-nickname-title')"
                @click="startEditNickname(friend.friendUser.id, friend.friendUser.userName, friend.remark)"
              >
                <PhPencilSimple />
              </SIconButton>
              <SIconButton
                variant="ghost"
                color="error"
                size="md"
                :aria-label="$t('profile-remove-friend')"
                @click="removeFriend(friend.friendUser.id)"
              >
                <PhTrash />
              </SIconButton>
            </div>
          </div>
        </section>

        <!-- Logout -->
        <div class="fixed inset-x-3 bottom-4">
          <SButton variant="outline" color="error" size="xxl" class="w-full" @click="logout">
            {{ $t("profile-logout") }}
          </SButton>
        </div>
      </div>
    </template>
  </Layout>

  <!-- Add Friend Sheet -->
  <AddFriendSheet v-model="showAddFriend" />

  <!-- Hidden file input for avatar upload -->
  <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
  <input
    ref="fileInputRef"
    type="file"
    accept="image/*"
    class="hidden"
    :disabled="avatarControlsDisabled"
    @change="handleAvatarFile"
  />

  <!-- Edit Nickname Sheet -->
  <EditNicknameSheet
    v-model="showEditNickname"
    :friend-id="editingFriendId"
    :friend-name="editingFriendName"
    :current-remark="editingFriendRemark"
  />
</template>
