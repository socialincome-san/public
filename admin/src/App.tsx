import { AdminUser } from '@socialincome/shared/src/types/admin-user';
import algoliasearch from 'algoliasearch';
import {
	Authenticator,
	CMSView,
	FirebaseCMSApp,
	FirestoreTextSearchController,
	performAlgoliaTextSearch,
} from 'firecms';
import { adminsCollection } from './collections/Admins';
import { campaignsCollection } from './collections/Campaigns';
import { buildContributionsCollection } from './collections/Contributions';
import { contributorsCollection } from './collections/Contributors';
import { expensesCollection } from './collections/Expenses';
import { buildPartnerOrganisationsCollection } from './collections/PartnerOrganisations';
import { buildPaymentForecastCollection } from './collections/PaymentForecast';
import { buildRecipientsCollection } from './collections/recipients/Recipients';
import { buildRecipientsPaymentsCollection } from './collections/recipients/RecipientsPayments';
import { buildSurveysCollection } from './collections/surveys/Surveys';
import { firebaseConfig, onFirebaseInit } from './init';
import { NextSurveysView } from './views/NextSurveysView';
import { PaymentsConfirmationView } from './views/PaymentsConfirmationView';
import { ScriptsView } from './views/ScriptsView';

const algoliaIndex = (indexName: string) => {
	return import.meta.env.VITE_ADMIN_ALGOLIA_APPLICATION_ID && import.meta.env.VITE_ADMIN_ALGOLIA_SEARCH_KEY
		? algoliasearch(
				import.meta.env.VITE_ADMIN_ALGOLIA_APPLICATION_ID,
				import.meta.env.VITE_ADMIN_ALGOLIA_SEARCH_KEY,
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
		contributorsCollection,
		buildContributionsCollection({ collectionGroup: true }),
		buildPartnerOrganisationsCollection(),
		buildSurveysCollection({ collectionGroup: true }),
		adminsCollection,
		expensesCollection,
		buildPaymentForecastCollection(),
		campaignsCollection,
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
		{
			path: 'upcoming-surveys',
			name: 'Upcoming Surveys',
			description: 'Upcoming surveys',
			group: 'Surveys',
			icon: 'MarkunreadMailbox',
			view: <NextSurveysView />,
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
			firebaseConfig={firebaseConfig as Record<string, any>}
			onFirebaseInit={onFirebaseInit}
			locale={'enUS'}
			logo={'logo.svg'}
			logoDark={'logo.svg'}
			name={'Social Income Admin'}
			signInOptions={['google.com', 'password']}
			textSearchController={textSearchController}
			views={views}
		/>
	);
}
