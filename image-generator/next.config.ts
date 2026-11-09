import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: process.env.BLOB_HOSTNAME
			? ['images', 'previews'].map((folder) => new URL(`https://${process.env.BLOB_HOSTNAME}/${folder}/**`))
			: [],
	},
	cacheComponents: true,
	partialPrefetching: true,
	// The generate route reads the style reference images from disk at runtime.
	outputFileTracingIncludes: {
		'/api/generate-image': ['./src/style-references/**/*'],
	},
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
