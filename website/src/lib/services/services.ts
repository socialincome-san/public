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
import { ContactRelationsService } from './contact/contact-relations.service';
import { CountryReadService } from './country/country-read.service';
import { CountryValidationService } from './country/country-validation.service';
import { CountryWriteService } from './country/country-write.service';
import { DonationCertificateReadService } from './donation-certificate/donation-certificate-read.service';
import { DonationCertificateWriteService } from './donation-certificate/donation-certificate-write.service';
import { ExchangeRateImportService } from './exchange-rate/exchange-rate-import.service';
import { ExchangeRateReadService } from './exchange-rate/exchange-rate-read.service';
import { ExchangeRateWriteService } from './exchange-rate/exchange-rate-write.service';
import { ExpenseReadService } from './expense/expense-read.service';
import { ExpenseValidationService } from './expense/expense-validation.service';
import { ExpenseWriteService } from './expense/expense-write.service';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { FirebaseSessionService } from './firebase/firebase-session.service';
import { LocalPartnerReadService } from './local-partner/local-partner-read.service';
import { LocalPartnerValidationService } from './local-partner/local-partner-validation.service';
import { LocalPartnerWriteService } from './local-partner/local-partner-write.service';
import { MobileMoneyProviderReadService } from './mobile-money-provider/mobile-money-provider-read.service';
import { MobileMoneyProviderValidationService } from './mobile-money-provider/mobile-money-provider-validation.service';
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
import { UserValidationService } from './user/user-validation.service';
import { UserWriteService } from './user/user-write.service';

const appReviewMode = new AppReviewModeService(prisma);
const firebaseAdmin = new FirebaseAdminService(prisma);
const firebaseSession = new FirebaseSessionService(prisma);
const programAccessRead = new ProgramAccessReadService(prisma);
const programAccessWrite = new ProgramAccessWriteService(prisma);
const organizationAccess = new OrganizationAccessService(prisma);
const userRead = new UserReadService(prisma);
const userValidation = new UserValidationService(prisma);
const exchangeRateImport = new ExchangeRateImportService(prisma);
const surveySchedule = new SurveyScheduleService(prisma);
const transparency = new TransparencyService(prisma);
const storyblok = new StoryblokService(prisma);
const sendgrid = new SendgridSubscriptionService();

const exchangeRateRead = new ExchangeRateReadService(prisma, userRead);
const exchangeRateWrite = new ExchangeRateWriteService(prisma, userRead, exchangeRateImport);
const userWrite = new UserWriteService(prisma, firebaseAdmin, userRead, userValidation);
const candidateRead = new CandidateReadService(prisma, userRead);
const candidateWrite = new CandidateWriteService(prisma, userRead, firebaseAdmin);
const recipientRead = new RecipientReadService(prisma, programAccessRead, firebaseAdmin, appReviewMode);
const recipientWrite = new RecipientWriteService(prisma, programAccessRead, firebaseAdmin);
const payoutWrite = new PayoutWriteService(prisma, programAccessRead);
const twilio = new TwilioService(prisma, firebaseAdmin, appReviewMode);
const contributionRead = new ContributionReadService(prisma, organizationAccess);
const contributionWrite = new ContributionWriteService(prisma, organizationAccess);
const contactRelations = new ContactRelationsService(prisma);
const organizationRead = new OrganizationReadService(prisma, userRead, organizationAccess);
const localPartnerRead = new LocalPartnerReadService(prisma, userRead);
const localPartnerValidation = new LocalPartnerValidationService(prisma);
const localPartnerWrite = new LocalPartnerWriteService(
	prisma,
	userRead,
	firebaseAdmin,
	localPartnerValidation,
	contactRelations,
);
const mobileMoneyProviderRead = new MobileMoneyProviderReadService(prisma, userRead);
const mobileMoneyProviderValidation = new MobileMoneyProviderValidationService(prisma);
const mobileMoneyProviderWrite = new MobileMoneyProviderWriteService(
	prisma,
	userRead,
	mobileMoneyProviderValidation,
);
const countryRead = new CountryReadService(prisma, userRead);
const countryValidation = new CountryValidationService(prisma);
const countryWrite = new CountryWriteService(prisma, userRead, countryValidation);
const expenseRead = new ExpenseReadService(prisma, userRead);
const expenseValidation = new ExpenseValidationService(prisma);
const expenseWrite = new ExpenseWriteService(prisma, userRead, expenseValidation);
const contributorRead = new ContributorReadService(prisma, organizationAccess);
const contributorWrite = new ContributorWriteService(prisma, organizationAccess, firebaseAdmin, sendgrid);
const campaignWrite = new CampaignWriteService(prisma, organizationAccess);
const donationCertificateRead = new DonationCertificateReadService(prisma, organizationAccess);

const programStats = new ProgramStatsService(prisma, exchangeRateRead);
const campaignRead = new CampaignReadService(prisma, organizationAccess, exchangeRateRead);
const programRead = new ProgramReadService(prisma, programAccessRead, programStats);
const programWrite = new ProgramWriteService(prisma, programAccessWrite, candidateWrite);
const payoutRead = new PayoutReadService(prisma, programAccessRead, exchangeRateRead, programStats);
const payoutProcess = new PayoutProcessService(prisma, programAccessRead, programStats, exchangeRateRead);
const donationCertificateWrite = new DonationCertificateWriteService(
	prisma,
	contributorRead,
	contributionRead,
	donationCertificateRead,
);
const bankTransfer = new BankTransferService(prisma, contributorWrite, campaignRead, contributionWrite);
const stripe = new StripeService(
	prisma,
	contributorRead,
	contributorWrite,
	contributionWrite,
	campaignRead,
	programAccessRead,
);
const surveyRead = new SurveyReadService(prisma, programAccessRead, recipientRead, surveySchedule);
const surveyWrite = new SurveyWriteService(prisma, programAccessRead, firebaseAdmin, surveyRead);

const createPaymentFileImport = (bucketName: string) =>
	new PaymentFileImportService(bucketName, prisma, contributorRead, contributionWrite, campaignRead);

export const services = {
	read: {
		candidate: candidateRead,
		campaign: campaignRead,
		contribution: contributionRead,
		contributor: contributorRead,
		country: countryRead,
		donationCertificate: donationCertificateRead,
		exchangeRate: exchangeRateRead,
		expense: expenseRead,
		localPartner: localPartnerRead,
		mobileMoneyProvider: mobileMoneyProviderRead,
		organization: organizationRead,
		payout: payoutRead,
		program: programRead,
		recipient: recipientRead,
		survey: surveyRead,
		user: userRead,
	},
	write: {
		candidate: candidateWrite,
		campaign: campaignWrite,
		contribution: contributionWrite,
		contributor: contributorWrite,
		country: countryWrite,
		donationCertificate: donationCertificateWrite,
		exchangeRate: exchangeRateWrite,
		expense: expenseWrite,
		localPartner: localPartnerWrite,
		mobileMoneyProvider: mobileMoneyProviderWrite,
		payout: payoutWrite,
		program: programWrite,
		recipient: recipientWrite,
		survey: surveyWrite,
		user: userWrite,
	},
	appReviewMode,
	bankTransfer,
	createPaymentFileImport,
	exchangeRateImport,
	firebaseAdmin,
	firebaseSession,
	payoutProcess,
	programStats,
	sendgrid,
	storyblok,
	stripe,
	transparency,
	twilio,
};
