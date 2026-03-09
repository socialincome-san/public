import { PrismaClient } from '@/generated/prisma/client';
import { prisma } from '../database/prisma';
import { AppReviewModeService } from './app-review-mode/app-review-mode.service';
import { BankTransferService } from './bank-transfer/bank-transfer.service';
import { CampaignReadService } from './campaign/campaign-read.service';
import { CampaignWriteService } from './campaign/campaign-write.service';
import { CandidateReadService } from './candidate/candidate-read.service';
import { CandidateWriteService } from './candidate/candidate-write.service';
import { ContributionReadService } from './contribution/contribution-read.service';
import { ContributionWriteService } from './contribution/contribution-write.service';
import { ContributorReadService } from './contributor/contributor-read.service';
import { ContributorWriteService } from './contributor/contributor-write.service';
import { CountryReadService } from './country/country-read.service';
import { CountryWriteService } from './country/country-write.service';
import { DonationCertificateReadService } from './donation-certificate/donation-certificate-read.service';
import { DonationCertificateWriteService } from './donation-certificate/donation-certificate-write.service';
import { ExchangeRateImportService } from './exchange-rate/exchange-rate-import.service';
import { ExchangeRateReadService } from './exchange-rate/exchange-rate-read.service';
import { ExchangeRateWriteService } from './exchange-rate/exchange-rate-write.service';
import { ExpenseReadService } from './expense/expense-read.service';
import { ExpenseWriteService } from './expense/expense-write.service';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { FirebaseSessionService } from './firebase/firebase-session.service';
import { LocalPartnerReadService } from './local-partner/local-partner-read.service';
import { LocalPartnerWriteService } from './local-partner/local-partner-write.service';
import { MobileMoneyProviderReadService } from './mobile-money-provider/mobile-money-provider-read.service';
import { MobileMoneyProviderWriteService } from './mobile-money-provider/mobile-money-provider-write.service';
import { OrganizationAccessService } from './organization-access/organization-access.service';
import { OrganizationReadService } from './organization/organization-read.service';
import { PaymentFileImportService } from './payment-file-import/payment-file-import.service';
import { PayoutProcessService } from './payout-process/payout-process.service';
import { PayoutReadService } from './payout/payout-read.service';
import { PayoutWriteService } from './payout/payout-write.service';
import { ProgramAccessReadService } from './program-access/program-access-read.service';
import { ProgramAccessWriteService } from './program-access/program-access-write.service';
import { ProgramStatsService } from './program-stats/program-stats.service';
import { ProgramReadService } from './program/program-read.service';
import { ProgramWriteService } from './program/program-write.service';
import { RecipientReadService } from './recipient/recipient-read.service';
import { RecipientWriteService } from './recipient/recipient-write.service';
import { SendgridSubscriptionService } from './sendgrid/sendgrid-subscription.service';
import { StoryblokService } from './storyblok/storyblok.service';
import { StripeService } from './stripe/stripe.service';
import { SurveyScheduleService } from './survey-schedule/survey-schedule.service';
import { SurveyReadService } from './survey/survey-read.service';
import { SurveyWriteService } from './survey/survey-write.service';
import { TransparencyService } from './transparency/transparency.service';
import { TwilioService } from './twilio/twilio.service';
import { UserReadService } from './user/user-read.service';
import { UserWriteService } from './user/user-write.service';

