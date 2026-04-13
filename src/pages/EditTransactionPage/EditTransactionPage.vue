<script setup lang="ts">
import NumberFlow, { type Format } from "@number-flow/vue";
import { PhPencil } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { useElementSize } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { GroupApi, TransactionApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import { categoryColorMap } from "@/components/Category/category-color";
import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Keyboard from "@/components/Keyboard/Keyboard.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import { getCategory, getMainCategory } from "@/libs/categories";
import reportError from "@/libs/report-error";
import AddExpenseDetailsSheet from "@/pages/NewExpensePage/ReviewAndCompletePage/AddExpenseDetailsSheet.vue";
import SelectCategorySheet from "@/pages/NewExpensePage/ReviewAndCompletePage/SelectCategorySheet.vue";
import PaidByButton from "@/pages/NewExpensePage/SelectSplitMethodPage/PaidByButton.vue";
import SplitMethodButton from "@/pages/NewExpensePage/SelectSplitMethodPage/SplitMethodButton.vue";
import { useKeyboardControl } from "@/pages/NewExpensePage/SelectSplitMethodPage/use-keyboard-control";
import UserItem from "@/pages/NewExpensePage/SelectSplitMethodPage/UserItem.vue";
import { useTransactionStore } from "@/stores/transaction";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const queryCache = useQueryCache();
const transactionStore = useTransactionStore();

const groupId = computed(() => route.params.groupId as string);
const transactionId = computed(() => route.params.transactionId as string);

const transactionApi = new TransactionApi(config);
const groupApi = new GroupApi(config);

// Fetch transaction and group data
const { state: transactionQuery } = useQuery({
  key: () => ["getTransaction", transactionId.value],
  query: () => transactionApi.getTransaction({ id: transactionId.value }),
});

const { state: groupQuery } = useQuery({
  key: () => ["getGroup", groupId.value],
  query: () => groupApi.getGroup({ groupId: groupId.value }),
});

const transaction = computed(() => transactionQuery.value.data);
const group = computed(() => groupQuery.value.data);
const isLoaded = ref(false);

// Load transaction data into store when both queries resolve
watch(
  [transaction, group],
  ([txn, grp]) => {
    if (txn && grp && !isLoaded.value) {
      transactionStore.loadTransaction(txn, grp.members);
      isLoaded.value = true;
    }
  },
  { immediate: true }
);

// Group avatar images
const avatarImages = computed(() => {
  if (!group.value) return [];
  if (group.value.photo) {
    return [{ alt: group.value.name, src: group.value.photo }];
  }
  return group.value.members.slice(0, 4).map((m) => ({ alt: m.userName, src: m.photo ?? null }));
});

// Amount display
const formatOptions = computed(
  (): Format => ({
    currency: transactionStore.transaction.currency ?? "USD",
    style: "currency",
  })
);
const formattedAmount = computed(() => {
  const amount = transactionStore.transaction.amount;
  return amount === null || amount === undefined ? "" : amount.toLocaleString(undefined, formatOptions.value);
});

// Category
const selectedCategory = computed({
  get: () => getCategory(transactionStore.transaction.icon),
  set: (next) => {
    transactionStore.transaction.icon = next;
  },
});
const mainCategory = computed(() => getMainCategory(transactionStore.transaction.icon));
const colorClass = computed(() => categoryColorMap[mainCategory.value]);

// Amount editing
const isEditingAmount = ref(false);

// Split keyboard control
const { keyboardValue, focusedInputUserId, setFocusedInputUserId } = useKeyboardControl();

const handleClickOutside = () => {
  if (focusedInputUserId.value) {
    setFocusedInputUserId(null);
  }
  if (isEditingAmount.value) {
    isEditingAmount.value = false;
  }
};
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Keyboard container sizing
const keyboardContainer = useTemplateRef("keyboardContainer");
const { height: keyboardHeight } = useElementSize(keyboardContainer);

// Details sheet and category sheet
const showDetailsSheet = ref(false);
const showCategorySheet = ref(false);

// Save
const isSaving = ref(false);

async function handleSave() {
  if (isSaving.value) return;

  try {
    isSaving.value = true;
    await transactionStore.saveTransaction();
    // Invalidate the transaction detail query so it refreshes
    await queryCache.invalidateQueries({ key: ["getTransaction", transactionId.value] });
    transactionStore.resetTransactionStore();
    void router.replace({
      name: "transactionDetail",
      params: { groupId: groupId.value, transactionId: transactionId.value },
    });
  } catch (error) {
    reportError("editTransaction", error);
    toast.error($t("edit-transaction-error-saving"));
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <div v-if="group" class="flex items-center justify-center gap-2">
          <Avatar :images="avatarImages" size="xs" />
          <p class="text-base font-medium text-base-text-primary">{{ group.name }}</p>
        </div>
        <template v-else>
          {{ $t("edit-transaction-title") }}
        </template>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <!-- Loading -->
      <div
        v-if="transactionQuery.status === 'pending'"
        v-bind="layoutAttrs"
        class="px-4 pt-6 text-base text-base-text-tertiary"
      >
        {{ $t("edit-transaction-loading") }}
      </div>

      <!-- Error -->
      <div
        v-else-if="transactionQuery.status === 'error'"
        v-bind="layoutAttrs"
        class="px-4 pt-6 text-base text-base-text-error"
      >
        {{ $t("edit-transaction-error") }}
      </div>

      <!-- Content -->
      <div v-else-if="isLoaded" v-bind="layoutAttrs" class="flex flex-1 flex-col">
        <div class="flex grow flex-col gap-6 overflow-y-auto px-4 pb-4">
          <!-- Amount Section -->
          <div class="flex flex-col items-center gap-3 pt-4" @click.stop>
            <button
              type="button"
              class="flex flex-col items-center gap-2"
              @click.stop="
                isEditingAmount = !isEditingAmount;
                setFocusedInputUserId(null);
              "
            >
              <div class="flex size-12 items-center justify-center rounded-xl" :class="colorClass">
                <CategoryIcon :category="selectedCategory" class="icon-6" />
              </div>
              <div
                :class="[
                  'flex h-16 items-center font-medium',
                  transactionStore.transaction.amount === 0 ? 'text-base-text-disabled' : 'text-base-text-primary',
                ]"
                :style="{ fontSize: `min(3.5rem, ${120 / formattedAmount.length}vw)` }"
              >
                <NumberFlow :value="transactionStore.transaction.amount!" :format="formatOptions" />
              </div>
            </button>
            <Transition name="slide-fade">
              <Keyboard
                v-if="isEditingAmount"
                v-model="transactionStore.transaction.amount"
                variant="ghost"
                :enable-calculator="true"
                @click.stop
              />
            </Transition>
          </div>

          <!-- Group (read-only) -->
          <div v-if="group" class="flex flex-col gap-1">
            <div class="text-sm font-medium text-base-text-tertiary">{{ $t("edit-transaction-group") }}</div>
            <div class="flex items-center gap-3 rounded-2xl bg-base-bg-secondary p-3">
              <Avatar :images="avatarImages" size="xs" />
              <p class="text-base font-medium text-base-text-primary">{{ group.name }}</p>
            </div>
          </div>

          <!-- Split Section -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <PaidByButton />
              <div class="h-6 w-px bg-base-border-secondary" />
              <SplitMethodButton />
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-base-text-tertiary">
                  {{ $t("new-expense-split-summary-included", { count: transactionStore.includedMembersId.length }) }}
                </div>
                <div class="flex items-start justify-start gap-1">
                  <div class="justify-start text-sm leading-tight font-medium text-base-text-quaternary">
                    {{ $t("new-expense-split-summary-total-amount") }}
                  </div>
                  <div class="justify-start text-sm leading-tight font-medium text-base-text-primary">
                    {{
                      transactionStore.transaction.amount?.toLocaleString(undefined, {
                        style: "currency",
                        currency: transactionStore.transaction.currency ?? "USD",
                      })
                    }}
                  </div>
                  <div
                    v-if="!transactionStore.isUserInputValid"
                    class="justify-start text-sm leading-tight font-medium text-base-text-error"
                    role="alert"
                    aria-live="polite"
                  >
                    {{ $t("new-expense-split-validation-invalid-input") }}
                  </div>
                </div>
              </div>
              <UserItem v-for="memberId in transactionStore.includedMembersId" :key="memberId" :user-id="memberId" />
            </div>
            <div v-if="transactionStore.excludedMembersId.length > 0" class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-base-text-tertiary">
                  {{
                    $t("new-expense-split-summary-not-included", { count: transactionStore.excludedMembersId.length })
                  }}
                </div>
              </div>
              <UserItem v-for="memberId in transactionStore.excludedMembersId" :key="memberId" :user-id="memberId" />
            </div>
          </div>

          <!-- Details Buttons -->
          <div class="flex flex-col gap-2">
            <SButton variant="secondary" color="neutral" size="lg" @click="showDetailsSheet = true">
              <PhPencil class="mr-2" />
              {{ $t("new-expense-review-actions-add-details") }}
            </SButton>
          </div>
        </div>

        <!-- Save Button -->
        <div class="shrink-0 px-4 pb-4" :style="{ paddingBottom: `${Math.max(keyboardHeight ?? 0, 16)}px` }">
          <SButton
            :disabled="!transactionStore.isUserInputValid || isSaving"
            :loading="isSaving"
            color="brand"
            variant="primary"
            size="xxl"
            class="w-full"
            @click="handleSave"
          >
            {{ $t("edit-transaction-save") }}
          </SButton>
        </div>

        <!-- Split Keyboard (teleported) -->
        <Teleport to="body">
          <div ref="keyboardContainer" class="fixed inset-x-0 bottom-0 z-fixed">
            <Transition name="slide-fade">
              <div v-if="focusedInputUserId" class="-mt-4" @click.stop>
                <Keyboard v-model="keyboardValue" class="px-4 pb-4" variant="primary" enable-calculator />
              </div>
            </Transition>
          </div>
        </Teleport>
      </div>

      <!-- Details Sheet -->
      <AddExpenseDetailsSheet v-model="showDetailsSheet" />
      <!-- Category Sheet -->
      <SelectCategorySheet v-model="showCategorySheet" v-model:category="selectedCategory" />
    </template>
  </Layout>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  transform-origin: bottom;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
