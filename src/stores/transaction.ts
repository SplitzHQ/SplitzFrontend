import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { TransactionDraft } from '@/types/transaction-draft'

export const useTransactionStore = defineStore('transaction', () => {
  const transaction = ref<TransactionDraft>({
    transactionDraftId: ''
  })

  return { transaction }
})
