import { EntityReference } from '@camberi/firecms';

export interface BuildCollectionProps {
	isGlobalAdmin: boolean;
	organisations?: EntityReference[];
}

export { adminsCollection } from './Admins';
export { contributionsCollection } from './Contributions';
export { contributorOrganisationsCollection } from './ContributorOrganisations';
export { newsletterSubscribersCollection } from './NewsletterSubscribers';
export { messageTemplatesCollection } from './MessageTemplates';
export { operationalExpensesCollection } from './OperationalExpenses';
export { buildPartnerOrganisationsCollection } from './PartnerOrganisations';
export { paymentsCollection } from './Payments';
export { recentPaymentsCollection } from './RecentPayments';
export { buildRecipientsCollection } from './Recipients';
export { usersCollection } from './Users';
