import { prisma } from '../database/prisma';
import { AppReviewModeService } from './app-review-mode/app-review-mode.service';
import { CampaignPublicWebsiteService } from './campaign/campaign-public-website.service';
import { CampaignReadService } from './campaign/campaign-read.service';
import { CampaignValidationService } from './campaign/campaign-validation.service';
import { CampaignWriteService } from './campaign/campaign-write.service';
import { CandidateImportService } from './candidate/candidate-import.service';
import { CandidateReadService } from './candidate/candidate-read.service';
import { CandidateValidationService } from './candidate/candidate-validation.service';
import { CandidateWriteService } from './candidate/candidate-write.service';
import { ContactRelationsService } from './contact/contact-relations.service';
import { ContributionReadService } from './contribution/contribution-read.service';
import { ContributionValidationService } from './contribution/contribution-validation.service';
import { ContributionWriteService } from './contribution/contribution-write.service';
import { ContributorReadService } from './contributor/contributor-read.service';
import { ContributorValidationService } from './contributor/contributor-validation.service';
import { ContributorWriteService } from './contributor/contributor-write.service';
import { CountryReadService } from './country/country-read.service';
import { CountryValidationService } from './country/country-validation.service';
import { CountryWriteService } from './country/country-write.service';
import { CurrencyDisplayService } from './currency-display/currency-display.service';
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
import { FocusReadService } from './focus/focus-read.service';
import { FocusValidationService } from './focus/focus-validation.service';
import { FocusWriteService } from './focus/focus-write.service';
import { GithubApiService } from './github-api/github-api.service';
import { JournalService } from './journal/journal.service';
import { LocalPartnerReadService } from './local-partner/local-partner-read.service';
import { LocalPartnerValidationService } from './local-partner/local-partner-validation.service';
import { LocalPartnerWriteService } from './local-partner/local-partner-write.service';
import { MobileMoneyProviderReadService } from './mobile-money-provider/mobile-money-provider-read.service';
import { MobileMoneyProviderValidationService } from './mobile-money-provider/mobile-money-provider-validation.service';
import { MobileMoneyProviderWriteService } from './mobile-money-provider/mobile-money-provider-write.service';
import { OrganizationAccessService } from './organization-access/organization-access.service';
import { OrganizationReadService } from './organization/organization-read.service';
import { OrganizationValidationService } from './organization/organization-validation.service';
import { OrganizationWriteService } from './organization/organization-write.service';
import { PaymentFileImportService } from './payment-file-import/payment-file-import.service';
import { OrangeMoneyCsvPayoutProcessService } from './payout-process/orange-money-csv-payout-process.service';
import { PayoutProcessCoreService } from './payout-process/payout-process-core.service';
import { TelecelCsvPayoutProcessService } from './payout-process/telecel-csv-payout-process.service';
import { PayoutReadService } from './payout/payout-read.service';
import { PayoutValidationService } from './payout/payout-validation.service';
import { PayoutWriteService } from './payout/payout-write.service';
import { ProgramAccessReadService } from './program-access/program-access-read.service';
import { ProgramAccessWriteService } from './program-access/program-access-write.service';
import { ProgramStatsService } from './program-stats/program-stats.service';
import { ProgramReadService } from './program/program-read.service';
import { ProgramValidationService } from './program/program-validation.service';
import { ProgramWriteService } from './program/program-write.service';
import { QrBillService } from './qr-bill/qr-bill.service';
import { RecipientImportService } from './recipient/recipient-import.service';
import { RecipientReadService } from './recipient/recipient-read.service';
import { RecipientStatusService } from './recipient/recipient-status.service';
import { RecipientValidationService } from './recipient/recipient-validation.service';
import { RecipientWriteService } from './recipient/recipient-write.service';
import { SendgridSubscriptionService } from './sendgrid/sendgrid-subscription.service';
import { StoryblokService } from './storyblok/storyblok.service';
import { StripeService } from './stripe/stripe.service';
import { SurveyScheduleService } from './survey-schedule/survey-schedule.service';
import { SurveyImpactService } from './survey/survey-impact.service';
import { SurveyReadService } from './survey/survey-read.service';
import { SurveyValidationService } from './survey/survey-validation.service';
import { SurveyWriteService } from './survey/survey-write.service';
import { TransparencyService } from './transparency/transparency.service';
import { MessagingChannelPreviewService } from './twilio/messaging/dispatch/channel-preview.service';
import { MessagingDispatchService } from './twilio/messaging/dispatch/dispatch.service';
import { MessagingLogService } from './twilio/messaging/logs/log.service';
import { MessagingWebhookService } from './twilio/messaging/logs/webhook.service';
import { MessagingRecipientsService } from './twilio/messaging/recipients/recipients.service';
import { TwilioTemplateService } from './twilio/messaging/twilio-templates/twilio-template.service';
import { TwilioOtpService } from './twilio/otp/twilio-otp.service';
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
const githubApi = new GithubApiService(prisma);
const storyblok = new StoryblokService(prisma);
const journal = new JournalService(prisma, storyblok);
const sendgrid = new SendgridSubscriptionService();
const recipientStatus = new RecipientStatusService(prisma);

