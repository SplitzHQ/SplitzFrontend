<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { useFluent } from 'fluent-vue'
import { computed, ref } from 'vue'

import { GroupApi, AccountApi } from '@/backend'
import config from '@/backend/config'
import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Layout from '@/components/Layout/Layout.vue'
import SLinkButton from '@/components/SButton/SLinkButton.vue'

import FrequentSelectionList from './FrequentSelectionList.vue'
import SearchBar from './SearchBar.vue'
import UserList from './UserList.vue'
import type { UserListItem } from './types'

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

// selected items
const selectedItemsId = ref<string[]>([])
const onItemSelected = (itemId: string) => {
  if (selectedItemsId.value.includes(itemId)) {
    selectedItemsId.value = selectedItemsId.value.filter((id) => id !== itemId)
  } else {
    selectedItemsId.value.push(itemId)
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
        <SearchBar v-model="searchKeyword" />
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
          <SLinkButton
            href="/new-expense/select-split-method"
            variant="primary"
            color="brand"
            size="xxl"
            :disabled="selectedItemsId.length === 0"
          >
            {{ $t('Next') }}
          </SLinkButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
