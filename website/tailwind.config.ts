export default {
	content: [
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
		'../ui/src/components/**/*.{js,jsx,ts,tsx,mdx,html}',
		'../shared/locales/**/*.json',
	],
	presets: [require('../ui/tailwind.config')],
};
