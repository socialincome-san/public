import { ensurePawaPayWallets, getBankAccounts } from '@/modules/bank-accounts/bank-account.service';
import type { BankAccountReadService, BankAccountWriteService } from '@/modules/bank-accounts/bank-account.types';
import { getLatestRateForCurrency, getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import type { ExchangeRateReadService } from '@/modules/exchange-rates/exchange-rate.types';
import {
	getLocalPartnerMessagingTargets,
	getPaginatedLocalPartnerTableView,
} from '@/modules/local-partners/local-partner.service';
import type { LocalPartnerReadService } from '@/modules/local-partners/local-partner.types';
import { hasAnyOperatorAccess, hasOperatorAccess } from '@/modules/program-access/program-access.permissions';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import type { ProgramAccessReadService } from '@/modules/program-access/program-access.types';
import {
	getEligibleProgramsForPublicSubmission,
	isProgramEligibleForPublicSubmission,
} from '@/modules/programs/program-public-submission.service';
import { isReadyForFirstPayoutInterval } from '@/modules/programs/program-stats.service';
import { recipientService, recipientStatusService } from '@/modules/recipients/recipient.service';
import { isAdmin } from '@/modules/users/user.service';
import type { UserReadService } from '@/modules/users/user.types';
import { prisma } from '../database/prisma';
import { AppReviewModeService } from './app-review-mode/app-review-mode.service';
import { CampaignPendingClaimService } from './campaign/campaign-pending-claim.service';
import { CampaignPublicWebsiteService } from './campaign/campaign-public-website.service';
import { CampaignReadService } from './campaign/campaign-read.service';
import { CampaignSubmissionService } from './campaign/campaign-submission.service';
import { CampaignValidationService } from './campaign/campaign-validation.service';
import { ContactRelationsService } from './contact/contact-relations.service';
import { ContributionReadService } from './contribution/contribution-read.service';
import { ContributionValidationService } from './contribution/contribution-validation.service';
import { ContributionWriteService } from './contribution/contribution-write.service';
import { ContributorReadService } from './contributor/contributor-read.service';
import { ContributorValidationService } from './contributor/contributor-validation.service';
import { ContributorWriteService } from './contributor/contributor-write.service';
import { CurrencyDisplayService } from './currency-display/currency-display.service';
import { CustodianStablecoinWalletService } from './custodian-stablecoin-wallet/custodian-stablecoin-wallet.service';
import { DonationCertificateReadService } from './donation-certificate/donation-certificate-read.service';
import { DonationCertificateWriteService } from './donation-certificate/donation-certificate-write.service';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { FirebaseSessionService } from './firebase/firebase-session.service';
import { GithubApiService } from './github-api/github-api.service';
import { JournalService } from './journal/journal.service';
import { MonthlySummaryService } from './monthly-summary/monthly-summary.service';
import { PawaPayBalanceService } from './pawapay/pawapay-balance.service';
import { PaymentFileImportService } from './payment-file-import/payment-file-import.service';
import { PostFinanceBalanceService } from './payment-file-import/postfinance-balance.service';
import { OrangeMoneyCsvPayoutProcessService } from './payout-process/orange-money-csv-payout-process.service';
import { PayoutProcessCoreService } from './payout-process/payout-process-core.service';
import { TelecelCsvPayoutProcessService } from './payout-process/telecel-csv-payout-process.service';
import { PayoutReadService } from './payout/payout-read.service';
import { PayoutValidationService } from './payout/payout-validation.service';
import { PayoutWriteService } from './payout/payout-write.service';
import { QrBillService } from './qr-bill/qr-bill.service';
import { ReserveReadService } from './reserves/reserve-read.service';
import { ReserveWriteService } from './reserves/reserve-write.service';
import { ReservesCalculationService } from './reserves/reserves-calculation.service';
import { SendgridMailService } from './sendgrid/sendgrid-mail.service';
import { SendgridSubscriptionService } from './sendgrid/sendgrid-subscription.service';
import { StoryblokManagementService } from './storyblok/storyblok-management.service';
import { StoryblokService } from './storyblok/storyblok.service';
import { StripeService } from './stripe/stripe.service';
import { SubscriptionReadService } from './subscription/subscription-read.service';
import { SubscriptionWriteService } from './subscription/subscription-write.service';
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

const appReviewMode = new AppReviewModeService(prisma);
const bankAccountRead: BankAccountReadService = {
	getAll: getBankAccounts,
};
const bankAccountWrite: BankAccountWriteService = {
	ensurePawaPayWallets,
};
const reserveRead = new ReserveReadService(prisma);
const firebaseAdmin = new FirebaseAdminService(prisma);
const firebaseSession = new FirebaseSessionService(prisma);
const programAccessRead: ProgramAccessReadService = {
	getAccessiblePrograms,
	hasAnyOperatorAccess,
	hasOperatorAccess,
};
const userRead: UserReadService = { isAdmin };
const exchangeRateRead: ExchangeRateReadService = {
	getLatestRateForCurrency,
	getLatestRates,
};
const surveySchedule = new SurveyScheduleService(prisma);
const transparency = new TransparencyService(prisma, reserveRead);
const githubApi = new GithubApiService(prisma);
const storyblok = new StoryblokService(prisma);
const journal = new JournalService(prisma, storyblok);
const sendgrid = new SendgridSubscriptionService();
const sendgridMail = new SendgridMailService(prisma);
const recipientStatus = recipientStatusService;
const monthlySummary = new MonthlySummaryService(prisma, recipientStatus);

const contactRelations = new ContactRelationsService(prisma);
const recipientRead = recipientService;
const recipientWrite = recipientService;
const recipientImport = recipientService;
const payoutValidation = new PayoutValidationService(prisma);
const payoutWrite = new PayoutWriteService(prisma, programAccessRead, payoutValidation);
const twilioOtp = new TwilioOtpService(prisma, firebaseAdmin, appReviewMode);
const messagingTwilioTemplates = new TwilioTemplateService(prisma);

const messagingWebhook = new MessagingWebhookService(prisma);
const messagingLog = new MessagingLogService(prisma, userRead, messagingWebhook);
const contributionRead = new ContributionReadService(prisma, programAccessRead, storyblok);
const contributionValidation = new ContributionValidationService(prisma);
const contributionWrite = new ContributionWriteService(prisma, programAccessRead, contributionValidation);
const subscriptionWrite = new SubscriptionWriteService(prisma);
const localPartnerRead: LocalPartnerReadService = {
	getPaginatedTableView: getPaginatedLocalPartnerTableView,
	getMessagingTargets: getLocalPartnerMessagingTargets,
};
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
const messagingChannelPreview = new MessagingChannelPreviewService(prisma, userRead, messagingRecipients);
const campaignValidation = new CampaignValidationService(prisma);
const programPublicSubmission = {
	getEligibleProgramsForPublicSubmission,
	isProgramEligibleForPublicSubmission,
};
const storyblokManagement = new StoryblokManagementService();
const campaignSubmission = new CampaignSubmissionService(
	prisma,
	programPublicSubmission,
	campaignValidation,
	storyblokManagement,
);
const campaignPendingClaim = new CampaignPendingClaimService(prisma);
const donationCertificateRead = new DonationCertificateReadService(prisma, programAccessRead);

const currencyDisplay = new CurrencyDisplayService(exchangeRateRead);
const reserveWrite = new ReserveWriteService(prisma);
const programStats = {
	isReadyForFirstPayoutInterval,
};
const campaignRead = new CampaignReadService(prisma, programAccessRead, exchangeRateRead);
const campaignPublicWebsite = new CampaignPublicWebsiteService(prisma, storyblok);
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
	subscriptionWrite,
	exchangeRateRead,
);
const stripe = new StripeService(
	prisma,
	contributorRead,
	contributorWrite,
	contributionWrite,
	subscriptionWrite,
	campaignRead,
	programAccessRead,
);
const subscriptionRead = new SubscriptionReadService(prisma, programAccessRead, contributionRead, stripe);
const surveyRead = new SurveyReadService(prisma, programAccessRead, recipientRead, surveySchedule);
const surveyImpact = new SurveyImpactService(prisma);
const surveyValidation = new SurveyValidationService(prisma);
const surveyWrite = new SurveyWriteService(prisma, programAccessRead, firebaseAdmin, surveyRead, surveyValidation);

