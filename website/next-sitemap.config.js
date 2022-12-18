const { i18n } = require('./next-i18next.config');

// TODO change me once deployed
const url = 'public-dusky-eight.vercel.app\n';

module.exports = {
	siteUrl: url,
	generateRobotsTxt: true,
	alternateRefs: i18n.locales.map((locale) => {
		return {
			href: url,
			hreflang: locale,
		};
	}),
};
