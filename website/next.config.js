const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	i18n,
};

// required to trigger compilation of shared code
const withTranspilation = require('next-transpile-modules')(['@socialincome/shared']);

module.exports = withTranspilation(nextConfig);
