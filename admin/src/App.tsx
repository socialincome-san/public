import algoliasearch from 'algoliasearch';

import {
	Authenticator,
	CMSView,
	EntityCollection,
	FirebaseCMSApp,
	FirestoreTextSearchController,
	performAlgoliaTextSearch,
	User,
} from '@camberi/firecms';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { useState } from 'react';
import { AdminUser } from '../../shared/src/types';
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

import { getApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import * as config from './config';
import { ScriptsView } from './views/Scripts';

const onFirebaseInit = () => {
	if (config.FB_AUTH_EMULATOR_URL) {
		connectAuthEmulator(getAuth(), config.FB_AUTH_EMULATOR_URL);
		console.log('Using auth emulator');
	} else {
		console.log('Using production auth');
	}
	if (config.FB_FIRESTORE_EMULATOR_HOST && config.FB_FIRESTORE_EMULATOR_PORT) {
		connectFirestoreEmulator(getFirestore(), config.FB_FIRESTORE_EMULATOR_HOST, +config.FB_FIRESTORE_EMULATOR_PORT);
		console.log(config.FB_FIRESTORE_EMULATOR_PORT);
		console.log('Using firestore emulator');
	} else {
		console.log('Using production firestore');
	}
	if (config.FB_STORAGE_EMULATOR_HOST && config.FB_STORAGE_EMULATOR_PORT) {
		connectStorageEmulator(getStorage(), config.FB_STORAGE_EMULATOR_HOST, +config.FB_STORAGE_EMULATOR_PORT);
		console.log('Using storage emulator');
	} else {
		console.log('Using production storage');
	}
	if (config.FB_FUNCTIONS_EMULATOR_HOST && config.FB_FUNCTIONS_EMULATOR_PORT) {
		const app = getApp();
		console.log(app);
		const functions = getFunctions(app);
		connectFunctionsEmulator(functions, config.FB_FUNCTIONS_EMULATOR_HOST, +config.FB_FUNCTIONS_EMULATOR_PORT);
		console.log('Using functions emulator');
	}
};

const recipientsIndex =
	config.ALGOLIA_APPLICATION_ID && config.ALGOLIA_SEARCH_KEY
		? algoliasearch(config.ALGOLIA_APPLICATION_ID, config.ALGOLIA_SEARCH_KEY).initIndex('recipients')
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

	// Adding custom pages depending on the user role
	const publicCustomViews: CMSView[] = [];
	const globalAdminCustomViews: CMSView[] = [
		{
			path: 'scripts',
			name: 'Scripts',
			group: 'Admin',
			description: 'Collection of Admin Scripts',
			view: <ScriptsView />,
		},
	];
	const [customViews, setCustomViews] = useState<CMSView[]>(publicCustomViews);

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
						setCustomViews(publicCustomViews.concat(globalAdminCustomViews));
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
			firebaseConfig={config.FIREBASE_CONFIG}
			onFirebaseInit={onFirebaseInit}
			dateTimeFormat={'yyyy-MM-dd'}
			views={customViews}
		/>
	);
}
