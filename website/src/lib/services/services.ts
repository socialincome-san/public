import { ensurePawaPayWallets, getBankAccounts } from '@/modules/bank-accounts/bank-account.service';
import type { BankAccountReadService, BankAccountWriteService } from '@/modules/bank-accounts/bank-account.types';
import { getCampaignById, getDefaultCampaignForProgram, getFallbackCampaign } from '@/modules/campaigns/campaign.service';
import type { CampaignReadService } from '@/modules/campaigns/campaign.types';
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
import { isReadyForFirstPayoutInterval } from '@/modules/programs/program-stats.service';
import { recipientService, recipientStatusService } from '@/modules/recipients/recipient.service';
import {
	applyCustomerDefaultPaymentMethodToOwnedSubscription,
	cancelContributorSubscription,
	createEmbeddedCheckoutSession,
	createManageSubscriptionsSession,
	createPortalProgramDonationCheckout,
	getCheckoutOnboardingPrefill,
	getPaginatedSubscriptionsTableView,
	getSubscriptionsTableView,
	getSubscriptionStripeDetails,
	handleWebhookEvent,
	updateContributorAfterCheckout,
	updateContributorReferralAfterCheckout,
	updateContributorSubscriptionAmount,
} from '@/modules/stripe-payments/stripe-payment.service';
import { isAdmin } from '@/modules/users/user.service';
import type { UserReadService } from '@/modules/users/user.types';
import { prisma } from '../database/prisma';
import { AppReviewModeService } from './app-review-mode/app-review-mode.service';
import { CurrencyDisplayService } from './currency-display/currency-display.service';
import { CustodianStablecoinWalletService } from './custodian-stablecoin-wallet/custodian-stablecoin-wallet.service';
import { DonationCertificateReadService } from './donation-certificate/donation-certificate-read.service';
import { DonationCertificateWriteService } from './donation-certificate/donation-certificate-write.service';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { FirebaseSessionService } from './firebase/firebase-session.service';
import { JournalService } from './journal/journal.service';
import { MonthlySummaryService } from './monthly-summary/monthly-summary.service';
import { PawaPayBalanceService } from './pawapay/pawapay-balance.service';
import { PaymentFileImportService } from './payment-file-import/payment-file-import.service';
import { PostFinanceBalanceService } from './payment-file-import/postfinance-balance.service';
import { OrangeMoneyCsvPayoutProcessService } from './payout-process/orange-money-csv-payout-process.service';
import { PayoutProcessCoreService } from './payout-process/payout-process-core.service';
import { TelecelCsvPayoutProcessService } from './payout-process/telecel-csv-payout-process.service';
import { QrBillService } from './qr-bill/qr-bill.service';
import { ReserveReadService } from './reserves/reserve-read.service';
import { ReserveWriteService } from './reserves/reserve-write.service';
import { ReservesCalculationService } from './reserves/reserves-calculation.service';
import { StoryblokService } from './storyblok/storyblok.service';
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
const storyblok = new StoryblokService(prisma);
const journal = new JournalService(prisma, storyblok);
const recipientStatus = recipientStatusService;
const monthlySummary = new MonthlySummaryService(prisma, recipientStatus);

const recipientRead = recipientService;
const recipientWrite = recipientService;
const recipientImport = recipientService;
const twilioOtp = new TwilioOtpService(prisma, firebaseAdmin, appReviewMode);
const messagingTwilioTemplates = new TwilioTemplateService(prisma);

const messagingWebhook = new MessagingWebhookService(prisma);
const messagingLog = new MessagingLogService(prisma, userRead, messagingWebhook);
const localPartnerRead: LocalPartnerReadService = {
	getPaginatedTableView: getPaginatedLocalPartnerTableView,
	getMessagingTargets: getLocalPartnerMessagingTargets,
};
const messagingRecipients = new MessagingRecipientsService(prisma, recipientRead, localPartnerRead);
const messagingDispatch = new MessagingDispatchService(prisma, userRead, messagingTwilioTemplates, messagingRecipients);
const messagingChannelPreview = new MessagingChannelPreviewService(prisma, userRead, messagingRecipients);
const donationCertificateRead = new DonationCertificateReadService(prisma, programAccessRead);

const currencyDisplay = new CurrencyDisplayService(exchangeRateRead);
const reserveWrite = new ReserveWriteService(prisma);
const programStats = {
	isReadyForFirstPayoutInterval,
};
const campaignRead: CampaignReadService = {
	getById: getCampaignById,
	getFallbackCampaign,
	getDefaultCampaignForProgram,
};
const payoutProcessCore = new PayoutProcessCoreService(
	prisma,
	programAccessRead,
	programStats,
	exchangeRateRead,
	recipientStatus,
);
const orangeMoneyCsvPayoutProcess = new OrangeMoneyCsvPayoutProcessService(prisma, payoutProcessCore);
const telecelCsvPayoutProcess = new TelecelCsvPayoutProcessService(prisma, payoutProcessCore);
const donationCertificateWrite = new DonationCertificateWriteService(prisma, donationCertificateRead);
const qrBill = new QrBillService(prisma, campaignRead, exchangeRateRead);
const stripe = {
	createPortalProgramDonationCheckout,
	createEmbeddedCheckoutSession,
	getCheckoutOnboardingPrefill,
	updateContributorAfterCheckout,
	updateContributorReferralAfterCheckout,
	getSubscriptionsTableView,
	getPaginatedSubscriptionsTableView,
	createManageSubscriptionsSession,
	applyCustomerDefaultPaymentMethodToOwnedSubscription,
	updateContributorSubscriptionAmount,
	cancelContributorSubscription,
	handleWebhookEvent,
	getSubscriptionStripeDetails,
};
const surveyRead = new SurveyReadService(prisma, programAccessRead, recipientRead, surveySchedule);
const surveyImpact = new SurveyImpactService(prisma);
const surveyValidation = new SurveyValidationService(prisma);
const surveyWrite = new SurveyWriteService(prisma, programAccessRead, firebaseAdmin, surveyRead, surveyValidation);

const createPaymentFileImport = (bucketName: string) => new PaymentFileImportService(bucketName, prisma, campaignRead);
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
		donationCertificate: donationCertificateRead,
		recipient: recipientRead,
		survey: surveyRead,
	},
	write: {
		donationCertificate: donationCertificateWrite,
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
	monthlySummary,
	journal,
	storyblok,
	stripe,
	surveyImpact,
	transparency,
	twilioOtp,
	messagingTwilioTemplates,
	messagingDispatch,
	messagingChannelPreview,
	messagingWebhook,
	messagingRecipients,
	messagingLog,
};
