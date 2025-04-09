import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { TransactionDraft } from '@/types/transaction-draft'

export const useTransactionStore = defineStore('transaction', () => {
  const transaction = ref<TransactionDraft>({
    transactionDraftId: ''
  })

  return { transaction }
})
