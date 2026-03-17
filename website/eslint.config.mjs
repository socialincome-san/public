import { config } from '@smartive/eslint-config';
import reactPlugin from 'eslint-plugin-react';
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
		},
		rules: {
			'react/forbid-component-props': ['error', { forbid: ['style'] }],
		},
	},
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		...tseslint.configs.disableTypeChecked,
	},
];
