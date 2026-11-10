import { describe, expect, it } from "vitest";

import useCalculator, { type CalculatorInput, type CalculatorLimits } from "../UseCalculator";

type Calculator = ReturnType<typeof useCalculator>;

/** Presses keys in order. A digit is one key. The word "back" is the backspace key. */
function press(calculator: Calculator, keys: string) {
  for (const key of keys.split(" ")) {
    if (key === "+") calculator.plus();
    else if (key === "-") calculator.minus();
    else if (key === "×") calculator.times();
    else if (key === "÷") calculator.div();
    else if (key === "back") calculator.backspace();
    else {
      for (const character of key) {
        if (character === ".") calculator.dot();
        else calculator.input(Number(character) as CalculatorInput);
      }
    }
  }
}

/** Returns a new calculator after the key presses. With `limits`, the calculator blocks the keys over the limits. */
function after(keys: string, start: number | null = null, limits?: CalculatorLimits) {
  const calculator = useCalculator(limits ? { limits: () => limits } : {});
  calculator.initialize(start);
  press(calculator, keys);
  return calculator;
}

/** Returns the text of the expression line. */
function line(calculator: Calculator) {
  return calculator.expression.value.join(" ");
}

describe("useCalculator", () => {
  describe("number entry", () => {
    it("builds a number from digits", () => {
      const calculator = after("125");

      expect(calculator.result.value).toBe(125);
      expect(line(calculator)).toBe("125");
    });

    it("drops leading zeros", () => {
      const calculator = after("0007");

      expect(calculator.result.value).toBe(7);
      expect(line(calculator)).toBe("7");
    });

    it("keeps the zeros and the dot of a decimal in progress", () => {
      expect(line(after("1."))).toBe("1.");
      expect(line(after("1.0"))).toBe("1.0");
      expect(line(after("1.50"))).toBe("1.50");
      expect(after("1.50").result.value).toBe(1.5);
    });

    it("starts a decimal with a zero when the first key is the dot", () => {
      expect(line(after("."))).toBe("0.");
      expect(after(".5").result.value).toBe(0.5);
    });

    it("ignores a second dot in one number", () => {
      expect(after("1..5").result.value).toBe(1.5);
      expect(after("1.5.5").result.value).toBe(1.55);
    });
  });

  describe("math", () => {
    it("has no floating-point error", () => {
      expect(after("0.1 + 0.2").result.value).toBe(0.3);
      expect(after("1.1 × 3").result.value).toBe(3.3);
      expect(after("0.3 - 0.1").result.value).toBe(0.2);
    });

    it("calculates from left to right and shows this with parentheses", () => {
      const calculator = after("1 + 2 × 3");

      expect(calculator.result.value).toBe(9);
      expect(line(calculator)).toBe("( 1 + 2 ) × 3");
    });

    it("does not add parentheses when the order is already left to right", () => {
      expect(line(after("2 × 3 + 1"))).toBe("2 × 3 + 1");
      expect(after("2 × 3 + 1").result.value).toBe(7);
    });

    it("keeps the value until the number after an operator starts", () => {
      expect(after("5 +").result.value).toBe(5);
      expect(after("5 ×").result.value).toBe(5);
      expect(after("5 ÷").result.value).toBe(5);
    });

    it("uses the last operator when the user presses several operators", () => {
      const calculator = after("5 + - × 2");

      expect(line(calculator)).toBe("5 × 2");
      expect(calculator.result.value).toBe(10);
    });

    it("ignores plus, times and divide on an empty line", () => {
      for (const key of ["+", "×", "÷"]) {
        expect(line(after(key))).toBe("");
      }
    });

    it("starts from zero for a minus on an empty line, because an adjustment can be negative", () => {
      const calculator = after("- 5");

      expect(line(calculator)).toBe("0 - 5");
      expect(calculator.result.value).toBe(-5);
    });

    it("can give a negative result", () => {
      expect(after("3 - 5").result.value).toBe(-2);
    });

    it("rounds a division that does not end to the precision of a number", () => {
      expect(after("1 ÷ 3").result.value).toBeCloseTo(0.333_333_333_333, 10);
      expect(after("1 ÷ 3 × 3").result.value).toBe(1);
    });
  });

  describe("division by zero", () => {
    it("does not throw and keeps the value before the division", () => {
      expect(after("5 ÷ 0").result.value).toBe(5);
    });

    it("keeps the value while the user types a divisor that starts with zero", () => {
      expect(after("5 ÷ 0.").result.value).toBe(5);
      expect(after("5 ÷ 0.0").result.value).toBe(5);
      expect(after("5 ÷ 0.5").result.value).toBe(10);
    });

    it("continues the calculation after a zero divisor", () => {
      expect(after("5 ÷ 0 + 1").result.value).toBe(6);
    });
  });

  describe("backspace", () => {
    it("removes one digit", () => {
      expect(line(after("125 back"))).toBe("12");
    });

    it("removes the dot and the decimal digits one at a time", () => {
      const calculator = after("1.05");
      const lines: string[] = [];
      for (let count = 0; count < 5; count++) {
        calculator.backspace();
        lines.push(line(calculator));
      }

      expect(lines).toEqual(["1.0", "1.", "1", "", ""]);
    });

    it("removes an operator", () => {
      const calculator = after("5 + back");

      expect(line(calculator)).toBe("5");
      expect(calculator.result.value).toBe(5);
    });

    it("removes the number after an operator and keeps the operator", () => {
      expect(line(after("5 + 3 back"))).toBe("5 +");
    });

    it("does nothing on an empty line", () => {
      const calculator = after("back back");

      expect(line(calculator)).toBe("");
      expect(calculator.result.value).toBe(0);
    });

    it("clears a line that has only a zero", () => {
      expect(line(after("0 back"))).toBe("");
    });
  });

  describe("long input", () => {
    it("shows every digit and gives the nearest number", () => {
      const calculator = after("12345678901234567890");

      expect(line(calculator)).toBe("12345678901234567890");
      expect(calculator.result.value).toBe(12_345_678_901_234_567_000);
    });

    it("does not throw when the value is larger than a number can hold", () => {
      const calculator = after("9".repeat(400));

      expect(calculator.result.value).toBe(Number.POSITIVE_INFINITY);
    });
  });

  describe("initialize", () => {
    it("is empty for zero and for null", () => {
      expect(line(after("", 0))).toBe("");
      expect(line(after("", null))).toBe("");
    });

    it("loads a whole number and a decimal so that typing continues them", () => {
      expect(line(after("5", 12))).toBe("125");
      expect(line(after("5", 1.5))).toBe("1.55");
      expect(after("5", 1.5).result.value).toBe(1.55);
    });

    it("keeps the sign when the user types after a negative value", () => {
      expect(after("5", -12).result.value).toBe(-125);
      expect(after("5", -1.5).result.value).toBe(-1.55);
      expect(after("back", -12).result.value).toBe(-1);
    });

    it("clears a negative value with backspace", () => {
      const calculator = after("back back", -12);

      expect(line(calculator)).toBe("");
      expect(calculator.result.value).toBe(0);
    });

    it("loads a very small value and a very large value in normal notation", () => {
      expect(line(after("", 0.000_000_1))).toBe("0.0000001");
      expect(line(after("", 1.5e25))).toBe("15000000000000000000000000");
    });

    it("is empty for a value that is not finite", () => {
      expect(line(after("", Number.POSITIVE_INFINITY))).toBe("");
      expect(line(after("", Number.NaN))).toBe("");
    });
  });

  describe("limits", () => {
    const usd: CalculatorLimits = { maxDecimals: 2, maxIntegerDigits: 7 };
    const jpy: CalculatorLimits = { maxDecimals: 0, maxIntegerDigits: 7 };

    it("blocks the eighth digit before the dot", () => {
      const calculator = after("12345678", null, usd);

      expect(line(calculator)).toBe("1234567");
      expect(calculator.result.value).toBe(1_234_567);
    });

    it("blocks a third decimal place", () => {
      const calculator = after("1.239", null, usd);

      expect(line(calculator)).toBe("1.23");
    });

    it("blocks the dot when the currency has no decimal places", () => {
      const calculator = after("12.5", null, jpy);

      expect(line(calculator)).toBe("125");
      expect(calculator.result.value).toBe(125);
    });

    it("blocks a digit that makes the value too large", () => {
      const calculator = after("5000 × 5000", null, usd);

      expect(line(calculator)).toBe("5000 × 500");
      expect(calculator.result.value).toBe(2_500_000);
    });

    it("returns false for a blocked key and true for an accepted key", () => {
      const calculator = after("1234567", null, usd);

      expect(calculator.input(8)).toBe(false);
      expect(calculator.plus()).toBe(true);
      expect(calculator.input(1)).toBe(true);
    });

    it("rounds the value half up to the decimal places", () => {
      expect(after("10 ÷ 3", null, usd).result.value).toBe(3.33);
      expect(after("2 ÷ 3", null, usd).result.value).toBe(0.67);
      expect(after("10 ÷ 4", null, jpy).result.value).toBe(3);
    });

    it("keeps a negative adjustment in the limits", () => {
      const calculator = after("- 12345678", null, usd);

      expect(line(calculator)).toBe("0 - 1234567");
      expect(calculator.result.value).toBe(-1_234_567);
    });

    it("always accepts backspace", () => {
      const calculator = after("back", 123_456_789, usd);

      expect(line(calculator)).toBe("12345678");
    });

    it("has no limits without the option", () => {
      expect(line(after("123456789.123"))).toBe("123456789.123");
    });
  });
});
