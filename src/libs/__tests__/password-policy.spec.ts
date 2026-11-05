import { describe, expect, it } from "vitest";

import { meetsPasswordPolicy, PASSWORD_RULES } from "../password-policy";

describe("password policy", () => {
  it("accepts a password that passes all rules", () => {
    expect(meetsPasswordPolicy("SplitDinner2026")).toBe(true);
  });

  it.each(["abc12", "SPLITDINNER2026", "SplitDinnerParty"])("refuses %s", (password) => {
    expect(meetsPasswordPolicy(password)).toBe(false);
  });

  it("reads each rule alone, so the checklist can show the rules one by one", () => {
    expect(PASSWORD_RULES.map((rule) => rule.passes("dinner2026"))).toEqual([false, true, true]);
  });
});
