import createDonationCertificatesFunction from './donation-certificates';
import importExchangeRatesFunction from './exchange-rate-import';
import sendFirstPayoutEmailFunction from './first-payout-email';
import importPostfinancePaymentsFilesFunction from './postfinance-payments-files-import';

export const cronImportPostfinancePaymentsFiles = importPostfinancePaymentsFilesFunction;
export const cronImportExchangeRates = importExchangeRatesFunction;
export const cronSendFirstPayoutEmail = sendFirstPayoutEmailFunction;
export const cronCreateDonationCertificates = createDonationCertificatesFunction;
