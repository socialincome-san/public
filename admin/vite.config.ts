import { defineConfig } from 'vite';

export default defineConfig(() => ({
	// root: path.resolve(__dirname, 'src'),
	// esbuild: {
	// 	logOverride: { 'this-is-undefined-in-esm': 'silent' },
	// 	// jsxInject: "import React from 'react'",
	// },
	server: {
		host: '0.0.0.0',
		port: 3000,
	},
	// build: {
	// 	// lib: {
	// 	// 	entry: path.resolve(__dirname, 'src/index.tsx'),
	// 	// 	name: 'FireCMS',
	// 	// 	fileName: (format) => `index.${format}.js`,
	// 	// },
	// 	target: 'esnext',
	// 	sourcemap: true,
	// 	rollupOptions: {
	// 		external: isExternal,
	// 	},
	// },
	define: {
		'process.env': {},
	},
	plugins: [
		// react({
		// 	jsxImportSource: '@emotion/react',
		// }),
		// 	babel: {
		// 		plugins: ['@emotion/babel-plugin'],
		// 	},
		// }
	],
}));
