export const defaultTheme = {
	neutral: '#c1c4c7',
	'neutral-content': '#1E293B',

	'base-100': '#fefffe',
	'base-200': '#e7e7e7',
	'base-content': '#1E293B',

	primary: '#4C7ECA',
	'primary-content': '#F4F7FC',
	secondary: '#F45E46',
	'secondary-content': '#343436',
	accent: '#FAC800',
	'accent-content': '#1E293B',

	info: '#1D6CED',
	success: '#0b5b44',
	warning: '#f2b007',
	error: '#ba1a1a',

	'--rounded-box': '0.5rem', // border radius rounded-box utility class, used in card and other large boxes
	'--rounded-btn': '0.5rem', // border radius rounded-btn utility class, used in buttons and similar element
	'--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
	'--animation-btn': '0.25s', // duration of animation when you click on button
	'--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
	'--btn-text-case': 'none', // set default text transform for buttons
	'--btn-focus-scale': '0.95', // scale transform of button when you focus on it
	'--btn-r': '0 0 0 3px rgba(66, 153, 225, 0.5)', // shadow of button when you focus on it
	'--border-btn': '1px', // border width of buttons
	'--tab-border': '1px', // border width of tabs
	'--tab-radius': '0.5rem', // border radius of tabs
};

export const lightRedTheme = {
	...defaultTheme,
	neutral: '#FCF2F2',
};

export const darkBlueTheme = {
	...defaultTheme,
	'neutral-content': '#FAC800',

	'base-100': '#4C7ECA',
	'base-content': '#eef4ff',

	primary: '#fefffe',
	'primary-content': '#1E293B',
};
