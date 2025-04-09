import { presetJavaScript, typescript, vue } from '@sxzz/eslint-config'
import tseslint from 'typescript-eslint'

export default [
  ...tseslint.config({
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    ignores: ['.storybook/**/*', 'scripts/**/*', '**/*.js', '**/*.stories.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  }),
  ...presetJavaScript(),
  ...typescript(),
  ...vue(),
  ...tseslint.config({
    rules: {
      'no-void': 'off',
      'import/no-default-export': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'unicorn/prefer-at': 'off'
    }
  })
]
