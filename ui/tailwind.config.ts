import { Config } from 'tailwindcss';
import * as colors from 'tailwindcss/colors';

export default {
	content: ['./src/**/*.{js,jsx,ts,tsx,mdx,html}'],
	theme: {
		extend: {
			colors: {
				'base-yellow': colors.amber['50'],
				'base-blue': colors.blue['50'],
				'base-green': colors.green['50'],
				'base-red': colors.red['50'],
			},
		},
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

					'--rounded-box': '0.2rem', // border radius rounded-box utility class, used in card and other large boxes
					'--rounded-btn': '0.2rem', // border radius rounded-btn utility class, used in buttons and similar element
					'--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
					'--animation-btn': '0.25s', // duration of animation when you click on button
					'--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
					'--btn-text-case': 'uppercase', // set default text transform for buttons
					'--btn-focus-scale': '0.95', // scale transform of button when you focus on it
					'--border-btn': '1px', // border width of buttons
					'--tab-border': '1px', // border width of tabs
					'--tab-radius': '0.5rem', // border radius of tabs
				},
			},
		],
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography'), require('daisyui')],
} satisfies Config;
