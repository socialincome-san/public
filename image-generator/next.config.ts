import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: process.env.BLOB_HOSTNAME
			? ['images', 'previews'].map((folder) => new URL(`https://${process.env.BLOB_HOSTNAME}/${folder}/**`))
			: [],
	},
	cacheComponents: true,
	partialPrefetching: true,
	turbopack: {
		rules: {
			'*.css': {
				loaders: ['@tailwindcss/turbopack'],
				as: '*.css',
			},
		},
	},
};

export default nextConfig;
