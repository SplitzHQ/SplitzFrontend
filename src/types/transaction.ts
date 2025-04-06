import type { Tag } from './tag'
import type { TransactionBalance } from './transaction-balance'

export interface Transaction {
  transactionId: string
  groupId: string
  name: string
  icon: string
  createTime: Date
  transactionTime: Date
  amount: number
  currency: string
  tags: Tag[]
  geoCoordinate: string
  photo: string
  balances: TransactionBalance[]
}
