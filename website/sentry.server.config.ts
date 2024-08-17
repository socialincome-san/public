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

		// Adjust this value in production, or use tracesSampler for greater control
		tracesSampleRate: 1,

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		debug: false,

		// Uncomment the line below to enable Spotlight (https://spotlightjs.com)
		// spotlight: process.env.NODE_ENV === 'development',
	});
}
