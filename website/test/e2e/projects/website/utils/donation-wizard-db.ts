import { ContributorReferralSource } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { expect } from '@playwright/test';
import { deleteFirebaseEmailsIfExist, getFirebaseAdminService } from '../../../utils';

export type DonationWizardDonor = {
	email: string;
	firstName: string;
	lastName: string;
};

const findContributorByEmail = (email: string) =>
	prisma.contributor.findFirst({
		where: { contact: { email } },
		include: {
			contact: { include: { address: true } },
			account: true,
		},
	});

const expectFirebaseAuthUser = async (email: string, expectedUid: string) => {
	const firebase = await getFirebaseAdminService();
	const firebaseUser = await firebase.getByEmail(email);

	expect(firebaseUser.success).toBe(true);
	if (!firebaseUser.success) {
		throw new Error(firebaseUser.error);
	}

	expect(firebaseUser.data).not.toBeNull();
	expect(firebaseUser.data?.uid).toBe(expectedUid);
	expect(firebaseUser.data?.email).toBe(email);
};

export const deleteDonationWizardTestUser = async (email: string) => {
	const contributor = await prisma.contributor.findFirst({
		where: { contact: { email } },
		select: {
			id: true,
			accountId: true,
			contactId: true,
			contact: { select: { addressId: true } },
		},
	});

	if (contributor) {
		await prisma.paymentEvent.deleteMany({
			where: { contribution: { contributorId: contributor.id } },
		});
		await prisma.contribution.deleteMany({ where: { contributorId: contributor.id } });
		await prisma.donationCertificate.deleteMany({ where: { contributorId: contributor.id } });
		await prisma.contributor.delete({ where: { id: contributor.id } });

		if (contributor.contact.addressId) {
			await prisma.address.delete({ where: { id: contributor.contact.addressId } });
		}

		await prisma.contact.delete({ where: { id: contributor.contactId } });
		await prisma.account.delete({ where: { id: contributor.accountId } });
	}

	await deleteFirebaseEmailsIfExist(email);
};

export const expectNoDonationWizardRecords = async (email: string) => {
	const contributor = await prisma.contributor.findFirst({
		where: { contact: { email } },
	});

	expect(contributor).toBeNull();

	const firebase = await getFirebaseAdminService();
	const firebaseUser = await firebase.getByEmail(email);

	expect(firebaseUser.success).toBe(true);
	if (!firebaseUser.success) {
		throw new Error(firebaseUser.error);
	}

	expect(firebaseUser.data).toBeNull();
};

export const expectContributorCreated = async (donor: DonationWizardDonor, options: { language?: string } = {}) => {
	const { language = 'en' } = options;
	const contributor = await findContributorByEmail(donor.email);

	expect(contributor).not.toBeNull();
	expect(contributor?.contact.firstName).toBe(donor.firstName);
	expect(contributor?.contact.lastName).toBe(donor.lastName);
	expect(contributor?.contact.email).toBe(donor.email);
	expect(contributor?.contact.language).toBe(language);
	expect(contributor?.paymentReferenceId).toMatch(/^\d+$/);
	expect(contributor?.referral).toBe(ContributorReferralSource.other);
	expect(contributor?.needsOnboarding).toBe(true);
	expect(contributor?.stripeCustomerId).toBeNull();

	expect(contributor?.account).not.toBeNull();
	expect(contributor?.account.firebaseAuthUserId).toBeTruthy();

	const portalUser = await prisma.user.findFirst({
		where: { contact: { email: donor.email } },
	});
	expect(portalUser).toBeNull();

	await expectFirebaseAuthUser(donor.email, contributor!.account.firebaseAuthUserId);

	return contributor!;
};

const expectContributorIdentity = async (donor: DonationWizardDonor, options: { language?: string } = {}) => {
	const { language = 'en' } = options;
	const contributor = await findContributorByEmail(donor.email);

	expect(contributor).not.toBeNull();
	expect(contributor?.contact.firstName).toBe(donor.firstName);
	expect(contributor?.contact.lastName).toBe(donor.lastName);
	expect(contributor?.contact.email).toBe(donor.email);
	expect(contributor?.contact.language).toBe(language);
	expect(contributor?.paymentReferenceId).toMatch(/^\d+$/);
	expect(contributor?.stripeCustomerId).toBeNull();
	expect(contributor?.account.firebaseAuthUserId).toBeTruthy();

	await expectFirebaseAuthUser(donor.email, contributor!.account.firebaseAuthUserId);
};

export const expectNoContributionOrPaymentEvent = async (email: string) => {
	const contributor = await findContributorByEmail(email);

	expect(contributor).not.toBeNull();

	const contributionCount = await prisma.contribution.count({
		where: { contributorId: contributor!.id },
	});
	expect(contributionCount).toBe(0);

	const paymentEventCount = await prisma.paymentEvent.count({
		where: { contribution: { contributorId: contributor!.id } },
	});
	expect(paymentEventCount).toBe(0);
};

