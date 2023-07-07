import createDonationCertificatesFunction from './admin/donation-certificates';
import paymentProcessFunction from './admin/payment-process';
import {
	addMissingAmountChfFunction,
	batchImportStripeChargesFunction,
	createAllSurveysFunction,
} from './admin/scripts';
import stripeWebhookFunction from './stripe';
import surveyLoginFunction from './website/survey-login';
//
export const createDonationCertificates = createDonationCertificatesFunction;
export const runPaymentProcessTask = paymentProcessFunction;

export const batchImportStripeCharges = batchImportStripeChargesFunction;
export const addMissingAmountChf = addMissingAmountChfFunction;
export const createAllSurveys = createAllSurveysFunction;

export const stripeChargeHook = stripeWebhookFunction;

// export const twilioIncomingMessage = new TwilioIncomingMessageHandler().getFunction();
// export const twilioOutgoingMessage = new TwilioOutgoingMessageHandler().getFunction();
export const getSurveyCredentials = surveyLoginFunction;
