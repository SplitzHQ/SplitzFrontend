import { presetJavaScript, typescript, vue } from '@sxzz/eslint-config'
import tseslint from 'typescript-eslint'

export default [
  ...tseslint.config(
    {
      // ignores openapi generated files
      ignores: ['src/backend/**/*']
    },
    {
      extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
      ignores: ['.storybook/**/*', 'scripts/**/*', '**/*.js', '**/*.stories.ts'],
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname
        }
      }
    }
  ),
  ...presetJavaScript(),
  ...typescript(),
  ...vue(),
  ...tseslint.config({
    rules: {
      'no-void': 'off',
      'import/no-default-export': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'unicorn/prefer-at': 'off',
      'unicorn/no-useless-switch-case': 'off',
      'vue/html-indent': 'off',
      'unicorn/no-array-sort': 'off'
    }
  })
]
