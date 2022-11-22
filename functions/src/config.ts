export const STRIPE_API_READ_KEY = process.env.STRIPE_API_READ_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export const POSTFINANCE_EMAIL_USER = process.env.POSTFINANCE_EMAIL_USER!;
export const POSTFINANCE_EMAIL_PASSWORD = process.env.POSTFINANCE_EMAIL_PASSWORD!;



// emulator envs
export const FB_AUTH_EMULATOR_URL = '0.0.0.0';
export const FB_FIRESTORE_EMULATOR_HOST = '0.0.0.0';
export const FB_FIRESTORE_EMULATOR_PORT = '8080';
export const FB_STORAGE_EMULATOR_HOST = '0.0.0.0';
export const FB_STORAGE_EMULATOR_PORT = '9199';

// algolia search
export const ALGOLIA_APPLICATION_ID = process.env.REACT_APP_ADMIN_ALGOLIA_APPLICATION_ID;
export const ALGOLIA_SEARCH_KEY = process.env.REACT_APP_ADMIN_ALGOLIA_SEARCH_KEY;

// production envs
export const FIREBASE_CONFIG = {
	apiKey: process.env.REACT_APP_ADMIN_FB_API_KEY,
	authDomain: process.env.REACT_APP_ADMIN_FB_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_ADMIN_FB_DATABASE_URL,
	projectId: process.env.REACT_APP_ADMIN_FB_PROJECT_ID,
	storageBucket: process.env.REACT_APP_ADMIN_FB_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_ADMIN_FB_MESSAGING_SENDER_ID,
	measurementId: process.env.REACT_APP_ADMIN_FB_MEASUREMENT_ID,
};
