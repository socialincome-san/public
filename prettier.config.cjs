const smartiveConfig = require('@smartive/prettier-config');

module.exports = {
	...smartiveConfig,
	useTabs: true,
	tabWidth: 2,
	overrides: [
		{
			files: ['*.md', '*.mdx'],
			options: {
				tabWidth: 2,
				printWidth: 72,
				proseWrap: 'always',
			},
		},
		{
			files: ['*.yml', '*.yaml'],
			options: {
				singleQuote: false,
				useTabs: false,
			},
		},
	],
	plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
};
