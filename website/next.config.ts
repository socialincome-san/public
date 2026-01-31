import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import path from 'path';

let nextConfig: NextConfig = {
	transpilePackages: ['@socialincome/ui'],
	reactStrictMode: true,
	turbopack: {
		root: path.join(process.cwd(), '..'),
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'a.storyblok.com',
				pathname: '/**',
			},
		],
		loader: 'custom',
		loaderFile: './src/lib/utils/storyblock-image-loader.ts',
	},
	output: 'standalone',
	serverExternalPackages: ['pdfkit', 'ssh2', 'ssh2-sftp-client'],
};

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
		disableLogger: true,
		automaticVercelMonitors: false,
	});
}

export default nextConfig;
