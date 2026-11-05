<script setup lang="ts">
import { PhBackspace, PhDivide, PhMinus, PhPlus, PhX } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, watch } from "vue";

import SButton from "@/components/SButton/SButton.vue";

import useCalculator, { type CalculatorInput, type Operator } from "./UseCalculator";

/**
 * The on-screen number keyboard, with a calculator line above the keys. See `keyboard.usage.ts` for when to use it.
 * The value is in `v-model`. The caller shows the value, because the keyboard shows only the line that the user types.
 */
export interface KeyboardProps {
  /**
   * The frame around the keys. `primary` has a top line and a fill, for a keyboard that sits above other content.
   * `ghost` has no fill, for a keyboard that is part of the page. The keys are the same in both.
   */
  variant: "ghost" | "primary";
}

const model = defineModel<number | null>();
defineProps<KeyboardProps>();

const { $t } = useFluent();
const calculator = useCalculator();

calculator.initialize(model.value ?? null);

// Load a value that comes from outside. The check skips the value that the keyboard itself just wrote.
watch(
  () => model.value,
  (newValue) => {
    if (newValue !== calculator.result.value) {
      calculator.initialize(newValue ?? null);
    }
  }
);

const expression = computed(() => calculator.expression.value.join(" "));

/** Runs one key press and writes the new value to the model. */
const input = (value: CalculatorInput | Operator | "." | "backspace") => {
  switch (value) {
    case "backspace":
      calculator.backspace();
      break;
    case ".":
      calculator.dot();
      break;
    case "+":
      calculator.plus();
      break;
    case "-":
      calculator.minus();
      break;
    case "×":
      calculator.times();
      break;
    case "÷":
      calculator.div();
      break;
    default:
      calculator.input(value);
  }

  model.value = calculator.result.value;
};
</script>

<template>
  <div
    :class="[
      'flex flex-col gap-2 border-t',
      variant === 'primary' ? 'border-base-border-tertiary bg-base-bg-secondary' : 'border-transparent',
    ]"
  >
    <!-- A screen reader reads the line after each key press. The value itself is on the screen of the caller. -->
    <div
      class="flex h-7 items-center justify-center text-lg font-normal text-base-text-brand"
      aria-live="polite"
      aria-atomic="true"
      data-test="keyboard-expression"
    >
      {{ expression }}
    </div>
    <div
      class="grid grow grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,max-content)] gap-2 select-none"
      role="group"
      :aria-label="$t('keyboard-label')"
    >
      <SButton variant="ghost" size="xl" @click="input(1)">1</SButton>
      <SButton variant="ghost" size="xl" @click="input(2)">2</SButton>
      <SButton variant="ghost" size="xl" @click="input(3)">3</SButton>
      <SButton variant="ghost" size="xl" :aria-label="$t('keyboard-plus')" @click="input('+')">
        <template #icon-left>
          <PhPlus />
        </template>
      </SButton>
      <SButton variant="ghost" size="xl" @click="input(4)">4</SButton>
      <SButton variant="ghost" size="xl" @click="input(5)">5</SButton>
      <SButton variant="ghost" size="xl" @click="input(6)">6</SButton>
      <SButton variant="ghost" size="xl" :aria-label="$t('keyboard-minus')" @click="input('-')">
        <template #icon-left>
          <PhMinus />
        </template>
      </SButton>
      <SButton variant="ghost" size="xl" @click="input(7)">7</SButton>
      <SButton variant="ghost" size="xl" @click="input(8)">8</SButton>
      <SButton variant="ghost" size="xl" @click="input(9)">9</SButton>
      <SButton variant="ghost" size="xl" :aria-label="$t('keyboard-times')" @click="input('×')">
        <template #icon-left>
          <PhX />
        </template>
      </SButton>
      <SButton variant="ghost" size="xl" :aria-label="$t('keyboard-decimal')" @click="input('.')">.</SButton>
      <SButton variant="ghost" size="xl" @click="input(0)">0</SButton>
      <SButton variant="ghost" size="xl" :aria-label="$t('keyboard-backspace')" @click="input('backspace')">
        <template #icon-left>
          <PhBackspace />
        </template>
      </SButton>
      <SButton variant="ghost" size="xl" :aria-label="$t('keyboard-divide')" @click="input('÷')">
        <template #icon-left>
          <PhDivide />
        </template>
      </SButton>
    </div>
  </div>
</template>
