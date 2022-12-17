import { defineConfig, ViteDevServer } from 'vite';

export default defineConfig(({mode}) => ({
	server: {
		host: '0.0.0.0',
		port: 3000,
	},
	define: {
		'process.env': {},
	},
	plugins: [
		mode === 'development' && {
			// FireCMS relies on a rewrite rule that redirect all traffic to index.html in production (see firebase.json)
			// For this reason, we need to manually rewrite a few requests in development.
			name: 'fix-404-on-refresh',
			configureServer(server: ViteDevServer) {
				server.middlewares.use((req, res, next) => {
					if (req.url === '/c/src/index.tsx') req.url = '/src/index.tsx';
					if (req.url === '/c/logo.svg') req.url = '/logo.svg';
					next();
				});
			},
		},
	],
}));
