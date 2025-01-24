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

export const createDonationCertificates = createDonationCertificatesFunction;
export const runPaymentProcessTask = paymentProcessFunction;
export const runPaymentForecastTask = paymentForecastFunction;

export const batchImportStripeCharges = batchImportStripeChargesFunction;
export const addMissingAmountChf = addMissingAmountChfFunction;
export const createAllSurveys = createAllSurveysFunction;

export const stripeChargeHook = stripeWebhookFunction;

export const getSurveyCredentials = surveyLoginFunction;
