import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { getSecurityHeaders } from './csp';
import { getRedirects } from './redirects';

const isProduction = (process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? process.env.VERCEL_TARGET_ENV) === 'production';

const nextConfig: NextConfig = {
	transpilePackages: ['@socialincome/design-system', 'storyblok-rich-text-react-renderer'],
	reactStrictMode: true,
	cacheComponents: true,
	env: {
		NEXT_PUBLIC_APP_BUILD_TIMESTAMP: new Date().toISOString(),
	},
	redirects: getRedirects,
	headers: () =>
		Promise.resolve([
			{
				source: '/:path*',
				headers: [
					...getSecurityHeaders(),
					// Staging is publicly reachable and would otherwise be indexed as a duplicate of production.
					...(isProduction ? [] : [{ key: 'X-Robots-Tag', value: 'noindex' }]),
				],
			},
		]),
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
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				pathname: '/**',
			},
		],
		loader: 'custom',
		loaderFile: './src/lib/utils/storyblock-image-loader.ts',
	},
	serverExternalPackages: ['pdfkit', 'ssh2', 'ssh2-sftp-client'],
	// Vercel's function request body limit.
	experimental: {
		// The website, portal, partner space and API docs have separate root layouts.
		globalNotFound: true,
		serverActions: {
			bodySizeLimit: '4.5mb',
		},
	},
};

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

export default withNextIntl(nextConfig);
