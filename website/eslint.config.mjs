import { config } from '@smartive/eslint-config';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const smartiveNextConfig = config('nextjs');

export default [
	{
		ignores: ['eslint.config.mjs', 'prettier.config.cjs', 'src/generated/**', '**/playwright-report/**'],
	},
	...smartiveNextConfig,
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
		rules: {
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
		},
	},
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		...tseslint.configs.disableTypeChecked,
	},
];
