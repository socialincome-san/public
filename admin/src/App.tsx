import algoliasearch from 'algoliasearch';

import { browserSessionPersistence, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import {
	Authenticator,
	CMSView,
	FirebaseCMSApp,
	FirestoreTextSearchController,
	performAlgoliaTextSearch,
} from 'firecms';
import { AdminUser, recipientSurveys } from '../../shared/src/types';

import { getApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { adminsCollection } from './collections/Admins';
import { contributorOrganisationsCollection } from './collections/ContributorOrganisations';
import { newsletterSubscribersCollection } from './collections/NewsletterSubscribers';
import { operationalExpensesCollection } from './collections/OperationalExpenses';
import { buildPartnerOrganisationsCollection } from './collections/PartnerOrganisations';
import { buildRecipientsCollection } from './collections/recipients/Recipients';
import { buildRecipientsPaymentsCollection } from './collections/recipients/RecipientsPayments';
import { buildRecipientsSurveysCollection } from './collections/recipients/RecipientsSurveys';
import { createPendingSurveyColumn, createSurveyColumn } from './collections/surveys/Surveys';
import { usersCollection } from './collections/Users';
import { PaymentsConfirmationView } from './views/PaymentsConfirmationView';
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
	const collections = [
		buildRecipientsPaymentsCollection(),
		buildRecipientsCollection(),
		buildPartnerOrganisationsCollection(),
		contributorOrganisationsCollection,
		adminsCollection,
		operationalExpensesCollection,
		newsletterSubscribersCollection,
		usersCollection,
		buildRecipientsSurveysCollection('Next Surveys', 'next-surveys')([createPendingSurveyColumn(0)]),
		buildRecipientsSurveysCollection(
			'All Surveys',
			'all-surveys'
		)(recipientSurveys.map((s) => createSurveyColumn(s.name))),
	];

	const views: CMSView[] = [
		{
			path: 'scripts',
			name: 'Scripts',
			group: 'Admin',
			description: 'Collection of Admin Scripts',
			view: <ScriptsView />,
		},
		{
			path: 'payments-confirmation',
			name: 'Payments Confirmation',
			description: 'Confirm payments of the current month',

			group: 'Recipients',
			icon: 'PriceCheck',
			view: <PaymentsConfirmationView />,
		},
	];

	const myAuthenticator: Authenticator = async ({ user, dataSource, authController }) => {
		const result = await dataSource.fetchEntity<AdminUser>({
			path: adminsCollection.path,
			collection: adminsCollection,
			entityId: user?.email ? user.email : '',
		});
		authController.setExtra({ isGlobalAdmin: Boolean(result?.values?.is_global_admin) });
		return true;
	};

	return (
		<FirebaseCMSApp
			authentication={myAuthenticator}
			collections={collections}
			dateTimeFormat={'dd/MM/yyyy'}
			firebaseConfig={firebaseConfig}
			locale={'enUS'}
			logo={'logo.svg'}
			logoDark={'logo.svg'}
			name={'Social Income Admin'}
			onFirebaseInit={onFirebaseInit}
			signInOptions={['google.com', 'password']}
			textSearchController={textSearchController}
			views={views}
		/>
	);
}