const createPaymentFileImport = (bucketName: string) =>
	new PaymentFileImportService(bucketName, prisma, contributorRead, contributionWrite, campaignRead);
const createPostFinanceBalance = (bucketName: string) => new PostFinanceBalanceService(bucketName, prisma);
const createReservesCalculation = (bucketName: string) =>
	new ReservesCalculationService(
		prisma,
		bankAccountRead,
		bankAccountWrite,
		createPostFinanceBalance(bucketName),
		new PawaPayBalanceService(prisma),
		new CustodianStablecoinWalletService(prisma),
		reserveWrite,
		currencyDisplay,
	);

export const services = {
	read: {
		campaign: campaignRead,
		campaignPublicWebsite,
		contribution: contributionRead,
		contributor: contributorRead,
		donationCertificate: donationCertificateRead,
		payout: payoutRead,
		recipient: recipientRead,
		subscription: subscriptionRead,
		survey: surveyRead,
	},
	write: {
		contribution: contributionWrite,
		subscription: subscriptionWrite,
		contributor: contributorWrite,
		donationCertificate: donationCertificateWrite,
		payout: payoutWrite,
		recipient: recipientWrite,
		survey: surveyWrite,
	},
	appReviewMode,
	qrBill,
	createPaymentFileImport,
	createReservesCalculation,
	firebaseAdmin,
	firebaseSession,
	payoutProcessCore,
	orangeMoneyCsvPayoutProcess,
	telecelCsvPayoutProcess,
	currencyDisplay,
	recipientImport,
	sendgrid,
	sendgridMail,
	monthlySummary,
	journal,
	storyblok,
	storyblokManagement,
	campaignSubmission,
	campaignPendingClaim,
	programPublicSubmission,
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
