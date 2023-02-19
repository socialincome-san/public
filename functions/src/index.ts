import { getOrInitializeApp } from '../../shared/src/firebase/app';
import { FirestoreAdmin } from '../../shared/src/firebase/FirestoreAdmin';
import { StorageAdmin } from '../../shared/src/firebase/StorageAdmin';
import { DonationCertificateHandler } from './donation_certificates/DonationCertificateHandler';
import { ExchangeRateImporter } from './etl/ExchangeRateImporter';
import { FirestoreAuditor } from './etl/FirestoreAuditor';
import { OrangeMoneyCSVCreator } from './etl/OrangeMoneyCSVCreator';
import { PostfinanceImporter } from './etl/PostfinanceImporter';
import { StripeWebhook } from './etl/StripeWebhook';

const app = getOrInitializeApp();
const firestoreAdmin = new FirestoreAdmin(app);
const storageAdmin = new StorageAdmin(app);

const stripeWebhook = new StripeWebhook(firestoreAdmin);
export const batchImportStripeCharges = stripeWebhook.batchImportStripeCharges;
export const stripeChargeHook = stripeWebhook.stripeChargeHookFunction;

const postfinanceImporter = new PostfinanceImporter(firestoreAdmin);
export const importBalanceMail = postfinanceImporter.importBalanceMail;

const exchangeRateImporter = new ExchangeRateImporter(firestoreAdmin);
export const importExchangeRates = exchangeRateImporter.importExchangeRates;

const donationCertificateHandler = new DonationCertificateHandler(firestoreAdmin, storageAdmin);
export const createDonationCertificates = donationCertificateHandler.createDonationCertificates;

const orangeMoneyCSVCreator = new OrangeMoneyCSVCreator(firestoreAdmin);
export const createOrangeMoneyCSV = orangeMoneyCSVCreator.createOrangeMoneyCSV;

const firestoreAuditor = new FirestoreAuditor(firestoreAdmin);
export const auditCollectionTrigger = firestoreAuditor.auditCollectionTrigger;
export const auditSubcollectionTrigger = firestoreAuditor.auditSubcollectionTrigger;
