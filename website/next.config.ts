import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { getSecurityHeaders } from './csp';
import { getRedirects } from './redirects';

const nextConfig: NextConfig = {
	transpilePackages: ['@socialincome/design-system', 'storyblok-rich-text-react-renderer'],
	reactStrictMode: true,
	env: {
		NEXT_PUBLIC_APP_BUILD_TIMESTAMP: new Date().toISOString(),
	},
	redirects: getRedirects,
	headers: () =>
		Promise.resolve([
			{
				source: '/:path*',
				headers: [...getSecurityHeaders()],
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
		serverActions: {
			bodySizeLimit: '4.5mb',
		},
	},
};

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

export default withNextIntl(nextConfig);
