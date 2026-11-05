/** One rule of a new password. The backend uses the same rules. */
export interface PasswordRule {
  /** The locale key of the text of the rule. */
  labelKey: string;
  passes: (password: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { labelKey: "auth-password-rule-length", passes: (password) => password.length >= 12 },
  { labelKey: "auth-password-rule-lowercase", passes: (password) => /[a-z]/.test(password) },
  { labelKey: "auth-password-rule-number", passes: (password) => /\d/.test(password) },
];

/** Returns true when the password passes all rules. */
export function meetsPasswordPolicy(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.passes(password));
}
