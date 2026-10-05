import { config } from '@smartive/eslint-config';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import designSystemPlugin from './eslint-rules/no-package-escape.mjs';

export default [
	{
		ignores: ['eslint.config.mjs', 'eslint-rules/**', 'prettier.config.cjs', 'storybook-static/**'],
	},
	...config('react'),
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			react: reactPlugin,
			'design-system': designSystemPlugin,
		},
		rules: {
			'react/forbid-component-props': ['error', { forbid: ['style'] }],
			'design-system/no-package-escape': 'error',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
