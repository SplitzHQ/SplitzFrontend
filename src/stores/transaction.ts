import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { SplitzUserReducedDto, TransactionDraftInputDto } from '@/backend'

export const useTransactionStore = defineStore('transaction', () => {
  const transaction = ref<TransactionDraftInputDto>({
    userId: ''
  })

  const members = ref<SplitzUserReducedDto[]>([])
  const paidBy = ref<string>()
  const includedMembersId = ref<string[]>([])
  const excludedMembersId = computed(() => {
    return members.value.map((member) => member.id).filter((id) => !includedMembersId.value.includes(id))
  })

  const splitMethod = ref<'equally' | 'percentage' | 'shares' | 'adjustment' | 'custom'>('equally')
  const splitByPercentageDetails = ref<Record<string, number>>({})
  const splitBySharesDetails = ref<Record<string, number>>({})
  const splitByAdjustmentDetails = ref<Record<string, number>>({})
  const splitByCustomDetails = ref<Record<string, number>>({})

  return {
    transaction,
    members,
    paidBy,
    splitMethod,
    includedMembersId,
    excludedMembersId,
    splitByPercentageDetails,
    splitBySharesDetails,
    splitByAdjustmentDetails,
    splitByCustomDetails
  }
})
