import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { InvoiceApi, type InvoiceDto, type InvoiceInputDto, type TransactionDto } from "@/backend";
import config from "@/backend/config";

export const useInvoiceStore = defineStore("invoice", () => {
  const invoiceId = ref<string | null>(null);
  const invoice = ref<InvoiceInputDto>({
    currency: "USD",
    groupId: "",
    name: undefined,
    transactionIds: [],
  });
  const transactions = ref<TransactionDto[]>([]);
  const createdInvoice = ref<InvoiceDto | null>(null);

  const availableTransactions = computed(() => transactions.value.filter((tx) => !tx.invoiceId));

  const selectedTransactions = computed(() =>
    availableTransactions.value.filter(
      (tx) => tx.transactionId && invoice.value.transactionIds.includes(tx.transactionId)
    )
  );

  const selectedTransactionsCount = computed(() => invoice.value.transactionIds.length);

  const selectedTransactionsTotalAmount = computed(() =>
    selectedTransactions.value.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)
  );

  const isAllTransactionsSelected = computed(
    () =>
      availableTransactions.value.length > 0 &&
      invoice.value.transactionIds.length === availableTransactions.value.length
  );

  function toggleTransaction(id: string) {
    const index = invoice.value.transactionIds.indexOf(id);
    if (index !== -1) {
      invoice.value.transactionIds.splice(index, 1);
    } else {
      invoice.value.transactionIds.push(id);
    }
  }

  function toggleSelectAllTransactions() {
    if (isAllTransactionsSelected.value) {
      invoice.value.transactionIds = [];
    } else {
      invoice.value.transactionIds = availableTransactions.value.map((tx) => tx.transactionId!).filter(Boolean);
    }
  }

  async function saveInvoice(): Promise<InvoiceDto> {
    const api = new InvoiceApi(config);

    // If the invoice doesn't have an ID, it means it's not created yet, so we create it. Otherwise, we update the existing invoice.
    if (!invoiceId.value) {
      const result = await api.createInvoice({
        invoiceInputDto: invoice.value,
      });
      createdInvoice.value = result;
      invoiceId.value = result.invoiceId;
      return result;
    } else {
      await api.updateInvoice({
        id: invoiceId.value,
        invoiceInputDto: invoice.value,
      });
      const result = await api.getInvoice({ id: invoiceId.value });
      createdInvoice.value = result;
      return result;
    }
  }

  function reset() {
    invoice.value = {
      currency: "USD",
      groupId: "",
      name: undefined,
      transactionIds: [],
    };
    transactions.value = [];
    createdInvoice.value = null;
  }

  return {
    availableTransactions,
    createdInvoice,
    invoice,
    invoiceId,
    isAllTransactionsSelected,
    reset,
    saveInvoice,
    selectedTransactions,
    selectedTransactionsCount,
    selectedTransactionsTotalAmount,
    toggleSelectAllTransactions,
    toggleTransaction,
    transactions,
  };
});
