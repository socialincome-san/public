const path = require('path');

module.exports = {
	i18n: {
		locales: ['en', 'de', 'it', 'kri'],
		defaultLocale: 'en',
		localePath: path.resolve('../shared/locales'),
	},
};
