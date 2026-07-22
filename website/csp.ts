/**
 * Content-Security-Policy for the Social Income website.
 *
 * This is a static allowlist policy (no nonces) so ISR-cached marketing pages keep working.
 *
 * When adding a new third-party integration, extend the relevant directive below and verify
 * in the browser console (with cookie consent granted for marketing tags). GTM container tags
 * configured in the GTM UI can load origins not listed in this repo — add those origins here
 * when new tags are introduced.
 *
 * @see website/src/components/analytics/ — GTM, Facebook, LinkedIn (inline script bootstraps)
 * @see website/src/components/donation-wizard/ — Stripe Embedded Checkout
 * @see website/src/lib/firebase/ — Firebase Auth + Storage
 */

type CspOptions = {
	isDevelopment?: boolean;
};

const joinSources = (sources: readonly string[]) => sources.join(' ');

const PRODUCTION_SCRIPT_SRC = [
	"'self'",
	"'unsafe-inline'",
	'https://www.googletagmanager.com',
	'https://www.google-analytics.com',
	'https://connect.facebook.net',
	'https://snap.licdn.com',
	'https://js.stripe.com',
	'https://app.storyblok.com',
] as const;

const DEVELOPMENT_SCRIPT_SRC_EXTRA = ["'unsafe-eval'"] as const;

const STYLE_SRC = ["'self'", "'unsafe-inline'"] as const;

const IMG_SRC = [
	"'self'",
	'data:',
	'blob:',
	'https://a.storyblok.com',
	'https://avatars.githubusercontent.com',
	'https://image.mux.com',
	'https://www.googletagmanager.com',
	'https://www.google-analytics.com',
	'https://www.facebook.com',
	'https://px.ads.linkedin.com',
	'https://www.linkedin.com',
	'https://*.stripe.com',
] as const;

const FONT_SRC = ["'self'"] as const;

const PRODUCTION_CONNECT_SRC = [
	"'self'",
	'https://identitytoolkit.googleapis.com',
	'https://securetoken.googleapis.com',
	'https://firebase.googleapis.com',
	'https://firebaseinstallations.googleapis.com',
	'https://firebasestorage.googleapis.com',
	'https://storage.googleapis.com',
	'https://www.googletagmanager.com',
	'https://*.google-analytics.com',
	'https://analytics.google.com',
	'https://stats.g.doubleclick.net',
	'https://www.facebook.com',
	'https://connect.facebook.net',
	'https://px.ads.linkedin.com',
	'https://api.stripe.com',
	'https://r.stripe.com',
	'https://q.stripe.com',
	'https://o4507045017026560.ingest.us.sentry.io',
	'https://stream.mux.com',
	'https://a.storyblok.com',
] as const;

const DEVELOPMENT_CONNECT_SRC_EXTRA = ['http://localhost:*', 'ws://localhost:*'] as const;

const FRAME_SRC = [
	"'self'",
	'https://www.googletagmanager.com',
	'https://js.stripe.com',
	'https://hooks.stripe.com',
	'https://player.vimeo.com',
	'https://www.youtube.com',
	'https://www.youtube-nocookie.com',
	'https://player.mux.com',
] as const;

const MEDIA_SRC = ["'self'", 'blob:', 'https://stream.mux.com', 'https://a.storyblok.com'] as const;

const WORKER_SRC = ["'self'", 'blob:'] as const;

const FORM_ACTION = ["'self'"] as const;

const FRAME_ANCESTORS = ["'self'", 'https://app.storyblok.com'] as const;

export const buildContentSecurityPolicy = ({ isDevelopment = process.env.NODE_ENV !== 'production' }: CspOptions = {}) => {
	const scriptSrc = isDevelopment
		? [...PRODUCTION_SCRIPT_SRC, ...DEVELOPMENT_SCRIPT_SRC_EXTRA]
		: [...PRODUCTION_SCRIPT_SRC];

	const connectSrc = isDevelopment
		? [...PRODUCTION_CONNECT_SRC, ...DEVELOPMENT_CONNECT_SRC_EXTRA]
		: [...PRODUCTION_CONNECT_SRC];

	const directives = [
		`default-src 'self'`,
		`script-src ${joinSources(scriptSrc)}`,
		`style-src ${joinSources(STYLE_SRC)}`,
		`img-src ${joinSources(IMG_SRC)}`,
		`font-src ${joinSources(FONT_SRC)}`,
		`connect-src ${joinSources(connectSrc)}`,
		`frame-src ${joinSources(FRAME_SRC)}`,
		`media-src ${joinSources(MEDIA_SRC)}`,
		`worker-src ${joinSources(WORKER_SRC)}`,
		`form-action ${joinSources(FORM_ACTION)}`,
		`frame-ancestors ${joinSources(FRAME_ANCESTORS)}`,
		`object-src 'none'`,
		`base-uri 'self'`,
		`upgrade-insecure-requests`,
	];

	return directives.join('; ');
};

export const getSecurityHeaders = () =>
	[
		{ key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
		{ key: 'X-Content-Type-Options', value: 'nosniff' },
		{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
		{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
	] as const;
