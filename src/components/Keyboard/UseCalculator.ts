/* eslint-disable no-lonely-if */
import { Big } from "big.js";
import { computed, ref } from "vue";

/** A digit key. */
export type CalculatorInput = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * A number on the line: the digits as a whole number, true when the number has a dot, and the count of decimal places.
 * For example, "1.50" is `[150, true, 2]`. This form keeps the zeros and the dot that the user typed.
 */
export type PartialNumber = [Big, boolean, number];

/** An operator key. */
export type Operator = "+" | "-" | "×" | "÷";

type CalculatorStack = PartialNumber | Operator;

/** The limits of the line. See `keyboard.usage.ts` for the values that the app uses. */
export interface CalculatorLimits {
  /** The most digits before the dot, in each number and in the value. For 7, the largest value is 9,999,999. */
  maxIntegerDigits: number;
  /** The most digits after the dot in each number. The value is rounded to this count. 0 also blocks the dot. */
  maxDecimals: number;
}

/** The options of `useCalculator`. */
export interface CalculatorOptions {
  /** Returns the current limits. It is a function, so a limit can change while the keyboard is open. No limits when it is missing. */
  limits?: () => CalculatorLimits;
}

/**
 * The state of the number keyboard: the line that the user types, and its value.
 * The value uses big.js, so 0.1 + 0.2 is 0.3. The value is calculated from left to right, and `expression` adds
 * parentheses to show this order. Only the first number can be negative, because only `initialize` can load one.
 *
 * Each key function except `backspace` returns false when the key would go over a limit. The line then stays as it was.
 */
export default function useCalculator({ limits }: CalculatorOptions = {}) {
  const stack = ref<CalculatorStack[]>([]);

  /**
   * Runs one key press, and undoes it when the new line goes over a limit. Returns true when the key press stays.
   * A check after the change is simpler than a check before it, because the operators and the dot change the value in
   * different ways: "5 × 1" is in the limit, but the next "0" can make the value too large.
   * The copy is shallow, because a key replaces a Big and never changes it.
   */
  function guarded(change: () => void): boolean {
    const current = limits?.();
    if (!current) {
      change();
      return true;
    }
    const before = stack.value.map((item) => (isOperator(item) ? item : ([...item] as PartialNumber)));
    change();
    if (fitsLimits(stack.value, current)) return true;
    stack.value = before;
    return false;
  }

  function input(input: CalculatorInput): boolean {
    return guarded(() => addDigit(input));
  }

  function addDigit(input: CalculatorInput) {
    if (stack.value.length === 0) {
      stack.value.push([new Big(input), false, 0]);
    } else {
      const last = stack.value[stack.value.length - 1];
      if (isOperator(last)) {
        // if last is an operator, add a new number
        stack.value.push([new Big(input), false, 0]);
      } else {
        // if last is a number, add the input to the number
        const isNegative = last[0].lt(0);
        last[0] = last[0].times(10);
        if (isNegative) {
          // if last is a negative number, subtract the input to maintain negative value
          last[0] = last[0].minus(input);
        } else {
          // if last is a positive number, add the input
          last[0] = last[0].plus(input);
        }
        if (last[1]) {
          // if last is a decimal, increase the number of decimal places
          last[2]++;
        }
      }
    }
  }

  function plus(): boolean {
    if (stack.value.length === 0) return true;
    return guarded(() => pushOperator("+"));
  }

  function minus(): boolean {
    if (stack.value.length === 0) {
      // Start with negative zero to allow negative number input
      stack.value.push([Big(0), false, 0], "-");
      return true;
    }
    return guarded(() => pushOperator("-"));
  }

  /** Adds an operator. A second operator replaces the first. */
  function pushOperator(operator: Operator) {
    if (isOperator(stack.value[stack.value.length - 1])) stack.value.pop();
    stack.value.push(operator);
  }

  function times(): boolean {
    if (stack.value.length === 0) return true;
    return guarded(() => pushOperator("×"));
  }

  function div(): boolean {
    if (stack.value.length === 0) return true;
    return guarded(() => pushOperator("÷"));
  }

  function dot(): boolean {
    return guarded(addDot);
  }

  function addDot() {
    if (stack.value.length === 0) {
      stack.value.push([Big(0), true, 0]);
    } else {
      const last = stack.value[stack.value.length - 1];
      if (typeof last === "string") {
        // if last is an operator, add a 0 before the dot
        stack.value.push([Big(0), true, 0]);
      } else {
        if (!last[1]) {
          // if last is not a decimal, add a dot
          last[1] = true;
        }
      }
    }
  }

  function backspace() {
    if (stack.value.length > 0) {
      const last = stack.value[stack.value.length - 1];
      if (isOperator(last)) {
        stack.value.pop();
      } else {
        // last is a number
        if (last[1]) {
          // last is a decimal
          if (last[2] === 0) {
            // if last is a decimal with no decimal places, remove the dot
            last[1] = false;
            return;
          } else {
            // if last is a decimal with decimal places, decrease the number of decimal places
            last[2]--;
          }
        }
        // remove the last digit
        last[0] = last[0].div(10).round(0, 0);
        if (last[0].eq(0) && !last[1]) {
          // if last is 0, remove it
          stack.value.pop();
        }
      }
    }
  }

  /** Replaces the line with one number. Zero, null and a value that is not finite give an empty line. */
  function initialize(value: number | null) {
    if (value === null || value === 0 || !Number.isFinite(value)) {
      stack.value = [];
      return;
    }

    const bigValue = new Big(value);
    // toFixed always gives normal notation. toString gives "1e-7" for a very small value, and that has no dot.
    const str = bigValue.toFixed();
    const decimalIndex = str.indexOf(".");

    if (decimalIndex === -1) {
      // whole number
      stack.value = [[bigValue, false, 0]];
    } else {
      // decimal number
      const decimalPlaces = str.length - decimalIndex - 1;
      const multiplier = Big(10).pow(decimalPlaces);
      // For negative decimals, we need to handle the conversion properly
      const integerValue = bigValue.times(multiplier);
      stack.value = [[integerValue, true, decimalPlaces]];
    }
  }

  /** The value, rounded half up to `maxDecimals`. A division such as 10 ÷ 3 then gives 3.33 and not 3.333…. */
  const result = computed(() => roundToLimits(evaluate(stack.value), limits?.()).toNumber());

  const expression = computed(() => {
    const expression: string[] = [];
    let lastOperator: Operator | null = null;
    for (const item of stack.value) {
      if (isOperator(item)) {
        if (lastOperator !== null && (lastOperator === "+" || lastOperator === "-") && (item === "×" || item === "÷")) {
          // add parentheses if the last operator is + or - and the current operator is × or ÷
          expression.splice(0, 0, "(");
          expression.push(")");
        }
        expression.push(item);
        lastOperator = item;
      } else {
        let num = evaluatePartialNumber(item).toFixed(item[2], 1);
        if (item[1] && item[2] === 0) {
          // if the number is a decimal with no decimal places, add a dot
          num += ".";
        }
        expression.push(num);
      }
    }
    return expression;
  });

  return {
    backspace,
    div,
    dot,
    expression,
    initialize,
    input,
    minus,
    plus,
    result,
    times,
  };
}