const exchangeRateRead = new ExchangeRateReadService(prisma, userRead);
const exchangeRateWrite = new ExchangeRateWriteService(prisma, userRead, exchangeRateImport);
const userWrite = new UserWriteService(prisma, firebaseAdmin, userRead, userValidation);
const candidateRead = new CandidateReadService(prisma, userRead);
const contactRelations = new ContactRelationsService(prisma);
const candidateValidation = new CandidateValidationService(prisma);
const candidateWrite = new CandidateWriteService(prisma, userRead, firebaseAdmin, candidateValidation, contactRelations);
const candidateImport = new CandidateImportService(candidateWrite, candidateValidation);
const recipientRead = new RecipientReadService(prisma, programAccessRead, firebaseAdmin, appReviewMode, recipientStatus);
const recipientValidation = new RecipientValidationService(prisma);
const recipientWrite = new RecipientWriteService(
	prisma,
	programAccessRead,
	firebaseAdmin,
	recipientValidation,
	contactRelations,
);
const recipientImport = new RecipientImportService(recipientWrite, recipientValidation);
const payoutValidation = new PayoutValidationService(prisma);
const payoutWrite = new PayoutWriteService(prisma, programAccessRead, payoutValidation);
const twilioOtp = new TwilioOtpService(prisma, firebaseAdmin, appReviewMode);
const messagingTwilioTemplates = new TwilioTemplateService(prisma);

const messagingChannelPreview = new MessagingChannelPreviewService(prisma, userRead);
const messagingWebhook = new MessagingWebhookService(prisma);
const messagingLog = new MessagingLogService(prisma, userRead, messagingWebhook);
const contributionRead = new ContributionReadService(prisma, programAccessRead);
const contributionValidation = new ContributionValidationService(prisma);
const contributionWrite = new ContributionWriteService(prisma, programAccessRead, contributionValidation);
const organizationRead = new OrganizationReadService(prisma, userRead, organizationAccess);
const organizationValidation = new OrganizationValidationService(prisma);
const organizationWrite = new OrganizationWriteService(prisma, userRead, organizationAccess, organizationValidation);
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
const mobileMoneyProviderWrite = new MobileMoneyProviderWriteService(prisma, userRead, mobileMoneyProviderValidation);
const countryRead = new CountryReadService(prisma, userRead);
const countryValidation = new CountryValidationService(prisma);
const countryWrite = new CountryWriteService(prisma, userRead, countryValidation);
const expenseRead = new ExpenseReadService(prisma, userRead);
const expenseValidation = new ExpenseValidationService(prisma);
const expenseWrite = new ExpenseWriteService(prisma, userRead, expenseValidation);
const contributorRead = new ContributorReadService(prisma, programAccessRead);
const contributorValidation = new ContributorValidationService(prisma);
const contributorWrite = new ContributorWriteService(
	prisma,
	programAccessRead,
	firebaseAdmin,
	sendgrid,
	contributorValidation,
	contactRelations,
);
const messagingRecipients = new MessagingRecipientsService(prisma, contributorRead, recipientRead, localPartnerRead);
const messagingDispatch = new MessagingDispatchService(prisma, userRead, messagingTwilioTemplates, messagingRecipients);
const campaignValidation = new CampaignValidationService(prisma);
const campaignWrite = new CampaignWriteService(prisma, programAccessRead, campaignValidation);
const focusValidation = new FocusValidationService(prisma);
const focusRead = new FocusReadService(prisma, userRead);
const focusWrite = new FocusWriteService(prisma, userRead, focusValidation);
const donationCertificateRead = new DonationCertificateReadService(prisma, programAccessRead);

