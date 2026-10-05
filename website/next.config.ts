import type { NextConfig } from 'next';
import path from 'path';
import { getSecurityHeaders } from './csp';
import { getRedirects } from './redirects';

const nextConfig: NextConfig = {
	transpilePackages: ['@socialincome/design-system', 'storyblok-rich-text-react-renderer'],
	reactStrictMode: true,
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
	output: 'standalone',
	serverExternalPackages: ['pdfkit', 'ssh2', 'ssh2-sftp-client'],
	// Match campaignSubmissionConfig.maxMultipartBodyBytes (primary + optional images).
	experimental: {
		serverActions: {
			bodySizeLimit: '18mb',
		},
	},
};

export default nextConfig;
