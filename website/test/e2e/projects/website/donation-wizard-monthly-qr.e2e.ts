import { ContributorReferralSource } from '@/generated/prisma/enums';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import {
	deleteDonationWizardTestUser,
	expectCompleteMonthlyQrDonation,
	expectContributorCreated,
	expectContributorOnboardingCompleted,
	expectNoContributionOrPaymentEvent,
	expectNoDonationWizardRecords,
	expectPendingMonthlyContribution,
} from './utils/donation-wizard-db';
import {
	closeCompletedDonationWizard,
	completeAmountStep,
	completeMonthlyPlanStep,
	completeOnboardingStep,
	completeQrContactStep,
	completeQrPaymentMethodStep,
	completeReferralStep,
	confirmQrStandingOrder,
	openDonationWizardFromNav,
} from './utils/donation-wizard-flow';

const MONTHLY_INCOME = 7500;
const MONTHLY_DONATION_AMOUNT = 75;

test.beforeEach(async () => {
	await seedDatabase();
});

test('monthly donation via QR creates records at the right steps', async ({ page }) => {
	const donor = {
		firstName: 'Monthly',
		lastName: 'QrDonor',
		email: `donation-wizard.monthly-qr.${Date.now()}@example.com`,
	};

	await deleteDonationWizardTestUser(donor.email);

	try {
		await openDonationWizardFromNav(page);
		await completeAmountStep(page, MONTHLY_INCOME);
		await completeMonthlyPlanStep(page);
		await completeQrPaymentMethodStep(page);

		await expectNoDonationWizardRecords(donor.email);

		await completeQrContactStep(page, donor);
		await expectContributorCreated(donor);
		await expectNoContributionOrPaymentEvent(donor.email);

		await confirmQrStandingOrder(page);
		await expectPendingMonthlyContribution(donor.email, { amount: MONTHLY_DONATION_AMOUNT });

		await completeOnboardingStep(page, 'female');
		await expectContributorOnboardingCompleted(donor.email, { gender: 'female', country: 'CH' });

		await completeReferralStep(page, 'social_media');
		await expectCompleteMonthlyQrDonation(donor, {
			amount: MONTHLY_DONATION_AMOUNT,
			gender: 'female',
			country: 'CH',
			referral: ContributorReferralSource.social_media,
		});
		await closeCompletedDonationWizard(page);
	} finally {
		await deleteDonationWizardTestUser(donor.email);
	}
});
