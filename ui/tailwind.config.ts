import { Config } from 'tailwindcss';

module.exports = {
	darkMode: ['class'],
	content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		fontFamily: {
			sans: ['Unica77, sans-serif', { fontFeatureSettings: "'ss04' on" }],
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: {
					DEFAULT: 'hsl(var(--foreground) / <alpha-value>)',
					dark: 'hsl(var(--foreground-dark) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					muted: 'hsl(var(--primary-muted) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
					'foreground-muted': 'hsl(var(--primary-foreground-muted) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					muted: 'hsl(var(--secondary-muted) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
					'foreground-muted': 'hsl(var(--secondary-foreground-muted) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					muted: 'hsl(var(--destructive-muted) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
					'foreground-muted': 'hsl(var(--destructive-foreground-muted) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					muted: 'hsl(var(--accent-muted) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
					'foreground-muted': 'hsl(var(--accent-foreground-muted) / <alpha-value>)',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					muted: 'hsl(var(--popover-muted) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
					'foreground-muted': 'hsl(var(--popover-foreground-muted) / <alpha-value>)',
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					muted: 'hsl(var(--card-muted) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
					'foreground-muted': 'hsl(var(--card-foreground-muted) / <alpha-value>)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
} satisfies Config;
