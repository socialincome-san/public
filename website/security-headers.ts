const isDevelopment = process.env.NODE_ENV === 'development';

const contentSecurityPolicy = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://js.stripe.com`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https://a.storyblok.com https://avatars.githubusercontent.com https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://image.mux.com https://*.stripe.com",
	"font-src 'self' data:",
	`connect-src 'self'${isDevelopment ? ' http://localhost:* ws://localhost:*' : ''} https://api.storyblok.com https://www.google-analytics.com https://region1.google-analytics.com https://region1.analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.facebook.com https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://*.ingest.us.sentry.io https://*.ingest.sentry.io https://api.stripe.com https://r.stripe.com`,
	"media-src 'self' blob: https://*.mux.com",
	"frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.googletagmanager.com https://www.youtube.com https://player.vimeo.com https://player.mux.com https://*.firebaseapp.com",
	"worker-src 'self' blob:",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ');

export const securityHeaders = [
	{
		key: 'Content-Security-Policy',
		value: contentSecurityPolicy,
	},
];
