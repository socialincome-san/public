import { Config } from 'tailwindcss';
import * as colors from 'tailwindcss/colors';
import { darkBlueTheme, defaultTheme, lightRedTheme } from './daisyui-themes';

export default {
	important: true,
	content: [
		'./src/**/*.{js,jsx,ts,tsx,mdx,html}',
		'../node_modules/daisyui/dist/**/*.js',
		'../node_modules/react-daisyui/dist/**/*.js',
	],
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
				siDefault: defaultTheme,
				siLightRed: lightRedTheme,
				siDarkBlue: darkBlueTheme,
			},
		],
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
} satisfies Config;
