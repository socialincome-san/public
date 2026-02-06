import { Contributor, ContributorReferralSource } from '@/generated/prisma/client';

export const contributorsData: Contributor[] = [
	{
		id: 'contributor-1',
		legacyFirestoreId: null,
		accountId: 'account-1',
		contactId: 'contact-1',
		referral: ContributorReferralSource.family_and_friends,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-001',
		needsOnboarding: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'contributor-2',
		legacyFirestoreId: null,
		accountId: 'account-7',
		contactId: 'contact-2',
		referral: ContributorReferralSource.work,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-002',
		needsOnboarding: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
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
		needsOnboarding: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'contributor-4',
		legacyFirestoreId: null,
		accountId: 'account-4',
		contactId: 'contact-4',
		referral: ContributorReferralSource.work,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-004',
		needsOnboarding: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'contributor-5',
		legacyFirestoreId: null,
		accountId: 'account-5',
		contactId: 'contact-5',
		referral: ContributorReferralSource.social_media,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-005',
		needsOnboarding: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'contributor-6',
		legacyFirestoreId: null,
		accountId: 'account-6',
		contactId: 'contact-6',
		referral: ContributorReferralSource.other,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-006',
		needsOnboarding: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	}
];