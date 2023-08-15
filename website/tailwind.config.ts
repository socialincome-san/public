export default {
	content: [
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
		'../ui/src/**/*.{js,jsx,ts,tsx,mdx,html}',
		'../node_modules/daisyui/dist/**/*.js',
		'../node_modules/react-daisyui/dist/**/*.js',
	],
	plugins: [],
	presets: [require('../ui/tailwind.config')],
};
