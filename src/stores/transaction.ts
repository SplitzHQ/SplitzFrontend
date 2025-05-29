import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { SplitzUserReducedDto, TransactionDraftInputDto } from '@/backend'

export const useTransactionStore = defineStore('transaction', () => {
  const transaction = ref<TransactionDraftInputDto>({
    userId: ''
  })
  const members = ref<SplitzUserReducedDto[]>([])

  return { transaction, members }
})
