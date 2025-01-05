/* eslint-env node */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'alloy',
    'alloy/vue',
    'alloy/typescript',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:storybook/recommended',
    'plugin:vuejs-accessibility/recommended'
  ],
  rules: {
    'vue/no-setup-props-destructure': 'off'
  },
  overrides: [
    {
      files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      extends: ['plugin:playwright/recommended']
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.json'
    }
  }
}
