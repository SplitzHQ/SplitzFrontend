<script setup lang="ts">
import { PhPencilSimple, PhPlus, PhTrash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { AccountApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
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

function triggerAvatarUpload() {
  fileInputRef.value?.click();
}

const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10 MB

async function handleAvatarFile(event: Event) {
  const input = event.target as HTMLInputElement;
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
  } catch {
    toast.error($t("profile-avatar-upload-error"));
  } finally {
    uploadingAvatar.value = false;
    input.value = "";
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
        {{ $t("profile-title") }}
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-6 px-4 pt-4 pb-28">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center gap-3">
          <div class="relative">
            <Avatar :images="[{ src: userStore.user?.photo ?? null, alt: userStore.user?.userName ?? '' }]" size="lg" />
            <button
              type="button"
              class="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-util-color-brand-700 text-white"
              :disabled="uploadingAvatar"
              @click="triggerAvatarUpload"
            >
              <PhPencilSimple class="size-4" />
            </button>
          </div>
          <p class="text-sm text-base-text-tertiary">{{ $t("profile-avatar-change") }}</p>
        </div>

        <!-- User Info Section -->
        <div class="flex flex-col gap-4">
          <!-- Username -->
          <div class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-base-text-primary">{{ $t("profile-username-label") }}</div>
            <div v-if="!isEditingUsername" class="flex items-center justify-between">
              <p class="text-base text-base-text-primary">{{ userStore.user?.userName }}</p>
              <SIconButton
                variant="ghost"
                color="neutral"
                size="md"
                :aria-label="$t('profile-edit-username')"
                @click="startEditingUsername"
              >
                <PhPencilSimple />
              </SIconButton>
            </div>
            <div v-else class="flex items-center gap-2">
              <div class="flex flex-1 items-center gap-2 overflow-clip rounded-full bg-util-alpha-black-5 px-4 py-3">
                <TextInput v-model="editedUsername" class="w-full" :placeholder="$t('profile-username-placeholder')" />
              </div>
              <SButton
                variant="primary"
                color="brand"
                size="lg"
                :loading="savingUsername"
                :disabled="!editedUsername.trim()"
                @click="saveUsername"
              >
                {{ $t("profile-save-username") }}
              </SButton>
            </div>
          </div>

          <!-- Email (read-only) -->
          <div class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-base-text-primary">{{ $t("profile-email-label") }}</div>
            <p class="text-base text-base-text-tertiary">{{ userStore.user?.email }}</p>
          </div>
        </div>

        <!-- Friends Section -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold text-base-text-primary">{{ $t("profile-friends-label") }}</div>
            <SIconButton variant="secondary" color="brand" size="md" @click="showAddFriend = true">
              <PhPlus />
            </SIconButton>
          </div>

          <div v-if="friends.length === 0" class="py-4 text-center text-sm text-base-text-tertiary">
            {{ $t("profile-friends-empty") }}
          </div>

          <div v-else class="flex flex-col gap-1">
            <div v-for="friend in friends" :key="friend.friendUser.id" class="flex items-center gap-3 rounded-2xl py-2">
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
                @click="startEditNickname(friend.friendUser.id, friend.friendUser.userName, friend.remark)"
              >
                <PhPencilSimple />
              </SIconButton>
              <SIconButton variant="ghost" color="error" size="md" @click="removeFriend(friend.friendUser.id)">
                <PhTrash />
              </SIconButton>
            </div>
          </div>
        </div>

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
  <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleAvatarFile" />

  <!-- Edit Nickname Sheet -->
  <EditNicknameSheet
    v-model="showEditNickname"
    :friend-id="editingFriendId"
    :friend-name="editingFriendName"
    :current-remark="editingFriendRemark"
  />
</template>
