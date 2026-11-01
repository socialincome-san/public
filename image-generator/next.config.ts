import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
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
