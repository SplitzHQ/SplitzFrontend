import { ref, watch } from 'vue'

import { useTransactionStore } from '@/stores/transaction'

const keyboardValue = ref(0)
const focusedInputUserId = ref<string | null>(null)

export const useKeyboardControl = () => {
  const transactionStore = useTransactionStore()

  watch(keyboardValue, (newValue) => {
    if (focusedInputUserId.value) {
      if (transactionStore.splitMethod === 'percentage') {
        if (newValue === 0) transactionStore.splitByPercentageDetails[focusedInputUserId.value] = undefined
        else transactionStore.splitByPercentageDetails[focusedInputUserId.value] = newValue
      } else if (transactionStore.splitMethod === 'shares') {
        if (newValue === 0) transactionStore.splitBySharesDetails[focusedInputUserId.value] = undefined
        else transactionStore.splitBySharesDetails[focusedInputUserId.value] = newValue
      } else if (transactionStore.splitMethod === 'adjustment') {
        if (newValue === 0) transactionStore.splitByAdjustmentDetails[focusedInputUserId.value] = undefined
        else transactionStore.splitByAdjustmentDetails[focusedInputUserId.value] = newValue
      } else if (transactionStore.splitMethod === 'custom') {
        if (newValue === 0) transactionStore.splitByCustomDetails[focusedInputUserId.value] = undefined
        else transactionStore.splitByCustomDetails[focusedInputUserId.value] = newValue
      }
    }
  })

  const setFocusedInputUserId = (userId: string | null) => {
    focusedInputUserId.value = userId
    if (userId) {
      if (transactionStore.splitMethod === 'percentage')
        keyboardValue.value = transactionStore.splitByPercentageDetails[userId] ?? 0
      else if (transactionStore.splitMethod === 'shares')
        keyboardValue.value = transactionStore.splitBySharesDetails[userId] ?? 0
      else if (transactionStore.splitMethod === 'adjustment')
        keyboardValue.value = transactionStore.splitByAdjustmentDetails[userId] ?? 0
      else if (transactionStore.splitMethod === 'custom')
        keyboardValue.value = transactionStore.splitByCustomDetails[userId] ?? 0
      else keyboardValue.value = 0
    }
  }

  return {
    keyboardValue,
    focusedInputUserId,
    setFocusedInputUserId
  }
}
