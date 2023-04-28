import { getOrInitializeApp } from '../../shared/src/firebase/app';
import { AuthAdmin } from '../../shared/src/firebase/AuthAdmin';
import { FirestoreAdmin } from '../../shared/src/firebase/FirestoreAdmin';
import { StorageAdmin } from '../../shared/src/firebase/StorageAdmin';
import { AdminPaymentTaskProcessor } from './admin/AdminPaymentTaskProcessor';
import { DonationCertificateHandler } from './admin/DonationCertificateHandler';
import { SurveyManager } from './admin/SurveyManager';
import { ExchangeRateImporter } from './etl/ExchangeRateImporter';
import { FirestoreAuditor } from './etl/FirestoreAuditor';
import { PostfinanceImporter } from './etl/PostfinanceImporter';
import { StripeWebhook } from './etl/StripeWebhook';
import { SurveyLogin } from './website/SurveyLogin';

const app = getOrInitializeApp();
const firestoreAdmin = new FirestoreAdmin(app);
const storageAdmin = new StorageAdmin(app);
const authAdmin = new AuthAdmin(app);

const stripeWebhook = new StripeWebhook(firestoreAdmin);
export const batchImportStripeCharges = stripeWebhook.batchImportStripeCharges;
export const stripeChargeHook = stripeWebhook.stripeChargeHookFunction;

const postfinanceImporter = new PostfinanceImporter(firestoreAdmin);
export const importBalanceMail = postfinanceImporter.importBalanceMail;

const exchangeRateImporter = new ExchangeRateImporter(firestoreAdmin);
export const importExchangeRates = exchangeRateImporter.importExchangeRates;

const donationCertificateHandler = new DonationCertificateHandler(firestoreAdmin, storageAdmin);
export const createDonationCertificates = donationCertificateHandler.createDonationCertificates;

const adminPaymentTaskProcessor = new AdminPaymentTaskProcessor(firestoreAdmin, exchangeRateImporter);
export const runAdminPaymentProcessTask = adminPaymentTaskProcessor.runTask;
export const addMissingAmountChf = adminPaymentTaskProcessor.addMissingAmountChf;

const firestoreAuditor = new FirestoreAuditor(firestoreAdmin);
export const auditCollectionTrigger = firestoreAuditor.auditCollectionTrigger;

const surveyManager = new SurveyManager(firestoreAdmin, authAdmin);
export const createAllSurveys = surveyManager.createAllSurveys;

const surveyLogin = new SurveyLogin(firestoreAdmin);
export const getSurveyCredentials = surveyLogin.getSurveyCredentials;
