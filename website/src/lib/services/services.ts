import { prisma } from '../database/prisma';
import { AppReviewModeService } from './app-review-mode/app-review-mode.service';
import { BankTransferService } from './bank-transfer/bank-transfer.service';
import { CampaignService } from './campaign/campaign.service';
import { CandidateService } from './candidate/candidate.service';
import { ContributionService } from './contribution/contribution.service';
import { ContributorService } from './contributor/contributor.service';
import { CountryService } from './country/country.service';
import { DonationCertificateService } from './donation-certificate/donation-certificate.service';
import { ExchangeRateImportService } from './exchange-rate/exchange-rate-import.service';
import { ExchangeRateService } from './exchange-rate/exchange-rate.service';
import { ExpenseService } from './expense/expense.service';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { FirebaseSessionService } from './firebase/firebase-session.service';
import { LocalPartnerService } from './local-partner/local-partner.service';
import { OrganizationAccessService } from './organization-access/organization-access.service';
import { OrganizationService } from './organization/organization.service';
import { PaymentFileImportService } from './payment-file-import/payment-file-import.service';
import { PayoutProcessService } from './payout-process/payout-process.service';
import { PayoutService } from './payout/payout.service';
import { ProgramAccessService } from './program-access/program-access.service';
import { ProgramStatsService } from './program-stats/program-stats.service';
import { ProgramService } from './program/program.service';
import { RecipientService } from './recipient/recipient.service';
import { SendgridSubscriptionService } from './sendgrid/sendgrid-subscription.service';
import { StoryblokService } from './storyblok/storyblok.service';
import { StripeService } from './stripe/stripe.service';
import { SurveyScheduleService } from './survey-schedule/survey-schedule.service';
import { SurveyService } from './survey/survey.service';
import { TransparencyService } from './transparency/transparency.service';
import { TwilioService } from './twilio/twilio.service';
import { UserService } from './user/user.service';

const appReviewMode = new AppReviewModeService(prisma);
const organizationAccess = new OrganizationAccessService(prisma);
const programAccess = new ProgramAccessService(prisma);
const surveySchedule = new SurveyScheduleService(prisma);
const storyblok = new StoryblokService(prisma);
const transparency = new TransparencyService(prisma);
const firebaseAdmin = new FirebaseAdminService(prisma);
const firebaseSession = new FirebaseSessionService(prisma);
const programStats = new ProgramStatsService(prisma);
const exchangeRateImport = new ExchangeRateImportService(prisma);
const sendgrid = new SendgridSubscriptionService();

const user = new UserService(prisma, firebaseAdmin);
const contribution = new ContributionService(prisma, organizationAccess);

const candidate = new CandidateService(prisma, user, firebaseAdmin);
const localPartner = new LocalPartnerService(prisma, user, firebaseAdmin);
const country = new CountryService(prisma, user);
const exchangeRate = new ExchangeRateService(prisma, user, exchangeRateImport);
const expense = new ExpenseService(prisma, user);
const organization = new OrganizationService(prisma, user, organizationAccess);
const contributor = new ContributorService(prisma, organizationAccess, firebaseAdmin, sendgrid);

const donationCertificate = new DonationCertificateService(prisma, organizationAccess, contributor, contribution);
const campaign = new CampaignService(prisma, organizationAccess, exchangeRate);
const recipient = new RecipientService(prisma, programAccess, firebaseAdmin, appReviewMode);
const program = new ProgramService(prisma, programAccess, candidate);
const payout = new PayoutService(prisma, programAccess, exchangeRate);
const twilio = new TwilioService(prisma, firebaseAdmin, appReviewMode);
const stripe = new StripeService(prisma, contributor, contribution, campaign, programAccess);

const payoutProcess = new PayoutProcessService(prisma, programAccess, program, exchangeRate);
const bankTransfer = new BankTransferService(prisma, contributor, campaign, contribution);
const paymentFileImport = new PaymentFileImportService(
	prisma,
	contributor,
	contribution,
	campaign,
	process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET ?? '',
);
const survey = new SurveyService(prisma, programAccess, recipient, surveySchedule, firebaseAdmin);

export const services = {
	appReviewMode,
	organizationAccess,
	programAccess,
	surveySchedule,
	storyblok,
	transparency,
	firebaseAdmin,
	firebaseSession,
	programStats,
	exchangeRateImport,
	sendgrid,
	user,
	contribution,
	candidate,
	localPartner,
	country,
	exchangeRate,
	expense,
	organization,
	contributor,
	donationCertificate,
	campaign,
	recipient,
	program,
	payout,
	twilio,
	stripe,
	payoutProcess,
	bankTransfer,
	paymentFileImport,
	survey,
};
