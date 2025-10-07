import { Contributor, ContributorReferralSource } from '@prisma/client';

export const contributorsData: Contributor[] = [
	{
		id: 'contributor-1',
		userAccountId: 'user-account-1',
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
		userAccountId: 'user-account-2',
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
		userAccountId: 'user-account-3',
		contactId: 'contact-3',
		referral: ContributorReferralSource.social_media,
		paymentReferenceId: null,
		stripeCustomerId: 'stripe-cust-003',
		institution: false,
		createdAt: new Date(),
		updatedAt: null
	}
];