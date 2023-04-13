import algoliasearch from 'algoliasearch';

import {
	Authenticator,
	CMSView,
	EntityCollection,
	FirebaseCMSApp,
	FirestoreTextSearchController,
	performAlgoliaTextSearch,
} from '@camberi/firecms';
import { browserSessionPersistence, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { useState } from 'react';
import { AdminUser } from '../../shared/src/types';
import {
	adminsCollection,
	buildPartnerOrganisationsCollection,
	buildRecipientsPaymentsCollection,
	contributorOrganisationsCollection,
	newsletterSubscribersCollection,
	operationalExpensesCollection,
	usersCollection,
} from './collections';

import { getApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { buildRecipientsPartnerOrgAdminCollection } from './collections/recipients/RecipientsPartnerOrgAdmin';
import { RecipientsView } from './views/RecipientsView';
import { ScriptsView } from './views/Scripts';

const onFirebaseInit = () => {
	const auth = getAuth();
	if (import.meta.env.VITE_PLAYWRIGHT_TESTS === 'true') {
		console.log('Running Playwright tests, using session storage for persistence');
		auth.setPersistence(browserSessionPersistence);
	}
	if (import.meta.env.VITE_ADMIN_FB_AUTH_EMULATOR_URL) {
		connectAuthEmulator(auth, import.meta.env.VITE_ADMIN_FB_AUTH_EMULATOR_URL, { disableWarnings: true });
		console.log('Using auth emulator');
	} else {
		console.log('Using production auth');
	}
	if (import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_HOST && import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_PORT) {
		connectFirestoreEmulator(
			getFirestore(),
			import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_HOST,
			+import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_PORT
		);
		console.log(import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_PORT);
		console.log('Using firestore emulator');
	} else {
		console.log('Using production firestore');
	}
	if (import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_HOST && import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_PORT) {
		connectStorageEmulator(
			getStorage(),
			import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_HOST,
			+import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_PORT
		);
		console.log('Using storage emulator');
	} else {
		console.log('Using production storage');
	}
	if (import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_HOST && import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_PORT) {
		const app = getApp();
		console.log(app);
		const functions = getFunctions(app);
		connectFunctionsEmulator(
			functions,
			import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_HOST,
			+import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_PORT
		);
		console.log('Using functions emulator');
	}
};

const firebaseConfig = {
	apiKey: import.meta.env.VITE_ADMIN_FB_API_KEY,
	authDomain: import.meta.env.VITE_ADMIN_FB_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_ADMIN_FB_DATABASE_URL,
	projectId: import.meta.env.VITE_ADMIN_FB_PROJECT_ID,
	storageBucket: import.meta.env.VITE_ADMIN_FB_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_ADMIN_FB_MESSAGING_SENDER_ID,
	measurementId: import.meta.env.VITE_ADMIN_FB_MEASUREMENT_ID,
};

const algoliaIndex = (indexName: string) => {
	return import.meta.env.VITE_ADMIN_ALGOLIA_APPLICATION_ID && import.meta.env.VITE_ADMIN_ALGOLIA_SEARCH_KEY
		? algoliasearch(
				import.meta.env.VITE_ADMIN_ALGOLIA_APPLICATION_ID,
				import.meta.env.VITE_ADMIN_ALGOLIA_SEARCH_KEY
		  ).initIndex(indexName)
		: undefined;
};

const usersIndex = algoliaIndex('users');
const recipientsIndex = algoliaIndex('recipients');

// Relies on the algolia firebase extensions configured at: https://console.firebase.google.com/u/1/project/social-income-prod/extensions
const textSearchController: FirestoreTextSearchController = ({ path, searchString }) => {
	if (recipientsIndex && (path === 'recipients' || path === 'recentPayments')) {
		return performAlgoliaTextSearch(recipientsIndex, searchString);
	} else if (usersIndex && path === 'users') {
		return performAlgoliaTextSearch(usersIndex, searchString);
	} else {
		return undefined;
	}
};

export default function App() {
	// The initialFilter property on collections is static, i.e. we can't dynamically access user information when we create
	// the filter, which is why we need to first fetch user information before we create the entire collection. This way,
	// we can set the filter based on the user's permission.
	const [collections, setCollections] = useState<EntityCollection[]>([]);
	const [customViews, setCustomViews] = useState<CMSView[]>([]);

	const globalAdminCollections = [
		adminsCollection,
		operationalExpensesCollection,
		newsletterSubscribersCollection,
		contributorOrganisationsCollection,
		usersCollection,
		buildPartnerOrganisationsCollection({ isGlobalAdmin: true }),
	];

	const globalAdminCustomViews: CMSView[] = [
		{
			path: 'recipients',
			name: 'Recipients',
			group: 'Recipients',
			icon: 'RememberMeTwoTone',
			description: 'Collection of Recipients',
			view: <RecipientsView />,
		},
		{
			path: 'scripts',
			name: 'Scripts',
			group: 'Admin',
			description: 'Collection of Admin Scripts',
			view: <ScriptsView />,
		},
	];

	const myAuthenticator: Authenticator = async ({ user, dataSource, authController }) => {
		dataSource
			.fetchEntity<AdminUser>({
				path: adminsCollection.path,
				collection: adminsCollection,
				entityId: user?.email ? user.email : '',
			})
			.then((result) => {
				if (collections.length === 0) {
					// We only want this to update once on initial page load
					// Global analysts have no write access through the firestore rules, so it's ok to show all collections
					if (result?.values?.is_global_admin || result?.values?.is_global_analyst) {
						setCollections(globalAdminCollections);
						setCustomViews(globalAdminCustomViews);
						authController.setExtra({ isGlobalAdmin: Boolean(result?.values?.is_global_admin) });
					} else if (result?.values?.organisations) {
						authController.setExtra({ organisations: result.values.organisations });
						setCollections([
							buildPartnerOrganisationsCollection({ isGlobalAdmin: false }),
							buildRecipientsPartnerOrgAdminCollection(result.values.organisations),
							buildRecipientsPaymentsCollection({
								isGlobalAdmin: false,
								organisations: result.values.organisations,
							}),
						]);
					}
				}
			});
		return true;
	};

	return (
		<FirebaseCMSApp
			name={'Social Income Admin'}
			logo={'logo.svg'}
			logoDark={'logo.svg'}
			signInOptions={['google.com', 'password']}
			collections={collections}
			authentication={myAuthenticator}
			locale={'enUS'}
			textSearchController={textSearchController}
			firebaseConfig={firebaseConfig}
			onFirebaseInit={onFirebaseInit}
			dateTimeFormat={'yyyy-MM-dd'}
			views={customViews}
		/>
	);
}
