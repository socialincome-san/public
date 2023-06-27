import { Config } from 'tailwindcss';
const colors = require('tailwindcss/colors');

export default {
	content: ['./src/**/*.{js,jsx,ts,tsx,mdx,html}'],
	theme: {
		extend: {
			colors: {
				primary: {
					light: colors.slate['500'],
					DEFAULT: colors.slate['700'],
					dark: colors.slate['900'],
				},
				yellow: {
					superlight: '#FEF5D1',
					light: '#FDE68B',
					DEFAULT: '#FBC700',
					dark: '#cc9b34',
					superdark: '#816901',
				},
			},
		},
	},
	plugins: [require('@tailwindcss/forms'), require('daisyui')],
} satisfies Config;
