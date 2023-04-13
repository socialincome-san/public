const path = require('path');
const config = require('./config');

module.exports = {
	i18n: {
		locales: [...new Set(Object.keys(config.websiteLanguages).concat(Object.keys(config.surveyLanguages)))],
		defaultLocale: config.defaultIsoCode,
		localePath: path.resolve('../shared/locales'),
	},
};
