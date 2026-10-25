type CspOptions = {
	isDevelopment?: boolean;
};

const joinSources = (sources: readonly string[]) => sources.join(' ');

const PRODUCTION_SCRIPT_SRC = [
	"'self'",
	"'unsafe-inline'",
	// The dotLottie renderer compiles a WASM module. Narrower than 'unsafe-eval': it does not permit eval().
	"'wasm-unsafe-eval'",
	'https://js.stripe.com',
	'https://checkout.stripe.com',
	'https://app.storyblok.com',
	'https://static.cloudflareinsights.com',
	'https://challenges.cloudflare.com',
	// Needed for Firebase Auth's Google sign-in helpers (gapi).
	'https://apis.google.com',
] as const;

const DEVELOPMENT_SCRIPT_SRC_EXTRA = [
	"'unsafe-eval'",
	// Vercel Analytics loads its debug script from here outside production.
	'https://va.vercel-scripts.com',
] as const;

const STYLE_SRC = ["'self'", "'unsafe-inline'"] as const;

const IMG_SRC = [
	"'self'",
	'data:',
	'blob:',
	'https://a.storyblok.com',
	'https://avatars.githubusercontent.com',
	'https://image.mux.com',
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
	'https://api.stripe.com',
	'https://checkout.stripe.com',
	'https://r.stripe.com',
	'https://q.stripe.com',
	'https://*.mux.com',
	'https://*.edgemv.mux.com',
	'https://*.litix.io',
	'https://a.storyblok.com',
	'https://static.cloudflareinsights.com',
	'https://cloudflareinsights.com',
	'https://challenges.cloudflare.com',
	// The dotLottie renderer fetches its WASM binary from jsDelivr, falling back to unpkg.
	'https://cdn.jsdelivr.net',
	'https://unpkg.com',
	// Needed for Firebase Auth's Google sign-in.
	'https://www.googleapis.com',
] as const;

const LOCALHOST_CONNECT_SRC = ['http://localhost:*', 'ws://localhost:*'] as const;

/** Extra hosts for Firebase Auth/Storage/Functions emulators (local/e2e production builds). */
const EMULATOR_CONNECT_SRC_EXTRA = ['http://127.0.0.1:*', 'ws://127.0.0.1:*'] as const;

// Needed for Firebase Auth's Google sign-in, which opens a hidden iframe from the auth domain.
const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'social-income-prod.firebaseapp.com';

const FRAME_SRC = [
	"'self'",
	'https://js.stripe.com',
	'https://checkout.stripe.com',
	'https://hooks.stripe.com',
	'https://player.vimeo.com',
	'https://www.youtube-nocookie.com',
	'https://player.mux.com',
	'https://challenges.cloudflare.com',
	`https://${FIREBASE_AUTH_DOMAIN}`,
] as const;

const MEDIA_SRC = ["'self'", 'blob:', 'https://*.mux.com', 'https://*.edgemv.mux.com', 'https://a.storyblok.com'] as const;

const WORKER_SRC = ["'self'", 'blob:'] as const;

const FORM_ACTION = ["'self'"] as const;

const FRAME_ANCESTORS = ["'self'", 'https://app.storyblok.com'] as const;

// Vercel injects its toolbar into preview deployments. Hosts from
// https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
const VERCEL_TOOLBAR_SRC = {
	script: ['https://vercel.live'],
	style: ['https://vercel.live'],
	img: ['https://vercel.live', 'https://vercel.com'],
	font: ['https://vercel.live', 'https://assets.vercel.com'],
	connect: ['https://vercel.live', 'wss://ws-us3.pusher.com'],
	frame: ['https://vercel.live'],
} as const;

// Google Tag Manager with its Google Analytics 4 and Google Ads tags, plus Tag Manager's preview mode. Hosts from
// https://developers.google.com/tag-platform/security/guides/csp
// Ads audience pixels use the visitor's local Google domain, so the main markets are listed.
const GOOGLE_COUNTRY_DOMAINS = [
	'https://www.google.ch',
	'https://www.google.de',
	'https://www.google.at',
	'https://www.google.fr',
	'https://www.google.it',
	'https://www.google.co.uk',
	'https://www.google.nl',
	'https://www.google.ca',
	'https://www.google.com.au',
] as const;

