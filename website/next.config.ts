import type { NextConfig } from 'next';
import path from 'path';
import { getSecurityHeaders } from './csp';
import { getRedirects } from './redirects';

const nextConfig: NextConfig = {
	transpilePackages: ['storyblok-rich-text-react-renderer'],
	reactStrictMode: true,
	redirects: getRedirects,
	headers: () =>
		Promise.resolve([
			{
				source: '/:path*',
				headers: [...getSecurityHeaders()],
			},
			{
				source: '/storybook',
				headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
			},
			{
				source: '/storybook/:path*',
				headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
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
};

export default nextConfig;
