import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { SplitzUserReducedDto, TransactionDraftInputDto } from '@/backend'
import type { SplitMethod } from '@/types/split-method'

export const useTransactionStore = defineStore('transaction', () => {
  const transaction = ref<TransactionDraftInputDto>({
    userId: '',
    amount: 0,
    currency: 'USD'
  })

  const members = ref<SplitzUserReducedDto[]>([])
  const paidBy = ref<string>()
  const includedMembersId = ref<string[]>([])
  const excludedMembersId = computed(() => {
    return members.value.map((member) => member.id).filter((id) => !includedMembersId.value.includes(id))
  })
  const addToIncludedMembers = (memberId: string) => {
    if (!includedMembersId.value.includes(memberId)) {
      includedMembersId.value.push(memberId)
    }
  }
  const removeFromIncludedMembers = (memberId: string) => {
    const index = includedMembersId.value.indexOf(memberId)
    if (index !== -1) {
      includedMembersId.value.splice(index, 1)
    }
  }

  const splitMethod = ref<SplitMethod>('equally')
  const splitByPercentageDetails = ref<Record<string, number | undefined>>({})
  const splitBySharesDetails = ref<Record<string, number | undefined>>({})
  const splitByAdjustmentDetails = ref<Record<string, number | undefined>>({})
  const splitByCustomDetails = ref<Record<string, number | undefined>>({})
  const finalSplitAmount = computed(() => {
    if (splitMethod.value === 'equally') {
      return includedMembersId.value.reduce<Record<string, number>>((acc, memberId) => {
        acc[memberId] = (transaction.value.amount ?? 0) / includedMembersId.value.length
        return acc
      }, {})
    } else if (splitMethod.value === 'percentage') {
      return includedMembersId.value.reduce<Record<string, number>>((acc, memberId) => {
        const defaultPercentage = 100 / includedMembersId.value.length
        acc[memberId] =
          ((splitByPercentageDetails.value[memberId] ?? defaultPercentage) * (transaction.value.amount ?? 0)) / 100
        return acc
      }, {})
    } else if (splitMethod.value === 'shares') {
      const totalShares = includedMembersId.value.reduce((sum, memberId) => {
        return sum + (splitBySharesDetails.value[memberId] ?? 1)
      }, 0)
      return includedMembersId.value.reduce<Record<string, number>>((acc, memberId) => {
        acc[memberId] = ((splitBySharesDetails.value[memberId] ?? 1) / totalShares) * (transaction.value.amount ?? 0)
        return acc
      }, {})
    } else if (splitMethod.value === 'adjustment') {
      const totalAdjustment = includedMembersId.value.reduce((sum, memberId) => {
        return sum + (splitByAdjustmentDetails.value[memberId] ?? 0)
      }, 0)
      return includedMembersId.value.reduce<Record<string, number>>((acc, memberId) => {
        acc[memberId] =
          ((transaction.value.amount ?? 0) - totalAdjustment) / includedMembersId.value.length +
          (splitByAdjustmentDetails.value[memberId] ?? 0)
        return acc
      }, {})
    } else {
      return includedMembersId.value.reduce<Record<string, number>>((acc, memberId) => {
        acc[memberId] = splitByCustomDetails.value[memberId] ?? 0
        return acc
      }, {})
    }
  })
  const decreaseSplitByShares = (memberId: string) => {
    if (!splitBySharesDetails.value[memberId]) {
      splitBySharesDetails.value[memberId] = 1
    }
    if (splitBySharesDetails.value[memberId] > 1) {
      splitBySharesDetails.value[memberId] -= 1
    }
  }
  const increaseSplitByShares = (memberId: string) => {
    if (!splitBySharesDetails.value[memberId]) {
      splitBySharesDetails.value[memberId] = 1
    }
    splitBySharesDetails.value[memberId] += 1
  }

  return {
    transaction,
    members,
    paidBy,
    includedMembersId,
    excludedMembersId,
    addToIncludedMembers,
    removeFromIncludedMembers,
    splitMethod,
    splitByPercentageDetails,
    splitBySharesDetails,
    splitByAdjustmentDetails,
    splitByCustomDetails,
    finalSplitAmount,
    decreaseSplitByShares,
    increaseSplitByShares
  }
})
