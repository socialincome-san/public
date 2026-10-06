import { config } from '@smartive/eslint-config';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import designTokensPlugin from './eslint-rules/no-arbitrary-design-values.mjs';
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
			'design-tokens': designTokensPlugin,
		},
		rules: {
			'react/forbid-component-props': ['error', { forbid: ['style'] }],
			'design-system/no-package-escape': 'error',
			'class-name/no-class-name-prop': 'error',
			'design-tokens/no-arbitrary-design-values': 'error',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
