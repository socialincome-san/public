const config = require('./config');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,

	i18n: {
		locales: [...new Set(Object.keys(config.websiteLanguages).concat(Object.keys(config.surveyLanguages)))],
		defaultLocale: config.defaultIsoCode,
	},
	transpilePackages: ['@socialincome/shared'],
};

module.exports = nextConfig;
