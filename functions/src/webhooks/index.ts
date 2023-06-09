import { DonationCertificateHandler } from './admin/donation-certificates/DonationCertificateHandler';
import { PaymentTaskProcessor } from './admin/payment-process/PaymentTaskProcessor';
import { BatchAddCHFToPayments } from './admin/scripts/BatchAddCHFToPayments';
import { BatchImportStripeCharges } from './admin/scripts/BatchImportStripeCharges';
import { SurveyManager } from './admin/scripts/SurveyManager';
import { StripeWebhook } from './stripe/StripeWebhook';
import { TwilioIncomingMessageHandler } from './twilio/TwilioIncomingMessageHandler';
import { TwilioOutgoingMessageHandler } from './twilio/TwilioOutgoingMessageHandler';
import { SurveyLogin } from './website/SurveyLogin';

export const createDonationCertificates = new DonationCertificateHandler().getFunction();
export const runAdminPaymentProcessTask = new PaymentTaskProcessor().getFunction();
export const batchImportStripeCharges = new BatchImportStripeCharges().getFunction();
export const addMissingAmountChf = new BatchAddCHFToPayments().getFunction();
export const createAllSurveys = new SurveyManager().getFunction();

export const stripeChargeHook = new StripeWebhook().getFunction();
export const twilioIncomingMessage = new TwilioIncomingMessageHandler().getFunction();

export const twilioOutgoingMessage = new TwilioOutgoingMessageHandler().getFunction();
export const getSurveyCredentials = new SurveyLogin().getFunction();
