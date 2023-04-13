import { createTheme } from '@mui/material/styles';
import localFont from '@next/font/local';

export const unica = localFont({
	src: [
		{
			path: '../../shared/assets/fonts/Unica77LLSub-Bold.woff2',
			weight: '700',
		},
		{
			path: '../../shared/assets/fonts/Unica77LLSub-Medium.woff2',
			weight: '500',
		},
		{
			path: '../../shared/assets/fonts/Unica77LLWeb-Regular.woff2', // todo change me to sub version once fixed
			weight: '400',
		},
	],
	fallback: ['system-ui', 'sans-serif'],
});

const theme = createTheme({
	typography: {
		fontFamily: unica.style.fontFamily,
	},
	palette: {
		primary: {
			main: '#3980D0',
		},
		secondary: {
			main: '#f55d3e',
		},
	},
	components: {
		MuiLink: {
			defaultProps: {
				underline: 'hover',
			},
		},
		MuiContainer: {
			styleOverrides: {
				root: {
					// required to override the default survey.js theme
					'.sd-root-modern': {
						height: '100%',
						'--font-family': unica.style.fontFamily,
						'--primary': '#74a7fe',
						'--background': '#ffffff',
						'--background-dim': '#f3f3f3',
						'--background-dim-light': '#f9f9f9',
						'--primary-foreground': '#ffffff',
						'--foreground': '#161616',
						'--base-unit': '8px',
						'--sd-base-padding': '0px',
					},
				},
			},
		},
	},
});

export default theme;
