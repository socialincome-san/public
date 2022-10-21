const { i18n } = require('./next-i18next.config');

const url = 'https://socialincome.org';

module.exports = {
	siteUrl: 'https://socialincome.org',
	generateRobotsTxt: true,
	alternateRefs: i18n.locales.map((locale) => {
		return {
			href: url,
			hreflang: locale,
		};
	}),
};
