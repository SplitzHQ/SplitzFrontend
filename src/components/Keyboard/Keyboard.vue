<script setup lang="ts">
import { ref } from 'vue'
import { PhBackspace, PhDivide, PhMinus, PhPlus, PhX } from '@phosphor-icons/vue'
import SButton from '@/components/SButton/SButtonBase.vue'
import Calculator, { type CalculatorInput, type Operator } from './Calculator'

interface KeyboardProps {
  enableCalculator?: boolean
}

const emit = defineEmits(['change'])
const { enableCalculator = true } = defineProps<KeyboardProps>()

const calculator = ref<Calculator>(new Calculator())
const expression = ref<string>('')

const input = (value: CalculatorInput | Operator | '.' | 'backspace') => {
  if (value === 'backspace') calculator.value.backspace()
  else if (value === '.') calculator.value.dot()
  else if (value === '+') calculator.value.plus()
  else if (value === '-') calculator.value.minus()
  else if (value === '*') calculator.value.times()
  else if (value === '/') calculator.value.div()
  else calculator.value.input(value)

  if (!calculator.value.isComplexExpression) expression.value = calculator.value.expression.join(' ')
  else expression.value = [...calculator.value.expression, '=', calculator.value.result].join(' ')
  emit('change', calculator.value.result)
}
</script>

<template>
  <div class="flex flex-col gap-4 border-t border-base-border-tertiary bg-base-bg-secondary p-4">
    <div class="py-1">
      <div class="flex items-center justify-center">{{ expression }}</div>
      <div class="grid-keyboard grid grow gap-2">
        <SButton color="brand" variant="ghost" size="xxl" @click="input(1)">1</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(2)">2</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(3)">3</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input('+')">
          <template #icon-left>
            <PhPlus />
          </template>
        </SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(4)">4</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(5)">5</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(6)">6</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input('-')">
          <template #icon-left>
            <PhMinus />
          </template>
        </SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(7)">7</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(8)">8</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input(9)">9</SButton>
        <SButton color="brand" variant="ghost" size="xxl" @click="input('*')">
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
        <SButton color="brand" variant="ghost" size="xxl" @click="input('/')">
          <template #icon-left>
            <PhDivide />
          </template>
        </SButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid-keyboard {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, max-content);
}
</style>
