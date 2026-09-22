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
import { prisma } from '../database/prisma';
import { FirebaseAdminService } from './firebase/firebase-admin.service';
import { FirebaseSessionService } from './firebase/firebase-session.service';
import { JournalService } from './journal/journal.service';
import { MonthlySummaryService } from './monthly-summary/monthly-summary.service';
import { StoryblokService } from './storyblok/storyblok.service';
import { TransparencyService } from './transparency/transparency.service';

const firebaseAdmin = new FirebaseAdminService(prisma);
const firebaseSession = new FirebaseSessionService(prisma);
const transparency = new TransparencyService(prisma);
const storyblok = new StoryblokService(prisma);
const journal = new JournalService(prisma, storyblok);
const recipientStatus = recipientStatusService;
const monthlySummary = new MonthlySummaryService(prisma, recipientStatus);

const recipientRead = recipientService;
const recipientWrite = recipientService;
const recipientImport = recipientService;

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
export const services = {
	read: {
		recipient: recipientRead,
	},
	write: {
		recipient: recipientWrite,
	},
	firebaseAdmin,
	firebaseSession,
	recipientImport,
	monthlySummary,
	journal,
	storyblok,
	stripe,
	transparency,
};
