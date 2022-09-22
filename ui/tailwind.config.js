/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx,mdx,html}'],
	safelist: ['text-xl', 'text-base'],
	theme: {
		colors: {
			'so-color-accent-1-primary-500': 'var(--so-color-accent-1-primary-500)',
			'so-color-accent-2-primary-500': 'var(--so-color-accent-2-primary-500)',
			'so-color-accent-2-primary-alpha': 'var(--so-blue-alpha-35)',
			'so-color-accent-2-secondary-500': 'var(--so-color-accent-2-secondary-500)',
			'so-color-accent-2-primary-100': 'var(--so-color-accent-2-primary-100)',
			'so-color-accent-2-secondary-100': 'var(--so-color-accent-2-secondary-100)',
		},
		extend: {},
	},
	plugins: [],
};
