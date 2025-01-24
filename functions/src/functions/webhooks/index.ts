import createDonationCertificatesFunction from './admin/donation-certificates';
import paymentForecastFunction from './admin/payment-forecast';
import paymentProcessFunction from './admin/payment-process';
import {
	addMissingAmountChfFunction,
	batchImportStripeChargesFunction,
	createAllSurveysFunction,
} from './admin/scripts';
import stripeWebhookFunction from './stripe';
import surveyLoginFunction from './website/survey-login';

export const webhookPaymentProcessTask = paymentProcessFunction;
export const webhookPaymentForecastTask = paymentForecastFunction;

export const webhookBatchImportStripeCharges = batchImportStripeChargesFunction;
export const webhookAddMissingAmountChf = addMissingAmountChfFunction;
export const webhookCreateAllSurveys = createAllSurveysFunction;

// Do not rename this function, it is used by the Stripe webhook.
export const webhookStripeCharge = stripeWebhookFunction;
export const webhookSurveyCredentials = surveyLoginFunction;

export const webhookCreateDonationCertificates = createDonationCertificatesFunction;
