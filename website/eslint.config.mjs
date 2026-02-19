import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		extends: [...nextCoreWebVitals],
		rules: {
			curly: ['error', 'all'],
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/refs': 'off',
			'react-hooks/static-components': 'off',
			// Enforce arrow functions
			'func-style': ['error', 'expression', { allowArrowFunctions: true }],
			'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
		},
		ignores: ['**playwright-report/**'],
	},
]);
