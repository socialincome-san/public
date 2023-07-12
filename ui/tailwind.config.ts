import { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{js,jsx,ts,tsx,mdx,html}'],
	theme: {
		fontFamily: {
			sans: ['Unica77', 'sans-serif'],
		},
	},
	daisyui: {
		themes: [
			{
				'si-theme': {
					primary: '#FAC800',

					secondary: '#0160AA',

					accent: '#F45E46',

					neutral: '#1B272C',

					'base-100': '#F3F2F7',

					info: '#1D6CED',

					success: '#0b5b44',

					warning: '#f2b007',

					error: '#ba1a1a',
				},
			},
		],
	},
	plugins: [require('@tailwindcss/forms'), require('daisyui')],
} satisfies Config;
