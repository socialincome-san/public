import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		extends: [...nextCoreWebVitals],
		rules: {
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/refs': 'off',
			'react-hooks/static-components': 'off',
		},
		ignores: ['**playwright-report/**'],
	},
]);
