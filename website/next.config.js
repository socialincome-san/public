const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */

let nextConfig = {
	transpilePackages: ['@socialincome/ui'],
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'a.storyblok.com',
				pathname: '/**',
			},
		],
	},
	output: 'standalone',

	// ❗️ Next.js 16: updated key name
	serverExternalPackages: ['pdfkit'],

	// ❗️ Next.js 16: required because webpack() config was present
	// This silences the build error and enables Turbopack properly
	turbopack: {},
};

// Sentry (unchanged)
if (process.env.SENTRY_AUTH_TOKEN) {
	nextConfig = withSentryConfig(nextConfig, {
		org: 'social-income',
		project: 'website',
		authToken: process.env.SENTRY_AUTH_TOKEN,
		release: {
			name: process.env.NEXT_PUBLIC_APP_VERSION,
		},
		silent: !process.env.CI,
		widenClientFileUpload: true,
		hideSourceMaps: true,
		disableLogger: true,
		automaticVercelMonitors: false,
	});
} else {
	console.warn('SENTRY_AUTH_TOKEN not set, not uploading source maps');
}

module.exports = nextConfig;
