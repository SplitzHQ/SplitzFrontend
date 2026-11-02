<script setup lang="ts">
import { computed, shallowRef } from "vue";

import SSegmentControl from "@/components/SSegmentControl/SSegmentControl.vue";
import BalanceCard from "@/pages/GroupDetailPage/BalanceCard.vue";

import { registerChoices } from "../kit/choices";
import PrototypeChoice, { type ChoiceOption } from "../kit/PrototypeChoice.vue";
import PrototypeShell from "../kit/PrototypeShell.vue";
import VariantFrame from "../kit/VariantFrame.vue";
import { SCENARIO_ORDER, SCENARIOS } from "./model";
import SplitTotalsCard from "./SplitTotalsCard.vue";

/*
 * The balance card on the group detail page, in two variants side by side.
 * Both variants read the same sample scenario, so a switch in "Try it with" changes both.
 */

const SCENARIO_LABELS = SCENARIO_ORDER.map((id) => SCENARIOS[id].label);
const scenarioIndex = shallowRef(0);
const card = computed(() => SCENARIOS[SCENARIO_ORDER[scenarioIndex.value] ?? "mixed"].card);

type VariantId = "A" | "B";
const VARIANT_OPTIONS: ChoiceOption<VariantId>[] = [
  { label: "A · Net total", note: "Keep the card as it is: one net number, then a text line per member.", value: "A" },
  {
    label: "B · Split totals",
    note: "Show what you're owed and what you owe apart, so a net zero never hides open debts.",
    recommended: true,
    value: "B",
  },
];
const variant = shallowRef<VariantId>("B");

registerChoices(() => ({
  choices: { variant: variant.value },
  summary: [
    `Balance card: ${VARIANT_OPTIONS.find((option) => option.value === variant.value)?.label ?? variant.value}`,
  ],
}));
</script>

<template>
  <PrototypeShell>
    <template #description>
      The group detail page shows one balance card per currency. Variant A is the card in the app now. Variant B splits
      the net number into two totals.
    </template>

    <div class="flex flex-wrap gap-4">
      <section class="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl p-4 ring-2 ring-base-border-brand-solid">
        <h2 class="text-sm font-semibold">Your call · 1</h2>
        <PrototypeChoice v-model="variant" question="Which balance card should ship?" :options="VARIANT_OPTIONS" />
      </section>
      <section class="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl bg-base-bg-secondary p-4">
        <h2 class="text-sm font-semibold text-base-text-tertiary">Try it with</h2>
        <SSegmentControl v-model="scenarioIndex" class="self-start" size="sm" :items="SCENARIO_LABELS">
          <template #default="{ item }">{{ item }}</template>
        </SSegmentControl>
      </section>
    </div>

    <div class="flex flex-wrap gap-8">
      <VariantFrame
        id="A"
        title="Net total"
        current
        :notes="['One net number for the group.', 'Each member on a text line.']"
      >
        <BalanceCard v-bind="card" />
      </VariantFrame>
      <VariantFrame
        id="B"
        title="Split totals"
        :notes="['What you are owed and what you owe, apart.', 'One row per member, amounts aligned right.']"
      >
        <SplitTotalsCard v-bind="card" />
      </VariantFrame>
    </div>
  </PrototypeShell>
</template>