const currencyDisplay = new CurrencyDisplayService(exchangeRateRead);
const programStats = new ProgramStatsService(prisma, currencyDisplay, recipientStatus);
const campaignRead = new CampaignReadService(prisma, programAccessRead, exchangeRateRead);
const campaignPublicWebsite = new CampaignPublicWebsiteService(prisma, storyblok, campaignRead);
const programRead = new ProgramReadService(prisma, programAccessRead, programStats);
const programValidation = new ProgramValidationService(prisma);
const programWrite = new ProgramWriteService(
	prisma,
	programAccessRead,
	programAccessWrite,
	candidateWrite,
	firebaseAdmin,
	organizationWrite,
	programValidation,
);
const payoutRead = new PayoutReadService(prisma, programAccessRead, exchangeRateRead, recipientStatus);
const payoutProcessCore = new PayoutProcessCoreService(
	prisma,
	programAccessRead,
	programStats,
	exchangeRateRead,
	recipientStatus,
);
const orangeMoneyCsvPayoutProcess = new OrangeMoneyCsvPayoutProcessService(prisma, payoutProcessCore);
const telecelCsvPayoutProcess = new TelecelCsvPayoutProcessService(prisma, payoutProcessCore);
const donationCertificateWrite = new DonationCertificateWriteService(
	prisma,
	contributorRead,
	contributionRead,
	donationCertificateRead,
);
const qrBill = new QrBillService(
	prisma,
	contributorWrite,
	contributorRead,
	campaignRead,
	contributionWrite,
	exchangeRateRead,
);
const stripe = new StripeService(
	prisma,
	contributorRead,
	contributorWrite,
	contributionWrite,
	campaignRead,
	programAccessRead,
);
const surveyRead = new SurveyReadService(prisma, programAccessRead, recipientRead, surveySchedule);
const surveyImpact = new SurveyImpactService(prisma);
const surveyValidation = new SurveyValidationService(prisma);
const surveyWrite = new SurveyWriteService(prisma, programAccessRead, firebaseAdmin, surveyRead, surveyValidation);

const createPaymentFileImport = (bucketName: string) =>
	new PaymentFileImportService(bucketName, prisma, contributorRead, contributionWrite, campaignRead);

export const services = {
	read: {
		candidate: candidateRead,
		campaign: campaignRead,
		campaignPublicWebsite,
		focus: focusRead,
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
		focus: focusWrite,
		contribution: contributionWrite,
		contributor: contributorWrite,
		country: countryWrite,
		donationCertificate: donationCertificateWrite,
		exchangeRate: exchangeRateWrite,
		expense: expenseWrite,
		localPartner: localPartnerWrite,
		mobileMoneyProvider: mobileMoneyProviderWrite,
		organization: organizationWrite,
		payout: payoutWrite,
		program: programWrite,
		recipient: recipientWrite,
		survey: surveyWrite,
		user: userWrite,
	},
	appReviewMode,
	qrBill,
	createPaymentFileImport,
	exchangeRateImport,
	candidateImport,
	firebaseAdmin,
	firebaseSession,
	payoutProcessCore,
	orangeMoneyCsvPayoutProcess,
	telecelCsvPayoutProcess,
	currencyDisplay,
	programStats,
	recipientImport,
	sendgrid,
	journal,
	storyblok,
	stripe,
	surveyImpact,
	transparency,
	githubApi,
	twilioOtp,
	messagingTwilioTemplates,
	messagingDispatch,
	messagingChannelPreview,
	messagingWebhook,
	messagingRecipients,
	messagingLog,
};
