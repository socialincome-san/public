import { config } from '@smartive/eslint-config';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: ['eslint.config.mjs', 'prettier.config.cjs', 'storybook-static/**'],
	},
	...config('react'),
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			react: reactPlugin,
		},
		rules: {
			'react/forbid-component-props': ['error', { forbid: ['style'] }],
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@socialincome/website', '@socialincome/website/**', '@/**'],
							message: 'The design system cannot import the website.',
						},
					],
				},
			],
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
