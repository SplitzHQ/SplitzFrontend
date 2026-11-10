import { describe, expect, it } from "vitest";

import { currencyFractionDigits } from "../format-currency";

describe("currencyFractionDigits", () => {
  it("returns the decimal places of the currency", () => {
    expect(currencyFractionDigits("JPY")).toBe(0);
    expect(currencyFractionDigits("USD")).toBe(2);
    expect(currencyFractionDigits("CNY")).toBe(2);
    expect(currencyFractionDigits("KWD")).toBe(3);
  });

  it("returns two places for a code that Intl rejects", () => {
    expect(currencyFractionDigits("NOT-A-CODE")).toBe(2);
  });
});
