import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  TransactionApi,
  type SplitzUserReducedDto,
  type TransactionDraftInputDto,
  type TransactionInputDto,
  type TransactionBalanceInputDto,
  type TransactionDto
} from '@/backend'
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
  const transactionId = ref<string | undefined>(undefined)

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

    switch (splitMethod.value) {
      case 'equally': {
        const baseAmount = floor(totalAmount / memberIds.length)
        memberIds.forEach((memberId) => {
          result[memberId] = baseAmount
        })

        break
      }
      case 'percentage': {
        memberIds.forEach((memberId) => {
          const defaultPercentage = 100 / memberIds.length
          const percentage = splitByPercentageDetails.value[memberId] ?? defaultPercentage
          result[memberId] = floor((percentage / 100) * totalAmount)
        })

        break
      }
      case 'shares': {
        const totalShares = memberIds.reduce((sum, memberId) => {
          return sum + (splitBySharesDetails.value[memberId] ?? 1)
        }, 0)
        memberIds.forEach((memberId) => {
          const shares = splitBySharesDetails.value[memberId] ?? 1
          result[memberId] = floor((shares / totalShares) * totalAmount)
        })

        break
      }
      case 'adjustment': {
        const totalAdjustment = memberIds.reduce((sum, memberId) => {
          return sum + (splitByAdjustmentDetails.value[memberId] ?? 0)
        }, 0)
        const baseAmount = floor((totalAmount - totalAdjustment) / memberIds.length)
        memberIds.forEach((memberId) => {
          result[memberId] = baseAmount + (splitByAdjustmentDetails.value[memberId] ?? 0)
        })

        break
      }
      default: {
        // custom split method
        memberIds.forEach((memberId) => {
          result[memberId] = splitByCustomDetails.value[memberId] ?? 0
        })
      }
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
  // also handle rounding issues and ensure final split amounts are positive and sum correctly
  const isUserInputValid = computed(() => {
    const totalAmount = transaction.value.amount ?? 0

    // Check if transaction amount is positive
    if (totalAmount <= 0) {
      return false
    }

    // Check if there are included members
    if (sortedIncludedMembersId.value.length === 0) {
      return false
    }

    // Get the final split amounts to validate
    const splitAmounts = finalSplitAmount.value
    const memberIds = sortedIncludedMembersId.value

    // Check if all split amounts are positive
    const allAmountsPositive = memberIds.every((memberId) => {
      const amount = splitAmounts[memberId] ?? 0
      return amount > 0
    })

    if (!allAmountsPositive) {
      return false
    }

    // Check if the sum of split amounts equals the transaction amount (within tolerance)
    const totalSplitAmount = memberIds.reduce((sum, memberId) => {
      return sum + (splitAmounts[memberId] ?? 0)
    }, 0)

    const sumIsCorrect = Math.abs(totalSplitAmount - totalAmount) < ROUNDING_TOLERANCE

    if (!sumIsCorrect) {
      return false
    }

    // Additional validation based on split method
    switch (splitMethod.value) {
      case 'equally': {
        return true // Already validated above
      }
      case 'percentage': {
        const totalPercentage = sortedIncludedMembersId.value.reduce((sum, memberId) => {
          const defaultPercentage = 100 / sortedIncludedMembersId.value.length
          return sum + (splitByPercentageDetails.value[memberId] ?? defaultPercentage)
        }, 0)
        // Allow for small rounding errors (within ROUNDING_TOLERANCE%)
        return Math.abs(totalPercentage - 100) < ROUNDING_TOLERANCE
      }
      case 'shares': {
        // All shares must be positive integers
        return sortedIncludedMembersId.value.every((memberId) => {
          const shares = splitBySharesDetails.value[memberId] ?? 1
          return shares > 0 && Number.isInteger(shares)
        })
      }
      case 'adjustment': {
        const totalAdjustment = sortedIncludedMembersId.value.reduce((sum, memberId) => {
          return sum + (splitByAdjustmentDetails.value[memberId] ?? 0)
        }, 0)
        // Total adjustments shouldn't exceed the transaction amount
        // and the remaining amount should be positive
        const remainingAmount = totalAmount - totalAdjustment
        return remainingAmount >= ROUNDING_TOLERANCE // Allow for small amounts
      }
      default: {
        // custom split method - already validated that amounts are positive and sum correctly
        return true
      }
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

  // Method to save or update transaction to the database
  const saveTransaction = async (): Promise<TransactionDto> => {
    // Validate that we have the required data
    if (!transaction.value.amount || transaction.value.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0')
    }
    if (includedMembersId.value.length === 0) {
      throw new Error('At least one member must be included in the transaction')
    }
    if (!paidBy.value) {
      throw new Error('Paid by user must be specified')
    }
    if (!isUserInputValid.value) {
      throw new Error('Split details are not valid')
    }

    // Require groupId if not already set in transaction
    const groupId = transaction.value.groupId
    if (!groupId) {
      throw new Error('Group ID must be specified')
    }

    // Require name if not already set in transaction
    if (!transaction.value.name) {
      throw new Error('Transaction name must be specified')
    }

    // Create the API instance (you may want to inject configuration from elsewhere)
    const api = new TransactionApi()

    // Build the balance data from the final split amounts
    const balances: TransactionBalanceInputDto[] = Object.entries(finalSplitAmount.value).map(([userId, balance]) => ({
      userId,
      balance: balance - (paidBy.value === userId ? (transaction.value.amount ?? 0) : 0),
      transactionId: transactionId.value
    }))

    // prefill datetime
    transaction.value.createTime = new Date()
    transaction.value.transactionTime = new Date()

    // Construct the TransactionInputDto using data from the transaction store
    const transactionInput: TransactionInputDto = {
      transactionId: transactionId.value,
      groupId,
      name: transaction.value.name,
      icon: transaction.value.icon ?? 'default',
      createTime: transaction.value.createTime ?? new Date(),
      transactionTime: transaction.value.transactionTime ?? new Date(),
      amount: transaction.value.amount,
      currency: transaction.value.currency ?? 'USD',
      tags: transaction.value.tags ?? [],
      geoCoordinate: transaction.value.geoCoordinate,
      photo: transaction.value.photo,
      balances
    }

    // If transactionId exists, update the transaction, otherwise create a new one
    if (transactionId.value) {
      await api.updateTransaction({
        transactionId: transactionId.value,
        transactionInputDto: transactionInput
      })
      // For update, we need to get the updated transaction since updateTransaction returns void
      return await api.getTransaction({ id: transactionId.value })
    } else {
      // Create new transaction
      const result = await api.addTransaction({
        transactionInputDto: transactionInput
      })
      transactionId.value = result.transactionId
      return result
    }
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
    increaseSplitByShares,
    saveTransaction
  }
})
