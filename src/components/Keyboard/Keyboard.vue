<script setup lang="ts">
import { PhBackspace, PhDivide, PhMinus, PhPlus, PhX } from "@phosphor-icons/vue";
import { computed, onMounted, watch } from "vue";

import SButton from "@/components/SButton/SButtonBase.vue";

import useCalculator, { type CalculatorInput, type Operator } from "./UseCalculator";

export interface KeyboardProps {
  enableCalculator?: boolean;
  variant: "ghost" | "primary";
}

const model = defineModel<number | null>();
const { enableCalculator = true } = defineProps<KeyboardProps>();

const calculator = useCalculator();

onMounted(() => {
  calculator.initialize(model.value ?? null);
});

// Watch for external changes to the model value
watch(
  () => model.value,
  (newValue) => {
    // Only reinitialize if the new value is different from the current calculator result
    // to avoid infinite loops when the calculator updates the model
    if (newValue !== calculator.result.value) {
      calculator.initialize(newValue ?? null);
    }
  }
);

const expression = computed(() => {
  return calculator.expression.value.join(" ");
  // if (!calculator.isComplexExpression.value) return calculator.expression.value.join(' ')
  // else return [...calculator.expression.value, '=', calculator.result.value].join(' ')
});

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
      enableCalculator ? 'enable-calculator' : 'disable-calculator',
      'flex flex-col gap-2 border-t',
      variant === 'primary' ? 'border-base-border-tertiary bg-base-bg-secondary' : 'border-transparent'
    ]"
  >
    <div
      class="expression hide-when-calculator-disabled flex items-center justify-center text-lg font-normal text-base-text-brand"
    >
      {{ expression }}
    </div>
    <div class="grid-keyboard grid grow gap-2 select-none">
      <SButton color="brand" variant="ghost" size="xxl" @click="input(1)">1</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(2)">2</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(3)">3</SButton>
      <SButton class="hide-when-calculator-disabled" color="brand" variant="ghost" size="xxl" @click="input('+')">
        <template #icon-left>
          <PhPlus />
        </template>
      </SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(4)">4</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(5)">5</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(6)">6</SButton>
      <SButton class="hide-when-calculator-disabled" color="brand" variant="ghost" size="xxl" @click="input('-')">
        <template #icon-left>
          <PhMinus />
        </template>
      </SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(7)">7</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(8)">8</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(9)">9</SButton>
      <SButton class="hide-when-calculator-disabled" color="brand" variant="ghost" size="xxl" @click="input('×')">
        <template #icon-left>
          <PhX />
        </template>
      </SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input('.')">.</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input(0)">0</SButton>
      <SButton color="brand" variant="ghost" size="xxl" @click="input('backspace')">
        <template #icon-left>
          <PhBackspace />
        </template>
      </SButton>
      <SButton class="hide-when-calculator-disabled" color="brand" variant="ghost" size="xxl" @click="input('÷')">
        <template #icon-left>
          <PhDivide />
        </template>
      </SButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.expression {
  height: 1.75rem;
}

.grid-keyboard {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, max-content);
}

.disable-calculator {
  .grid-keyboard {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hide-when-calculator-disabled {
    @apply hidden;
  }
}
</style>
