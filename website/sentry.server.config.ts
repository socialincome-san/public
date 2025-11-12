// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

console.log('Sentry is initializing');
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
	console.log('Sentry is disabled in development mode');
} else {
	Sentry.init({
		dsn: 'https://3ab06c73c11cd615db9df59b15786025@o4507045017026560.ingest.us.sentry.io/4507045018992640',

		tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		debug: false,
		sendDefaultPii: true,
		release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
		environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT, // 'prod' or 'staging'
		integrations: [
			Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
		],
		enableLogs: true,

		// Uncomment the line below to enable Spotlight (https://spotlightjs.com)
		// spotlight: process.env.NODE_ENV === 'development',
	});
}
