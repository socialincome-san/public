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
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--background)',
				foreground: {
					DEFAULT: 'var(--foreground)',
					dark: 'var(--foreground-dark)',
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)',
				},
				primary: {
					DEFAULT: 'var(--primary)',
					muted: 'var(--primary-muted)',
					foreground: 'var(--primary-foreground)',
					'foreground-muted': 'var(--primary-foreground-muted)',
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					muted: 'var(--secondary-muted)',
					foreground: 'var(--secondary-foreground)',
					'foreground-muted': 'var(--secondary-foreground-muted)',
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					muted: 'var(--destructive-muted)',
					foreground: 'var(--destructive-foreground)',
					'foreground-muted': 'var(--destructive-foreground-muted)',
				},
				accent: {
					DEFAULT: 'var(--accent)',
					muted: 'var(--accent-muted)',
					foreground: 'var(--accent-foreground)',
					'foreground-muted': 'var(--accent-foreground-muted)',
				},
				popover: {
					DEFAULT: 'var(--popover)',
					muted: 'var(--popover-muted)',
					foreground: 'var(--popover-foreground)',
					'foreground-muted': 'var(--popover-foreground-muted)',
				},
				card: {
					DEFAULT: 'var(--card)',
					muted: 'var(--card-muted)',
					foreground: 'var(--card-foreground)',
					'foreground-muted': 'var(--card-foreground-muted)',
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
