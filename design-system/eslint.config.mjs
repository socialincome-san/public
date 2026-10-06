import { config } from '@smartive/eslint-config';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import classNamePlugin from './eslint-rules/no-class-name-prop.mjs';
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
			'class-name': classNamePlugin,
		},
		rules: {
			'react/forbid-component-props': ['error', { forbid: ['style'] }],
			'design-system/no-package-escape': 'error',
			'class-name/no-class-name-prop': 'error',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
