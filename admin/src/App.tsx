import algoliasearch from 'algoliasearch';

import {
	Authenticator,
	EntityCollection,
	FirebaseCMSApp,
	FirestoreTextSearchController,
	performAlgoliaTextSearch,
	User,
} from '@camberi/firecms';
import { AdminUser } from '@socialincome/shared/types';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { useState } from 'react';
import {
	adminsCollection,
	buildPartnerOrganisationsCollection,
	buildRecentPaymentsCollection,
	buildRecipientsCollection,
	contributorOrganisationsCollection,
	newsletterSubscribersCollection,
	operationalExpensesCollection,
	orangeMoneyRecipientsCollection,
	usersCollection,
} from './collections';

import {
	ALGOLIA_APPLICATION_ID,
	ALGOLIA_SEARCH_KEY,
	FB_API_KEY,
	FB_AUTH_DOMAIN,
	FB_AUTH_EMULATOR_URL,
	FB_DATABASE_URL,
	FB_FIRESTORE_EMULATOR_HOST,
	FB_FIRESTORE_EMULATOR_PORT,
	FB_MEASUREMENT_ID,
	FB_MESSAGING_SENDER_ID,
	FB_PROJECT_ID,
	FB_STORAGE_BUCKET,
	FB_STORAGE_EMULATOR_HOST,
	FB_STORAGE_EMULATOR_PORT,
} from './config';

const firebaseConfig = {
	apiKey: FB_API_KEY,
	authDomain: FB_AUTH_DOMAIN,
	databaseURL: FB_DATABASE_URL,
	projectId: FB_PROJECT_ID,
	storageBucket: FB_STORAGE_BUCKET,
	messagingSenderId: FB_MESSAGING_SENDER_ID,
	measurementId: FB_MEASUREMENT_ID,
};

const onFirebaseInit = () => {
	if (FB_AUTH_EMULATOR_URL) {
		connectAuthEmulator(getAuth(), FB_AUTH_EMULATOR_URL);
		console.log('Using auth emulator');
	} else {
		console.log('Using production auth');
	}
	if (FB_FIRESTORE_EMULATOR_HOST && FB_FIRESTORE_EMULATOR_PORT) {
		connectFirestoreEmulator(getFirestore(), FB_FIRESTORE_EMULATOR_HOST, +FB_FIRESTORE_EMULATOR_PORT);
		console.log(FB_FIRESTORE_EMULATOR_PORT);
		console.log('Using firestore emulator');
	} else {
		console.log('Using production firestore');
	}
	if (FB_STORAGE_EMULATOR_HOST && FB_STORAGE_EMULATOR_PORT) {
		connectStorageEmulator(getStorage(), FB_STORAGE_EMULATOR_HOST, +FB_STORAGE_EMULATOR_PORT);
		console.log('Using storage emulator');
	} else {
		console.log('Using production storage');
	}
};

const recipientsIndex =
	ALGOLIA_APPLICATION_ID && ALGOLIA_SEARCH_KEY
		? algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY).initIndex('recipients')
		: undefined;

const textSearchController: FirestoreTextSearchController = ({ path, searchString }) => {
	if (recipientsIndex && (path === 'recipients' || path === 'recentPayments')) {
		console.log('Using algolia search endpoint');
		return performAlgoliaTextSearch(recipientsIndex, searchString);
	} else {
		return undefined;
	}
};

export default function App() {
	const globalAdminCollections = [
		adminsCollection,
		operationalExpensesCollection,
		newsletterSubscribersCollection,
		contributorOrganisationsCollection,
		orangeMoneyRecipientsCollection,
		usersCollection,
		buildPartnerOrganisationsCollection({ isGlobalAdmin: true }),
		buildRecipientsCollection({ isGlobalAdmin: true }),
		buildRecentPaymentsCollection({ isGlobalAdmin: true }),
	];

	// The initialFilter property on collections is static, i.e. we can't dynamically access user information when we create
	// the filter, which is why we need to first fetch user information before we create the entire collection. This way,
	// we can set the filter based on the user's permission.
	const [collections, setCollections] = useState<EntityCollection[]>([]);
	const myAuthenticator: Authenticator<User> = async ({ user, dataSource }) => {
		dataSource
			.fetchEntity<AdminUser>({
				path: adminsCollection.path,
				collection: adminsCollection,
				entityId: user?.email ? user.email : '',
			})
			.then((result) => {
				if (collections.length === 0) {
					// We only want this to update once on initial page load
					if (result?.values?.is_global_admin) {
						setCollections(globalAdminCollections);
					} else {
						setCollections([
							buildPartnerOrganisationsCollection({ isGlobalAdmin: false }),
							buildRecipientsCollection({
								isGlobalAdmin: false,
								organisations: result?.values?.organisations,
							}),
							buildRecentPaymentsCollection({ isGlobalAdmin: false }),
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
			fontFamily={'SoSans'}
			locale={'enUS'}
			textSearchController={textSearchController}
			firebaseConfig={firebaseConfig}
			onFirebaseInit={onFirebaseInit}
			dateTimeFormat={'yyyy-MM-dd'}
		/>
	);
}
