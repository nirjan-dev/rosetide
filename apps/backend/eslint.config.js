// @ts-check

import baseConfig from '@hono/eslint-config'
import stylistic from '@stylistic/eslint-plugin'
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig(globalIgnores(['dist']), {
  extends: [baseConfig, stylistic.configs.recommended],
  files: ['src/**/*.{ts,tsx}'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname
    }
  },

})
