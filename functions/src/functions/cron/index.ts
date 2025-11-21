import createDonationCertificatesFunction from './donation-certificates';
import importExchangeRatesFunction from './exchange-rate-import';
import sendFirstPayoutEmailFunction from './first-payout-email';

export const cronImportExchangeRates = importExchangeRatesFunction;
export const cronSendFirstPayoutEmail = sendFirstPayoutEmailFunction;
export const cronCreateDonationCertificates = createDonationCertificatesFunction;