export const expectPendingMonthlyContribution = async (email: string, options: { amount: number; currency?: string }) => {
	const { amount, currency = 'CHF' } = options;
	const contributor = await findContributorByEmail(email);

	expect(contributor).not.toBeNull();

	const contributions = await prisma.contribution.findMany({
		where: { contributorId: contributor!.id },
		include: {
			paymentEvent: true,
			campaign: { select: { isFallback: true } },
		},
		orderBy: { createdAt: 'desc' },
	});

	expect(contributions).toHaveLength(1);

	const contribution = contributions[0];

	expect(contribution.status).toBe('pending');
	expect(contribution.interval).toBe('monthly');
	expect(contribution.currency).toBe(currency);
	expect(Number(contribution.amount)).toBe(amount);
	expect(Number(contribution.amountChf)).toBe(amount);
	expect(Number(contribution.feesChf)).toBe(0);
	expect(contribution.campaign.isFallback).toBe(true);

	expect(contribution.paymentEvent).not.toBeNull();
	expect(contribution.paymentEvent?.type).toBe('bank_transfer');
	expect(contribution.paymentEvent?.contributionId).toBe(contribution.id);
	expect(contribution.paymentEvent?.transactionId).toMatch(/^\d+$/);

	return contribution;
};

export const expectContributorOnboardingCompleted = async (
	email: string,
	expected: { gender: string; country: string; language?: string },
) => {
	const { gender, country, language = 'en' } = expected;
	const contributor = await findContributorByEmail(email);

	expect(contributor).not.toBeNull();
	expect(contributor?.needsOnboarding).toBe(false);
	expect(contributor?.contact.email).toBe(email);
	expect(contributor?.contact.language).toBe(language);
	expect(contributor?.contact.gender).toBe(gender);
	expect(contributor?.contact.address).not.toBeNull();
	expect(contributor?.contact.address?.country).toBe(country);
};

const expectContributorReferral = async (email: string, referral: ContributorReferralSource) => {
	const contributor = await findContributorByEmail(email);

	expect(contributor).not.toBeNull();
	expect(contributor?.referral).toBe(referral);
};

const expectContributorWithStripeCustomer = async (donor: DonationWizardDonor, options: { language?: string } = {}) => {
	const { language = 'en' } = options;
	const contributor = await findContributorByEmail(donor.email);

	expect(contributor).not.toBeNull();
	expect(contributor?.contact.firstName).toBe(donor.firstName);
	expect(contributor?.contact.lastName).toBe(donor.lastName);
	expect(contributor?.contact.email).toBe(donor.email);
	expect(contributor?.contact.language).toBe(language);
	expect(contributor?.paymentReferenceId).toBeNull();
	expect(contributor?.stripeCustomerId).toBeTruthy();
	expect(contributor?.account.firebaseAuthUserId).toBeTruthy();

	await expectFirebaseAuthUser(donor.email, contributor!.account.firebaseAuthUserId);
};

export const getContributorStripeCustomerId = async (email: string) => {
	const contributor = await findContributorByEmail(email);

	if (!contributor?.stripeCustomerId) {
		throw new Error(`No Stripe customer id for contributor ${email}`);
	}

	return contributor.stripeCustomerId;
};

const expectSucceededOneTimeStripeContribution = async (email: string, options: { amount: number; currency?: string }) => {
	const { amount, currency = 'CHF' } = options;
	const contributor = await findContributorByEmail(email);

	expect(contributor).not.toBeNull();

	const contributions = await prisma.contribution.findMany({
		where: { contributorId: contributor!.id },
		include: {
			paymentEvent: true,
			campaign: { select: { isFallback: true } },
		},
		orderBy: { createdAt: 'desc' },
	});

	expect(contributions.length).toBeGreaterThanOrEqual(1);

	const contribution = contributions[0];

	expect(contribution.status).toBe('succeeded');
	expect(contribution.interval).toBeNull();
	expect(contribution.currency).toBe(currency);
	expect(Number(contribution.amount)).toBe(amount);
	if (currency === 'CHF') {
		expect(Number(contribution.amountChf)).toBe(amount);
	} else {
		expect(Number(contribution.amountChf)).toBeGreaterThan(0);
	}
	expect(contribution.campaign.isFallback).toBe(true);
	expect(contribution.paymentEvent).not.toBeNull();
	expect(contribution.paymentEvent?.type).toBe('stripe');
	expect(contribution.paymentEvent?.contributionId).toBe(contribution.id);

	return contribution;
};

export const expectCompleteOneTimeStripeDonation = async (
	donor: DonationWizardDonor,
	options: {
		amount: number;
		currency?: string;
		language?: string;
		gender: string;
		country: string;
		referral: ContributorReferralSource;
	},
) => {
	const { amount, currency = 'CHF', language = 'en', gender, country, referral } = options;

	await expectContributorWithStripeCustomer(donor, { language });
	await expectSucceededOneTimeStripeContribution(donor.email, { amount, currency });
	await expectContributorOnboardingCompleted(donor.email, { gender, country, language });
	await expectContributorReferral(donor.email, referral);
};

export const expectCompleteMonthlyQrDonation = async (
	donor: DonationWizardDonor,
	options: {
		amount: number;
		currency?: string;
		language?: string;
		gender: string;
		country: string;
		referral: ContributorReferralSource;
	},
) => {
	const { amount, currency = 'CHF', language = 'en', gender, country, referral } = options;

	await expectContributorIdentity(donor, { language });
	await expectPendingMonthlyContribution(donor.email, { amount, currency });
	await expectContributorOnboardingCompleted(donor.email, { gender, country, language });
	await expectContributorReferral(donor.email, referral);
};
