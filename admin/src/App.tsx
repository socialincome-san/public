import algoliasearch from 'algoliasearch';

import {
	Authenticator,
	CMSView,
	FirebaseCMSApp,
	FirestoreTextSearchController,
	performAlgoliaTextSearch,
} from 'firecms';
import { AdminUser, recipientSurveys } from '../../shared/src/types';

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
import { getFirebaseConfig, onFirebaseInit } from './init';
import { PaymentsConfirmationView } from './views/PaymentsConfirmationView';
import { ScriptsView } from './views/ScriptsView';

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
		buildRecipientsCollection(),
		buildRecipientsPaymentsCollection(),
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
			description: 'All payments that need to be confirmed',
			group: 'Recipients',
			icon: 'PriceCheck',
			view: <PaymentsConfirmationView />,
		},
	];

	const myAuthenticator: Authenticator = async ({ user, dataSource, authController }) => {
		const adminUserEntity = await dataSource.fetchEntity<AdminUser>({
			path: adminsCollection.path,
			collection: adminsCollection,
			entityId: user?.email ? user.email : '',
		});
		authController.setExtra({ isGlobalAdmin: Boolean(adminUserEntity?.values?.is_global_admin) });
		return true;
	};

	return (
		<FirebaseCMSApp
			authentication={myAuthenticator}
			collections={collections}
			dateTimeFormat={'dd/MM/yyyy'}
			firebaseConfig={getFirebaseConfig()}
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
