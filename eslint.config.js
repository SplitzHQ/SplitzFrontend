import pluginEslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import pluginAntfu from "eslint-plugin-antfu";
import pluginDeMorgan from "eslint-plugin-de-morgan";
import pluginRegexp from "eslint-plugin-regexp";
import pluginSxzz from "eslint-plugin-sxzz";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginVue from "eslint-plugin-vue";
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["src/backend/**/*", ".storybook/**/*", "scripts/**/*", "**/*.js", "**/*.stories.ts"],
  },
  ...pluginVue.configs["flat/base"],
  ...pluginVueA11y.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    plugins: {
      sxzz: pluginSxzz,
      "unused-imports": pluginUnusedImports,
      "@eslint-community/eslint-comments": pluginEslintComments,
      antfu: pluginAntfu,
      regexp: pluginRegexp,
      "de-morgan": pluginDeMorgan,
    },
    rules: {
      "sxzz/prefer-string-function": "warn",
      "unused-imports/no-unused-imports": "warn",
      "@eslint-community/eslint-comments/disable-enable-pair": [
        "error",
        {
          allowWholeFile: true,
        },
      ],
      "@eslint-community/eslint-comments/no-aggregating-enable": "error",
      "@eslint-community/eslint-comments/no-duplicate-disable": "error",
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/no-unused-enable": "error",
      "antfu/import-dedupe": "error",
      "regexp/confusing-quantifier": "warn",
      "regexp/control-character-escape": "error",
      "regexp/match-any": "error",
      "regexp/negation": "error",
      "regexp/no-contradiction-with-assertion": "error",
      "regexp/no-dupe-characters-character-class": "error",
      "regexp/no-dupe-disjunctions": "error",
      "regexp/no-empty-alternative": "warn",
      "regexp/no-empty-capturing-group": "error",
      "regexp/no-empty-character-class": "error",
      "regexp/no-empty-group": "error",
      "regexp/no-empty-lookarounds-assertion": "error",
      "regexp/no-empty-string-literal": "error",
      "regexp/no-escape-backspace": "error",
      "regexp/no-extra-lookaround-assertions": "error",
      "regexp/no-invalid-regexp": "error",
      "regexp/no-invisible-character": "error",
      "regexp/no-lazy-ends": "warn",
      "regexp/no-legacy-features": "error",
      "regexp/no-misleading-capturing-group": "error",
      "regexp/no-misleading-unicode-character": "error",
      "regexp/no-missing-g-flag": "error",
      "regexp/no-non-standard-flag": "error",
      "regexp/no-obscure-range": "error",
      "regexp/no-optional-assertion": "error",
      "regexp/no-potentially-useless-backreference": "warn",
      "regexp/no-super-linear-backtracking": "error",
      "regexp/no-trivially-nested-assertion": "error",
      "regexp/no-trivially-nested-quantifier": "error",
      "regexp/no-unused-capturing-group": "error",
      "regexp/no-useless-assertions": "error",
      "regexp/no-useless-backreference": "error",
      "regexp/no-useless-character-class": "error",
      "regexp/no-useless-dollar-replacements": "error",
      "regexp/no-useless-escape": "error",
      "regexp/no-useless-flag": "warn",
      "regexp/no-useless-lazy": "error",
      "regexp/no-useless-non-capturing-group": "error",
      "regexp/no-useless-quantifier": "error",
      "regexp/no-useless-range": "error",
      "regexp/no-useless-set-operand": "error",
      "regexp/no-useless-string-literal": "error",
      "regexp/no-useless-two-nums-quantifier": "error",
      "regexp/no-zero-quantifier": "error",
      "regexp/optimal-lookaround-quantifier": "warn",
      "regexp/optimal-quantifier-concatenation": "error",
      "regexp/prefer-character-class": "error",
      "regexp/prefer-d": "error",
      "regexp/prefer-plus-quantifier": "error",
      "regexp/prefer-predefined-assertion": "error",
      "regexp/prefer-question-quantifier": "error",
      "regexp/prefer-range": "error",
      "regexp/prefer-set-operation": "error",
      "regexp/prefer-star-quantifier": "error",
      "regexp/prefer-unicode-codepoint-escapes": "error",
      "regexp/prefer-w": "error",
      "regexp/simplify-set-operations": "error",
      "regexp/sort-flags": "error",
      "regexp/strict": "error",
      "regexp/use-ignore-case": "error",
      "de-morgan/no-negated-conjunction": "error",
      "de-morgan/no-negated-disjunction": "error",
    },
  },
  {
    rules: {
      "vuejs-accessibility/form-control-has-label": [
        "error",
        {
          controlComponents: ["TextInput"],
        },
      ],
      "vuejs-accessibility/label-has-for": [
        "error",
        {
          controlComponents: ["TextInput"],
          required: {
            some: ["nesting", "id"],
          },
        },
      ],
    },
  }
);
