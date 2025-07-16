import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { SplitzUserReducedDto, TransactionDraftInputDto } from '@/backend'
import type { SplitMethod } from '@/types/split-method'

const ROUNDING_TOLERANCE = 0.01
const FLOAT_COMPARE_TOLERANCE = 0.001

const floor = (value: number) => {
  return Math.floor(value / ROUNDING_TOLERANCE) * ROUNDING_TOLERANCE
}
const round = (value: number) => {
  return Math.round(value / ROUNDING_TOLERANCE) * ROUNDING_TOLERANCE
}

export const useTransactionStore = defineStore('transaction', () => {
  const transaction = ref<TransactionDraftInputDto>({
    userId: '',
    amount: 0,
    currency: 'USD'
  })

  const members = ref<SplitzUserReducedDto[]>([])
  const paidBy = ref<string>()
  const includedMembersId = ref<string[]>([])
  const sortedIncludedMembersId = computed(() => {
    return [...includedMembersId.value].sort()
  })
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
    const totalAmount = transaction.value.amount ?? 0
    const memberIds = sortedIncludedMembersId.value
    if (memberIds.length === 0) return {}

    const result: Record<string, number> = {}

    if (splitMethod.value === 'equally') {
      const baseAmount = floor(totalAmount / memberIds.length)
      memberIds.forEach((memberId) => {
        result[memberId] = baseAmount
      })
    } else if (splitMethod.value === 'percentage') {
      memberIds.forEach((memberId) => {
        const defaultPercentage = 100 / memberIds.length
        const percentage = splitByPercentageDetails.value[memberId] ?? defaultPercentage
        result[memberId] = floor((percentage / 100) * totalAmount)
      })
    } else if (splitMethod.value === 'shares') {
      const totalShares = memberIds.reduce((sum, memberId) => {
        return sum + (splitBySharesDetails.value[memberId] ?? 1)
      }, 0)
      memberIds.forEach((memberId) => {
        const shares = splitBySharesDetails.value[memberId] ?? 1
        result[memberId] = floor((shares / totalShares) * totalAmount)
      })
    } else if (splitMethod.value === 'adjustment') {
      const totalAdjustment = memberIds.reduce((sum, memberId) => {
        return sum + (splitByAdjustmentDetails.value[memberId] ?? 0)
      }, 0)
      const baseAmount = floor((totalAmount - totalAdjustment) / memberIds.length)
      memberIds.forEach((memberId) => {
        result[memberId] = baseAmount + (splitByAdjustmentDetails.value[memberId] ?? 0)
      })
    } else {
      // custom split method
      memberIds.forEach((memberId) => {
        result[memberId] = splitByCustomDetails.value[memberId] ?? 0
      })
    }

    // Handle rounding discrepancies by distributing remainder
    const currentTotal = Object.values(result).reduce((sum, amount) => sum + amount, 0)
    const remainder = totalAmount - currentTotal

    if (Math.abs(remainder) > FLOAT_COMPARE_TOLERANCE) {
      // calculate the amount to distribute, assume equal distribution with a minimum of ROUNDING_TOLERANCE
      // to avoid too small amounts that cannot be distributed
      const remainderPerMember =
        Math.sign(remainder) * Math.max(Math.abs(round(remainder / memberIds.length)), ROUNDING_TOLERANCE)
      let distributedRemainder = 0

      // Distribute the remainder to members, starting with the first member
      // end early if the remainder is all distributed
      for (let i = 0; i < memberIds.length && remainder - distributedRemainder > FLOAT_COMPARE_TOLERANCE; i++) {
        const memberId = memberIds[i]
        if (i === memberIds.length - 1) {
          // Give the last member any remaining amount to ensure exact total
          result[memberId] = round(result[memberId] + remainder - distributedRemainder)
        } else {
          result[memberId] = result[memberId] + remainderPerMember
          distributedRemainder += remainderPerMember
        }
      }
    }

    return result
  })
  // check if the user input splitDetails is valid
  // for percentage, shares, adjustment, and custom splits
  // also handle rounding issues
  const isUserInputValid = computed(() => {
    const totalAmount = transaction.value.amount ?? 0

    if (splitMethod.value === 'equally') {
      return true // Always valid for equal splits
    } else if (splitMethod.value === 'percentage') {
      const totalPercentage = sortedIncludedMembersId.value.reduce((sum, memberId) => {
        const defaultPercentage = 100 / sortedIncludedMembersId.value.length
        return sum + (splitByPercentageDetails.value[memberId] ?? defaultPercentage)
      }, 0)
      // Allow for small rounding errors (within ROUNDING_TOLERANCE%)
      return Math.abs(totalPercentage - 100) < ROUNDING_TOLERANCE
    } else if (splitMethod.value === 'shares') {
      // All shares must be positive integers
      return sortedIncludedMembersId.value.every((memberId) => {
        const shares = splitBySharesDetails.value[memberId] ?? 1
        return shares > 0 && Number.isInteger(shares)
      })
    } else if (splitMethod.value === 'adjustment') {
      const totalAdjustment = sortedIncludedMembersId.value.reduce((sum, memberId) => {
        return sum + (splitByAdjustmentDetails.value[memberId] ?? 0)
      }, 0)
      // Total adjustments shouldn't exceed the transaction amount
      // and the remaining amount should be positive
      const remainingAmount = totalAmount - totalAdjustment
      return remainingAmount >= ROUNDING_TOLERANCE // Allow for small amounts
    } else {
      // custom split method
      const totalCustomAmount = sortedIncludedMembersId.value.reduce((sum, memberId) => {
        return sum + (splitByCustomDetails.value[memberId] ?? 0)
      }, 0)
      // Allow for small rounding errors (within ROUNDING_TOLERANCE)
      return Math.abs(totalCustomAmount - totalAmount) < ROUNDING_TOLERANCE
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
    isUserInputValid,
    decreaseSplitByShares,
    increaseSplitByShares
  }
})
