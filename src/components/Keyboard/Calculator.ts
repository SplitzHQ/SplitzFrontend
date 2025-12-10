/* eslint-disable no-lonely-if */
import Big from "big.js";

export type CalculatorInput = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// if second boolean is true, the number is a decimal. The third number is the number of decimal places
export type PartialNumber = [Big, boolean, number];

export type Operator = "+" | "-" | "×" | "÷";

type CalculatorStack = PartialNumber | Operator;

export default class Calculator {
  stack: CalculatorStack[] = [];

  input(input: CalculatorInput) {
    if (this.stack.length === 0) {
      this.stack.push([new Big(input), false, 0]);
    } else {
      const last = this.stack[this.stack.length - 1]!;
      if (this.isOperator(last)) {
        // if last is an operator, add a new number
        this.stack.push([new Big(input), false, 0]);
      } else {
        // if last is a number, add the input to the number
        last[0] = last[0].times(10).plus(input);
        if (last[1]) {
          // if last is a decimal, increase the number of decimal places
          last[2]++;
        }
      }
    }
  }

  plus() {
    if (this.stack.length === 0) return;
    if (this.isOperator(this.stack[this.stack.length - 1]!)) this.stack.pop();
    this.stack.push("+");
  }

  minus() {
    if (this.stack.length === 0) return;
    if (this.isOperator(this.stack[this.stack.length - 1]!)) this.stack.pop();
    this.stack.push("-");
  }

  times() {
    if (this.stack.length === 0) return;
    if (this.isOperator(this.stack[this.stack.length - 1]!)) this.stack.pop();
    this.stack.push("×");
  }

  div() {
    if (this.stack.length === 0) return;
    if (this.isOperator(this.stack[this.stack.length - 1]!)) this.stack.pop();
    this.stack.push("÷");
  }

  dot() {
    if (this.stack.length === 0) {
      this.stack.push([Big(0), true, 0]);
    } else {
      const last = this.stack[this.stack.length - 1]!;
      if (typeof last === "string") {
        // if last is an operator, add a 0 before the dot
        this.stack.push([Big(0), true, 0]);
      } else {
        if (!last[1]) {
          // if last is not a decimal, add a dot
          last[1] = true;
        }
      }
    }
  }

  backspace() {
    if (this.stack.length !== 0) {
      const last = this.stack[this.stack.length - 1]!;
      if (this.isOperator(last)) {
        this.stack.pop();
      } else {
        // if last is a number, remove the last digit
        last[0] = last[0].div(10).round(0, 0);
        if (last[1]) {
          // last is a decimal
          if (last[2] === 0) {
            // if last is a decimal with no decimal places, remove the dot
            last[1] = false;
          } else {
            // if last is a decimal with decimal places, decrease the number of decimal places
            last[2]--;
          }
        }
        if (last[0].eq(0) && !last[1]) {
          // if last is 0, remove it
          this.stack.pop();
        }
      }
    }
  }

  get result() {
    let result = Big(0);
    let operator: Operator | null = null;
    let partialNumber: Big | null = null;
    for (const item of this.stack) {
      if (this.isOperator(item)) {
        operator = item;
      } else {
        if (partialNumber === null) {
          partialNumber = this.evaluatePartialNumber(item);
        } else {
          switch (operator) {
            case "+":
              partialNumber = partialNumber.plus(this.evaluatePartialNumber(item));
              break;
            case "-":
              partialNumber = partialNumber.minus(this.evaluatePartialNumber(item));
              break;
            case "×":
              partialNumber = partialNumber.times(this.evaluatePartialNumber(item));
              break;
            case "÷":
              partialNumber = partialNumber.div(this.evaluatePartialNumber(item));
              break;
            case null:
              break;
          }
        }
      }
    }
    if (partialNumber !== null) {
      result = partialNumber;
    }
    return result.toNumber();
  }

  get expression() {
    const expression: string[] = [];
    let lastOperator: Operator | null = null;
    for (const item of this.stack) {
      if (this.isOperator(item)) {
        if (lastOperator !== null && (lastOperator === "+" || lastOperator === "-") && (item === "×" || item === "÷")) {
          // add parentheses if the last operator is + or - and the current operator is × or ÷
          expression.splice(0, 0, "(");
          expression.push(")");
        }
        expression.push(item);
        lastOperator = item;
      } else {
        let num = this.evaluatePartialNumber(item).toFixed(item[2], 1);
        if (item[1] && item[2] === 0) {
          // if the number is a decimal with no decimal places, add a dot
          num += ".";
        }
        expression.push(num);
      }
    }
    return expression;
  }

  get isComplexExpression() {
    return this.stack.length > 2;
  }

  private isOperator(input: CalculatorStack): input is Operator {
    return input === "+" || input === "-" || input === "×" || input === "÷";
  }

  private evaluatePartialNumber(num: PartialNumber) {
    return num[0].div(Big(10).pow(num[2]));
  }
}
