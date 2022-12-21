const path = require('path');

module.exports = {
	i18n: {
		locales: ['en', 'de', 'it'],
		defaultLocale: 'en',
		localePath: path.resolve('../shared/locales'),
	},
};
