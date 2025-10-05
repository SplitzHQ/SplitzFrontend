/* eslint-disable no-lonely-if */
import Big from 'big.js'
import { computed, ref } from 'vue'

export type CalculatorInput = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// if second boolean is true, the number is a decimal. The third number is the number of decimal places
export type PartialNumber = [Big, boolean, number]

export type Operator = '+' | '-' | '×' | '÷'

type CalculatorStack = PartialNumber | Operator

export default function useCalculator() {
  const stack = ref<CalculatorStack[]>([])

  function input(input: CalculatorInput) {
    if (stack.value.length === 0) {
      stack.value.push([new Big(input), false, 0])
    } else {
      const last = stack.value[stack.value.length - 1]!
      if (isOperator(last)) {
        // if last is an operator, add a new number
        stack.value.push([new Big(input), false, 0])
      } else {
        // if last is a number, add the input to the number
        const isNegative = last[0].lt(0)
        last[0] = last[0].times(10)
        if (isNegative) {
          // if last is a negative number, subtract the input to maintain negative value
          last[0] = last[0].minus(input)
        } else {
          // if last is a positive number, add the input
          last[0] = last[0].plus(input)
        }
        if (last[1]) {
          // if last is a decimal, increase the number of decimal places
          last[2]++
        }
      }
    }
  }

  function plus() {
    if (stack.value.length === 0) return
    if (isOperator(stack.value[stack.value.length - 1]!)) stack.value.pop()
    stack.value.push('+')
  }

  function minus() {
    if (stack.value.length === 0) {
      // Start with negative zero to allow negative number input
      stack.value.push([Big(0), false, 0], '-')
      return
    }
    if (isOperator(stack.value[stack.value.length - 1]!)) stack.value.pop()
    stack.value.push('-')
  }

  function times() {
    if (stack.value.length === 0) return
    if (isOperator(stack.value[stack.value.length - 1]!)) stack.value.pop()
    stack.value.push('×')
  }

  function div() {
    if (stack.value.length === 0) return
    if (isOperator(stack.value[stack.value.length - 1]!)) stack.value.pop()
    stack.value.push('÷')
  }

  function dot() {
    if (stack.value.length === 0) {
      stack.value.push([Big(0), true, 0])
    } else {
      const last = stack.value[stack.value.length - 1]!
      if (typeof last === 'string') {
        // if last is an operator, add a 0 before the dot
        stack.value.push([Big(0), true, 0])
      } else {
        if (!last[1]) {
          // if last is not a decimal, add a dot
          last[1] = true
        }
      }
    }
  }

  function backspace() {
    if (stack.value.length !== 0) {
      const last = stack.value[stack.value.length - 1]!
      if (isOperator(last)) {
        stack.value.pop()
      } else {
        // last is a number
        if (last[1]) {
          // last is a decimal
          if (last[2] === 0) {
            // if last is a decimal with no decimal places, remove the dot
            last[1] = false
            return
          } else {
            // if last is a decimal with decimal places, decrease the number of decimal places
            last[2]--
          }
        }
        // remove the last digit
        last[0] = last[0].div(10).round(0, 0)
        if (last[0].eq(0) && !last[1]) {
          // if last is 0, remove it
          stack.value.pop()
        }
      }
    }
  }

  function initialize(value: number | null) {
    if (value === null || value === 0) {
      stack.value = []
      return
    }

    const bigValue = new Big(value)
    const str = bigValue.toString()
    const decimalIndex = str.indexOf('.')

    if (decimalIndex === -1) {
      // whole number
      stack.value = [[bigValue, false, 0]]
    } else {
      // decimal number
      const decimalPlaces = str.length - decimalIndex - 1
      const multiplier = Big(10).pow(decimalPlaces)
      // For negative decimals, we need to handle the conversion properly
      const integerValue = bigValue.times(multiplier)
      stack.value = [[integerValue, true, decimalPlaces]]
    }
  }

  const result = computed(() => {
    let result = Big(0)
    let operator: Operator | null = null
    let partialNumber: Big | null = null
    for (const item of stack.value) {
      if (isOperator(item)) {
        operator = item
      } else {
        if (partialNumber === null) {
          partialNumber = evaluatePartialNumber(item)
        } else {
          switch (operator) {
            case '+':
              partialNumber = partialNumber.plus(evaluatePartialNumber(item))
              break
            case '-':
              partialNumber = partialNumber.minus(evaluatePartialNumber(item))
              break
            case '×':
              partialNumber = partialNumber.times(evaluatePartialNumber(item))
              break
            case '÷':
              partialNumber = partialNumber.div(evaluatePartialNumber(item))
              break
          }
        }
      }
    }
    if (partialNumber !== null) {
      result = partialNumber
    }
    return result.toNumber()
  })

  const expression = computed(() => {
    const expression: string[] = []
    let lastOperator: Operator | null = null
    for (const item of stack.value) {
      if (isOperator(item)) {
        if (lastOperator !== null && (lastOperator === '+' || lastOperator === '-') && (item === '×' || item === '÷')) {
          // add parentheses if the last operator is + or - and the current operator is × or ÷
          expression.splice(0, 0, '(')
          expression.push(')')
        }
        expression.push(item)
        lastOperator = item
      } else {
        let num = evaluatePartialNumber(item).toFixed(item[2], 1)
        if (item[1] && item[2] === 0) {
          // if the number is a decimal with no decimal places, add a dot
          num += '.'
        }
        // Handle negative numbers in expression display
        if (num.startsWith('-') && expression.length === 0) {
          // If it's the first number and negative, show it as is
          expression.push(num)
        } else if (num.startsWith('-')) {
          // If it's a negative number but not the first, format it properly
          expression.push(`(${num})`)
        } else {
          expression.push(num)
        }
      }
    }
    return expression
  })

  const isComplexExpression = computed(() => {
    return stack.value.length > 2
  })

  return {
    input,
    plus,
    minus,
    times,
    div,
    dot,
    backspace,
    initialize,
    result,
    expression,
    isComplexExpression
  }
}

function isOperator(input: CalculatorStack): input is Operator {
  return input === '+' || input === '-' || input === '×' || input === '÷'
}

function evaluatePartialNumber(num: PartialNumber) {
  return num[0].div(Big(10).pow(num[2]))
}
