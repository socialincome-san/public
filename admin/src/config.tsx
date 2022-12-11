// emulator envs
export const FB_AUTH_EMULATOR_URL = import.meta.env.VITE_ADMIN_FB_AUTH_EMULATOR_URL;
export const FB_FIRESTORE_EMULATOR_HOST = import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_HOST;
export const FB_FIRESTORE_EMULATOR_PORT = import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_PORT;
export const FB_STORAGE_EMULATOR_HOST = import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_HOST;
export const FB_STORAGE_EMULATOR_PORT = import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_PORT;
export const FB_FUNCTIONS_EMULATOR_HOST = import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_HOST;
export const FB_FUNCTIONS_EMULATOR_PORT = import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_PORT;

// algolia search
export const ALGOLIA_APPLICATION_ID = import.meta.env.VITE_ADMIN_ALGOLIA_APPLICATION_ID;
export const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ADMIN_ALGOLIA_SEARCH_KEY;

// production envs
export const FIREBASE_CONFIG = {
	apiKey: import.meta.env.VITE_ADMIN_FB_API_KEY,
	authDomain: import.meta.env.VITE_ADMIN_FB_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_ADMIN_FB_DATABASE_URL,
	projectId: import.meta.env.VITE_ADMIN_FB_PROJECT_ID,
	storageBucket: import.meta.env.VITE_ADMIN_FB_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_ADMIN_FB_MESSAGING_SENDER_ID,
	measurementId: import.meta.env.VITE_ADMIN_FB_MEASUREMENT_ID,
};
