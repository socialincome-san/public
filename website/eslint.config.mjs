import { config } from '@smartive/eslint-config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const smartiveNextConfig = config('nextjs');

export default [
	{
		ignores: ['eslint.config.mjs', 'prettier.config.cjs', 'src/generated/**', '**/playwright-report/**'],
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
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'react-hooks/set-state-in-effect': 'warn',
			'react-hooks/static-components': 'warn',
			'react-hooks/refs': 'warn',
			'react/prop-types': 'warn',
			'prettier/prettier': 'warn',
		},
	},
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		...tseslint.configs.disableTypeChecked,
	},
];
