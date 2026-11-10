import { computed, ref, watch } from "vue";

import { useTransactionStore } from "@/stores/transaction";

const keyboardValue = ref(0);
const focusedInputUserId = ref<string | null>(null);

export const useKeyboardControl = () => {
  const transactionStore = useTransactionStore();

  watch(keyboardValue, (newValue) => {
    if (focusedInputUserId.value) {
      switch (transactionStore.splitMethod) {
        case "percentage": {
          if (newValue === 0) transactionStore.splitByPercentageDetails[focusedInputUserId.value] = undefined;
          else transactionStore.splitByPercentageDetails[focusedInputUserId.value] = newValue;
          break;
        }
        case "shares": {
          if (newValue === 0) transactionStore.splitBySharesDetails[focusedInputUserId.value] = undefined;
          else transactionStore.splitBySharesDetails[focusedInputUserId.value] = newValue;
          break;
        }
        case "adjustment": {
          if (newValue === 0) transactionStore.splitByAdjustmentDetails[focusedInputUserId.value] = undefined;
          else transactionStore.splitByAdjustmentDetails[focusedInputUserId.value] = newValue;
          break;
        }
        case "custom": {
          if (newValue === 0) transactionStore.splitByCustomDetails[focusedInputUserId.value] = undefined;
          else transactionStore.splitByCustomDetails[focusedInputUserId.value] = newValue;
          break;
        }
        case "equally":
          break;
      }
    }
  });

  /**
   * The decimal places that the keyboard accepts for the current split method.
   * A share count is a whole number. A percentage has two places. An amount follows the currency, so JPY has none.
   */
  const keyboardDecimals = computed(() => {
    switch (transactionStore.splitMethod) {
      case "shares":
        return 0;
      case "percentage":
        return 2;
      case "adjustment":
      case "custom":
      case "equally":
        return transactionStore.amountDecimals;
    }
  });

  const setFocusedInputUserId = (userId: string | null) => {
    focusedInputUserId.value = userId;
    if (userId) {
      switch (transactionStore.splitMethod) {
        case "percentage":
          keyboardValue.value = transactionStore.splitByPercentageDetails[userId] ?? 0;
          break;
        case "shares":
          keyboardValue.value = transactionStore.splitBySharesDetails[userId] ?? 0;
          break;
        case "adjustment":
          keyboardValue.value = transactionStore.splitByAdjustmentDetails[userId] ?? 0;
          break;
        case "custom":
          keyboardValue.value = transactionStore.splitByCustomDetails[userId] ?? 0;
          break;
        case "equally":
          keyboardValue.value = 0;
          break;
      }
    }
  };

  return {
    focusedInputUserId,
    keyboardDecimals,
    keyboardValue,
    setFocusedInputUserId,
  };
};
