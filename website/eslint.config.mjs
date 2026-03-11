import { config } from '@smartive/eslint-config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const smartiveNextConfig = config('nextjs');

export default [
	{
		ignores: ['eslint.config.mjs', 'prettier.config.cjs', '**/playwright-report/**'],
	},
	...smartiveNextConfig,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	reactPlugin.configs.flat.recommended,
	reactPlugin.configs.flat['jsx-runtime'],
	eslintPluginPrettierRecommended,
	{
		// Transitional overrides to keep existing codebase lint-clean while adopting smartive config.
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
		rules: {
			'newline-before-return': 'off',
			'@typescript-eslint/consistent-type-definitions': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
			'@typescript-eslint/no-redundant-type-constituents': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/require-await': 'warn',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/restrict-template-expressions': 'warn',
			'@typescript-eslint/consistent-indexed-object-style': 'warn',
			'@typescript-eslint/prefer-optional-chain': 'warn',
			'@typescript-eslint/no-for-in-array': 'warn',
			eqeqeq: 'warn',
			'@typescript-eslint/prefer-for-of': 'warn',
			'no-useless-escape': 'warn',
			'@typescript-eslint/no-unsafe-enum-comparison': 'warn',
			'@typescript-eslint/restrict-plus-operands': 'warn',
			'@typescript-eslint/no-misused-promises': 'warn',
			'react-hooks/set-state-in-effect': 'warn',
			'react-hooks/static-components': 'warn',
			'react-hooks/refs': 'warn',
			'react/prop-types': 'warn',
			'@typescript-eslint/ban-ts-comment': 'warn',
			'@typescript-eslint/no-empty-function': 'warn',
			'no-case-declarations': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'prefer-const': 'warn',
			'no-async-promise-executor': 'warn',
			'no-fallthrough': 'warn',
			'@typescript-eslint/no-base-to-string': 'warn',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
			'@typescript-eslint/array-type': 'warn',
			'@typescript-eslint/dot-notation': 'warn',
			'@typescript-eslint/prefer-regexp-exec': 'warn',
			'@typescript-eslint/no-inferrable-types': 'warn',
			'@typescript-eslint/no-wrapper-object-types': 'warn',
			'@typescript-eslint/no-duplicate-type-constituents': 'warn',
			'@typescript-eslint/prefer-function-type': 'warn',
			'no-else-return': 'warn',
			'prettier/prettier': 'warn',
			'no-empty-pattern': 'warn',
			'no-empty': 'warn',
			'no-console': 'warn',
		},
	},
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		...tseslint.configs.disableTypeChecked,
	},
];
