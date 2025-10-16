//  @ts-check

// @ts-ignore ignore this for now
import { tanstackConfig } from '@tanstack/eslint-config'
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylisticTypeChecked,
  tanstackConfig
);
