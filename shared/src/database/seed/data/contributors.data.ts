import { Contributor, ContributorReferralSource } from '@prisma/client';

export const contributorsData: Contributor[] = [
	{
		id: 'contributor-1',
		legacyFirestoreId: null,
		accountId: 'account-1',
		contactId: 'contact-1',
		referral: ContributorReferralSource.family_and_friends,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-001',
		institution: false,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'contributor-2',
		legacyFirestoreId: null,
		accountId: 'account-2',
		contactId: 'contact-2',
		referral: ContributorReferralSource.work,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-002',
		institution: false,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'contributor-3',
		legacyFirestoreId: null,
		accountId: 'account-3',
		contactId: 'contact-3',
		referral: ContributorReferralSource.social_media,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-003',
		institution: false,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'contributor-4',
		legacyFirestoreId: null,
		accountId: 'account-4',
		contactId: 'contact-16',
		referral: ContributorReferralSource.work,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-004',
		institution: false,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'contributor-5',
		legacyFirestoreId: null,
		accountId: 'account-5',
		contactId: 'contact-17',
		referral: ContributorReferralSource.social_media,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-005',
		institution: true,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'contributor-6',
		legacyFirestoreId: null,
		accountId: 'account-6',
		contactId: 'contact-18',
		referral: ContributorReferralSource.other,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-006',
		institution: false,
		createdAt: new Date(),
		updatedAt: null
	}
];