const GOOGLE_TAG_SRC = {
	script: [
		'https://www.googletagmanager.com',
		'https://tagmanager.google.com',
		'https://www.googleadservices.com',
		'https://*.doubleclick.net',
		'https://www.google.com',
	],
	style: ['https://tagmanager.google.com', 'https://fonts.googleapis.com'],
	img: [
		'https://*.google-analytics.com',
		'https://*.googletagmanager.com',
		'https://*.doubleclick.net',
		'https://www.googleadservices.com',
		'https://www.google.com',
		...GOOGLE_COUNTRY_DOMAINS,
		'https://ssl.gstatic.com',
		'https://www.gstatic.com',
	],
	font: ['https://fonts.gstatic.com'],
	connect: [
		'https://*.google-analytics.com',
		'https://analytics.google.com',
		'https://*.analytics.google.com',
		'https://*.googletagmanager.com',
		'https://*.doubleclick.net',
		'https://www.googleadservices.com',
		'https://pagead2.googlesyndication.com',
		'https://www.google.com',
		'https://google.com',
		...GOOGLE_COUNTRY_DOMAINS,
	],
	frame: ['https://www.googletagmanager.com', 'https://*.doubleclick.net'],
} as const;

// Microsoft Clarity, loaded only after consent. Hosts from
// https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-csp
const CLARITY_SRC = {
	script: ['https://www.clarity.ms', 'https://*.clarity.ms'],
	img: ['https://*.clarity.ms', 'https://c.bing.com'],
	connect: ['https://www.clarity.ms', 'https://*.clarity.ms'],
} as const;

const buildContentSecurityPolicy = ({ isDevelopment = process.env.NODE_ENV !== 'production' }: CspOptions = {}) => {
	const isUsingFirebaseEmulators = Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL);
	const isVercelPreview = process.env.VERCEL_ENV === 'preview';
	const toolbarSrc = (directive: keyof typeof VERCEL_TOOLBAR_SRC) => (isVercelPreview ? VERCEL_TOOLBAR_SRC[directive] : []);
	const scriptSrc = isDevelopment ? [...PRODUCTION_SCRIPT_SRC, ...DEVELOPMENT_SCRIPT_SRC_EXTRA] : PRODUCTION_SCRIPT_SRC;

	const connectSrc = [
		...PRODUCTION_CONNECT_SRC,
		...(isDevelopment || isUsingFirebaseEmulators ? LOCALHOST_CONNECT_SRC : []),
		...(isUsingFirebaseEmulators ? EMULATOR_CONNECT_SRC_EXTRA : []),
	];

	const directives = [
		`default-src 'self'`,
		`script-src ${joinSources([...scriptSrc, ...GOOGLE_TAG_SRC.script, ...CLARITY_SRC.script, ...toolbarSrc('script')])}`,
		`style-src ${joinSources([...STYLE_SRC, ...GOOGLE_TAG_SRC.style, ...toolbarSrc('style')])}`,
		`img-src ${joinSources([...IMG_SRC, ...GOOGLE_TAG_SRC.img, ...CLARITY_SRC.img, ...toolbarSrc('img')])}`,
		`font-src ${joinSources([...FONT_SRC, ...GOOGLE_TAG_SRC.font, ...toolbarSrc('font')])}`,
		`connect-src ${joinSources([...connectSrc, ...GOOGLE_TAG_SRC.connect, ...CLARITY_SRC.connect, ...toolbarSrc('connect')])}`,
		`frame-src ${joinSources([...FRAME_SRC, ...GOOGLE_TAG_SRC.frame, ...toolbarSrc('frame')])}`,
		`media-src ${joinSources(MEDIA_SRC)}`,
		`worker-src ${joinSources(WORKER_SRC)}`,
		`form-action ${joinSources(FORM_ACTION)}`,
		`frame-ancestors ${joinSources(FRAME_ANCESTORS)}`,
		`object-src 'none'`,
		`base-uri 'self'`,
		// HTTP emulators break when the browser upgrades all requests to HTTPS.
		...(isUsingFirebaseEmulators ? [] : ['upgrade-insecure-requests']),
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
