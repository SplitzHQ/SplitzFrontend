import { presetJavaScript, typescript, vue } from '@sxzz/eslint-config'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'src/backend/**/*', // ignores openapi generated files
      '.storybook/**/*',
      'scripts/**/*',
      '**/*.js',
      '**/*.stories.ts'
    ]
  },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...presetJavaScript(),
  ...typescript(),
  ...vue(),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    rules: {
      'no-void': 'off',
      'import/no-default-export': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'unicorn/prefer-at': 'off',
      'unicorn/no-useless-switch-case': 'off',
      'vue/html-indent': 'off',
      'unicorn/no-array-sort': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: true
        }
      ]
    }
  }
]