/** Calculates the value of the line from left to right. An empty line is 0. */
function evaluate(stack: CalculatorStack[]): Big {
  let result = Big(0);
  let operator: Operator | null = null;
  let partialNumber: Big | null = null;
  for (const item of stack) {
    if (isOperator(item)) {
      operator = item;
    } else {
      if (partialNumber === null) {
        partialNumber = evaluatePartialNumber(item);
      } else {
        switch (operator) {
          case "+":
            partialNumber = partialNumber.plus(evaluatePartialNumber(item));
            break;
          case "-":
            partialNumber = partialNumber.minus(evaluatePartialNumber(item));
            break;
          case "×":
            partialNumber = partialNumber.times(evaluatePartialNumber(item));
            break;
          case "÷": {
            // A zero divisor is often an unfinished number, for example the start of "0.5". big.js throws on it.
            // Keep the value until the divisor is not zero, as with an operator that has no number after it.
            const divisor = evaluatePartialNumber(item);
            if (!divisor.eq(0)) partialNumber = partialNumber.div(divisor);
            break;
          }
          case null:
            break;
        }
      }
    }
  }
  if (partialNumber !== null) {
    result = partialNumber;
  }
  return result;
}

/** Rounds a value half up to the decimal places of the limits. Without limits, the value does not change. */
function roundToLimits(value: Big, limits: CalculatorLimits | undefined): Big {
  return limits ? value.round(limits.maxDecimals, Big.roundHalfUp) : value;
}

/** Returns the count of digits before the dot. 0.5 has one digit, the zero. */
function integerDigits(value: Big): number {
  return value.abs().round(0, Big.roundDown).toFixed().length;
}

/**
 * Returns true when each number and the value are in the limits.
 * The value is checked after rounding, so 9,999,999.996 with two decimal places goes over seven digits.
 * The value check also catches a large result of two small numbers, such as 5,000 × 5,000.
 */
function fitsLimits(stack: CalculatorStack[], limits: CalculatorLimits): boolean {
  const numbersFit = stack.every((item) => {
    if (isOperator(item)) return true;
    const [, hasDot, decimals] = item;
    if (hasDot && limits.maxDecimals === 0) return false;
    return decimals <= limits.maxDecimals && integerDigits(evaluatePartialNumber(item)) <= limits.maxIntegerDigits;
  });
  return numbersFit && integerDigits(roundToLimits(evaluate(stack), limits)) <= limits.maxIntegerDigits;
}

function isOperator(input: CalculatorStack): input is Operator {
  return input === "+" || input === "-" || input === "×" || input === "÷";
}

function evaluatePartialNumber(num: PartialNumber) {
  return num[0].div(Big(10).pow(num[2]));
}
