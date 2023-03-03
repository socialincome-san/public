import { EntityReference } from '@camberi/firecms';

export interface BuildCollectionProps {
	isGlobalAdmin: boolean;
	organisations?: EntityReference[];
}

export { adminsCollection } from './Admins';
export { contributionsCollection } from './Contributions';
export { contributorOrganisationsCollection } from './ContributorOrganisations';
export { newsletterSubscribersCollection } from './NewsletterSubscribers';
export { operationalExpensesCollection } from './OperationalExpenses';
export { buildPartnerOrganisationsCollection } from './PartnerOrganisations';
export { paymentsCollection } from './Payments';
export { buildRecipientsCollection } from './recipients/Recipients';
export { buildRecipientsRecentPaymentsCollection } from './recipients/RecipientsRecentPayments';
export { surveysCollection } from './surveys/Surveys';
export { usersCollection } from './Users';
