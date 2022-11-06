import { dummyFunction as dummyFunc } from './dummy/dummyFunction';
import { bulkDonationCertificateBuilderFunction as bulkDonationCertificateFunc } from './pdfBuilder/donationCertificateBuilderFunction';
import { importBalanceMailFunc } from './etl/importPostfinanceBalance';

export const importBalanceMail = importBalanceMailFunc;
export const bulkDonationCertificateBuilderFunction = bulkDonationCertificateFunc;
export const dummyFunction = dummyFunc;
