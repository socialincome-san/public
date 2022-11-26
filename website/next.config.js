/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	i18n: {
		locales: ['en', 'de', 'it'],
		defaultLocale: 'en',
	},
};

// required to trigger compilation of shared code
const withTranspilation = require('next-transpile-modules')(['@socialincome/shared']);

module.exports = withTranspilation(nextConfig);
