import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import tsEslint from 'typescript-eslint';

// Smartive config rules
const smartiveRules = {
  // Default rules from smartive
  'no-constant-binary-expression': 'error',
  'array-callback-return': 'error',
  'no-debugger': 'error',
  'no-alert': 'error',
  'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error', 'trace', 'time', 'timeEnd'] }],
  'newline-before-return': 'error',
  'prefer-const': 'error',
  'no-else-return': 'error',
  'no-extra-semi': 'error',
  curly: 'error',
  eqeqeq: 'error',
  'default-case-last': 'error',
  // TypeScript rules from smartive
  '@typescript-eslint/no-unsafe-enum-comparison': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/prefer-regexp-exec': 'off',
  '@typescript-eslint/no-var-requires': 'warn',
  '@typescript-eslint/no-unused-vars': ['error'],
  '@typescript-eslint/no-floating-promises': ['error'],
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
  // React rules from smartive
  'react/prop-types': 'off',
  'react/display-name': 'off',
  'react/forbid-component-props': ['warn', { forbid: ['style', 'className'] }],
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksVoidReturn: {
        attributes: false,
      },
    },
  ],
  // Prettier rules from smartive
  'prettier/prettier': [
    'error',
    {
      endOfLine: 'auto',
    },
  ],
};

const smartiveRulesWithoutTypeChecking = {
  ...smartiveRules,
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
};

export default [
  ...nextCoreWebVitals,
  prettierConfig,
  {
    name: '@smartive/eslint-config/rules',
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
      react: reactPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: smartiveRules,
  },
  {
    name: '@smartive/eslint-config/rules-js',
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
      react: reactPlugin,
      prettier: prettierPlugin,
    },
    rules: smartiveRulesWithoutTypeChecking,
  },
];
