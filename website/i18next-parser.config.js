const { i18n } = require('./next-i18next.config');

module.exports = {
	createOldCatalogs: false,
	keepRemoved: false,
	lexers: {
		ts: ['JavascriptLexer'],
		jsx: ['JsxLexer'],
		tsx: ['JsxLexer'],

		default: ['JsxLexer'],
	},

	locales: i18n.locales,

	output: '../shared/locales/$LOCALE/$NAMESPACE.json',
	input: ['components/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{js,jsx,ts,tsx}'],

	verbose: true,
	failOnWarnings: true,
};
