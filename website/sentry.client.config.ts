// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: 'https://3ab06c73c11cd615db9df59b15786025@o4507045017026560.ingest.us.sentry.io/4507045018992640',

	tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,
	sendDefaultPii: true,
	release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
	environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT, // 'prod' or 'staging'

	replaysOnErrorSampleRate: 1.0,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: 0.1,

	// You can remove this option if you're not planning to use the Sentry Session Replay feature:
	integrations: [
		Sentry.replayIntegration({
			// Additional Replay configuration goes in here, for example:
			maskAllText: true,
			blockAllMedia: true,
		}),
		Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
	],
	enableLogs: true,
});
