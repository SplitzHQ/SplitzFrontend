<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { useFluent } from 'fluent-vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import xxhash from 'xxhash-wasm'

import { GroupApi, AccountApi } from '@/backend'
import config from '@/backend/config'
import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Layout from '@/components/Layout/Layout.vue'
import SButton from '@/components/SButton/SButton.vue'
import { useTransactionStore } from '@/stores/transaction'

import FrequentSelectionList from './FrequentSelectionList.vue'
import SearchBar from './SearchBar.vue'
import UserList from './UserList.vue'
import type { UserListItem } from './types'

// transaction store
const transaction = useTransactionStore()

// router
const router = useRouter()

// i18n
const { $t } = useFluent()

// search keyword
const searchKeyword = ref<string>('')

// fetch groups and user info
const groupApi = new GroupApi(config)
const accountApi = new AccountApi(config)

const { state: groups } = useQuery({ key: ['getGroups'], query: () => groupApi.getGroups() })
const { state: userInfo } = useQuery({ key: ['getUserInfo'], query: () => accountApi.getUserInfo() })

// sort groups and friends
const sortedGroups = computed(() => {
  if (!groups.value.data) return []
  let groupsValue = [...groups.value.data]
  // todo: replace with flexsearch
  if (searchKeyword.value) groupsValue = groupsValue.filter((group) => group.name.includes(searchKeyword.value))
  return groupsValue.sort((a, b) => b.lastActivityTime.getTime() - a.lastActivityTime.getTime())
})
const sortedGroupsGroupOnly = computed(() => {
  return sortedGroups.value.filter((group) => group.members.length > 2)
})
const sortedFriends = computed(() => {
  if (!userInfo.value.data?.friends) return []
  let friendsValue = [...userInfo.value.data.friends]
  if (searchKeyword.value)
    friendsValue = friendsValue.filter(
      (friend) =>
        friend.friendUser.userName.includes(searchKeyword.value) || friend.remark?.includes(searchKeyword.value)
    )
  return friendsValue.sort(
    (a, b) =>
      a.remark?.localeCompare(b.remark ?? b.friendUser.userName) ??
      a.friendUser.userName.localeCompare(b.remark ?? b.friendUser.userName)
  )
})

// wrap groups and friends with UserListItem
const groupsInUserListItem = computed(() => {
  const result: UserListItem[] = sortedGroups.value.map((group) => ({
    __typename: 'UserListItemGroup',
    id: group.groupId,
    ...group
  }))
  return result
})
const groupsGroupOnlyInUserListItem = computed(() => {
  const result: UserListItem[] = sortedGroupsGroupOnly.value.map((group) => ({
    __typename: 'UserListItemGroup',
    id: group.groupId,
    ...group
  }))
  return result
})
const friendsInUserListItem = computed(() => {
  const result: UserListItem[] = sortedFriends.value.map((friend) => ({
    __typename: 'UserListItemFriend',
    id: friend.friendUser.id,
    ...friend
  }))
  return result
})

// selected items and selection handler
const selectedItemsId = ref<string[]>([])
const onItemSelected = (itemId: string) => {
  const group = groups.value.data?.find((g) => g.groupId === itemId)
  if (group) {
    // If the item is a group, we set the groupId in the transaction store
    transaction.transaction.groupId = itemId
    // Navigate to the next step
    return router.push({ name: 'newExpenseSelectSplitMethod' })
  }

  const friend = userInfo.value.data?.friends?.find((f) => f.friendUser.id === itemId)
  if (friend) {
    // if the item is a friend, we just add / remove the friend to the selected items
    if (selectedItemsId.value.includes(itemId)) {
      selectedItemsId.value = selectedItemsId.value.filter((id) => id !== itemId)
    } else {
      selectedItemsId.value.push(itemId)
    }
  }
}

// mapping selected users for the search bar
const selectedUsers = computed(() => {
  return (
    userInfo.value.data?.friends
      ?.filter((friend) => selectedItemsId.value.includes(friend.friendUser.id))
      .map((friend) => ({
        photo: friend.friendUser.photo,
        name: friend.remark ?? friend.friendUser.userName
      })) ?? []
  )
})

// onSelectedUsersSubmitted function to handle the submission of selected users
const onSelectedUsersSubmittedLoading = ref(false)
const onSelectedUsersSubmitted = async () => {
  if (!userInfo.value.data) return
  if (selectedItemsId.value.length === 0) return
  onSelectedUsersSubmittedLoading.value = true
  try {
    // this is standard behavior for the package.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { h64: xxhash64 } = await xxhash()
    const membersId = [...selectedItemsId.value, userInfo.value.data.id]
    const membersIdHash = xxhash64(membersId.sort((a, b) => a.localeCompare(b)).join(','))
      .toString(16)
      .toLowerCase()
    let group = groups.value.data?.find((g) => g.membersIdHash === membersIdHash)
    if (!group) {
      // If the group does not exist, create a new group
      const newGroup = await groupApi.createGroup({
        groupInputDto: {
          name: [...selectedUsers.value.map((user) => user.name), userInfo.value.data.userName]
            .sort((a, b) => a.localeCompare(b))
            .join(', '),
          membersId: selectedItemsId.value
        }
      })
      group = newGroup
    }
    transaction.transaction.groupId = group.groupId
    await router.push({ name: 'newExpenseSelectSplitMethod' })
  } finally {
    onSelectedUsersSubmittedLoading.value = false
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t('Select-People-Group') }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4 relative">
        <SearchBar v-model="searchKeyword" :selected-users="selectedUsers" />
        <FrequentSelectionList />
        <UserList
          v-if="groupsInUserListItem.length > 0"
          :title="$t('Recent')"
          :items="groupsInUserListItem"
          :selected-items-id="selectedItemsId"
          @select="onItemSelected"
        />
        <UserList
          v-if="groupsGroupOnlyInUserListItem.length > 0"
          :title="$t('Groups')"
          :items="groupsGroupOnlyInUserListItem"
          :selected-items-id="selectedItemsId"
          @select="onItemSelected"
        />
        <UserList
          v-if="friendsInUserListItem.length > 0"
          :title="$t('Friends')"
          :items="friendsInUserListItem"
          :selected-items-id="selectedItemsId"
          @select="onItemSelected"
        />
        <div class="absolute bottom-0 inset-x-3">
          <SButton
            variant="primary"
            color="brand"
            size="xxl"
            :disabled="selectedItemsId.length === 0"
            class="w-full"
            :loading="onSelectedUsersSubmittedLoading"
            @click="onSelectedUsersSubmitted"
          >
            {{ $t('Next') }}
          </SButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