function buildServices(db: PrismaClient) {
	// Leaf services – no dependencies on other services
	const appReviewMode = new AppReviewModeService(db);
	const firebaseAdmin = new FirebaseAdminService(db);
	const firebaseSession = new FirebaseSessionService(db);
	const programAccessRead = new ProgramAccessReadService(db);
	const programAccessWrite = new ProgramAccessWriteService(db);
	const organizationAccess = new OrganizationAccessService(db);
	const userRead = new UserReadService(db);
	const exchangeRateImport = new ExchangeRateImportService(db);
	const surveySchedule = new SurveyScheduleService(db);
	const transparency = new TransparencyService(db);
	const storyblok = new StoryblokService(db);
	const sendgrid = new SendgridSubscriptionService();

	// One level of dependencies
	const exchangeRateRead = new ExchangeRateReadService(db, userRead);
	const exchangeRateWrite = new ExchangeRateWriteService(db, userRead, exchangeRateImport);
	const userWrite = new UserWriteService(db, firebaseAdmin, userRead);
	const candidateRead = new CandidateReadService(db, userRead);
	const candidateWrite = new CandidateWriteService(db, userRead, firebaseAdmin);
	const recipientRead = new RecipientReadService(db, programAccessRead, firebaseAdmin, appReviewMode);
	const recipientWrite = new RecipientWriteService(db, programAccessRead, firebaseAdmin);
	const payoutWrite = new PayoutWriteService(db, programAccessRead);
	const twilio = new TwilioService(db, firebaseAdmin, appReviewMode);
	const contributionRead = new ContributionReadService(db, organizationAccess);
	const contributionWrite = new ContributionWriteService(db, organizationAccess);
	const organizationRead = new OrganizationReadService(db, userRead, organizationAccess);
	const localPartnerRead = new LocalPartnerReadService(db, userRead);
	const localPartnerWrite = new LocalPartnerWriteService(db, userRead, firebaseAdmin);
	const mobileMoneyProviderRead = new MobileMoneyProviderReadService(db, userRead);
	const mobileMoneyProviderWrite = new MobileMoneyProviderWriteService(db, userRead);
	const countryRead = new CountryReadService(db, userRead);
	const countryWrite = new CountryWriteService(db, userRead);
	const expenseRead = new ExpenseReadService(db, userRead);
	const expenseWrite = new ExpenseWriteService(db, userRead);
	const contributorRead = new ContributorReadService(db, organizationAccess);
	const contributorWrite = new ContributorWriteService(db, organizationAccess, firebaseAdmin, sendgrid);
	const campaignWrite = new CampaignWriteService(db, organizationAccess);
	const donationCertificateRead = new DonationCertificateReadService(db, organizationAccess);

	// Two levels of dependencies
	const programStats = new ProgramStatsService(db, exchangeRateRead);
	const campaignRead = new CampaignReadService(db, organizationAccess, exchangeRateRead);
	const programRead = new ProgramReadService(db, programAccessRead, programStats);
	const programWrite = new ProgramWriteService(db, programAccessWrite, candidateWrite);
	const payoutRead = new PayoutReadService(db, programAccessRead, exchangeRateRead, programStats);
	const payoutProcess = new PayoutProcessService(db, programAccessRead, programStats, exchangeRateRead);
	const donationCertificateWrite = new DonationCertificateWriteService(
		db,
		contributorRead,
		contributionRead,
		donationCertificateRead,
	);
	const bankTransfer = new BankTransferService(db, contributorWrite, campaignRead, contributionWrite);
	const stripe = new StripeService(db, contributorRead, contributorWrite, contributionWrite, campaignRead, programAccessRead);

	// Three levels of dependencies
	const surveyRead = new SurveyReadService(db, programAccessRead, recipientRead, surveySchedule);
	const surveyWrite = new SurveyWriteService(db, programAccessRead, firebaseAdmin, surveyRead);

	// PaymentFileImportService requires a runtime bucket name, so we expose a factory
	const createPaymentFileImport = (bucketName: string) =>
		new PaymentFileImportService(bucketName, db, contributorRead, contributionWrite, campaignRead);

	return {
		appReviewMode,
		firebaseAdmin,
		firebaseSession,
		programAccessRead,
		programAccessWrite,
		organizationAccess,
		userRead,
		userWrite,
		exchangeRateImport,
		exchangeRateRead,
		exchangeRateWrite,
		surveySchedule,
		transparency,
		storyblok,
		sendgrid,
		programStats,
		programRead,
		programWrite,
		payoutRead,
		payoutWrite,
		payoutProcess,
		twilio,
		contributionRead,
		contributionWrite,
		organizationRead,
		localPartnerRead,
		localPartnerWrite,
		mobileMoneyProviderRead,
		mobileMoneyProviderWrite,
		countryRead,
		countryWrite,
		expenseRead,
		expenseWrite,
		contributorRead,
		contributorWrite,
		campaignRead,
		campaignWrite,
		donationCertificateRead,
		donationCertificateWrite,
		surveyRead,
		surveyWrite,
		stripe,
		bankTransfer,
		candidateRead,
		candidateWrite,
		recipientRead,
		recipientWrite,
		createPaymentFileImport,
	};
}

let _services: ReturnType<typeof buildServices> | undefined;

export function getServices(): ReturnType<typeof buildServices> {
	if (!_services) {
		_services = buildServices(prisma);
	}
	return _services;
}
