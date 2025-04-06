import type { Transaction } from './transaction'

export type TransactionDraft = Partial<Exclude<Transaction, 'transactionId'>> & {
  transactionDraftId: string
}
