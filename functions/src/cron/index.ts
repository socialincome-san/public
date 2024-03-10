import importExchangeRatesFunction from './exchange-rate-import';
import importBalanceMailFunction from './postfinance-balance-import';
import importPostfinancePaymentsFilesFunction from './postfinance-payments-files-import';

export const importBalanceMail = importBalanceMailFunction;
export const importPostfinancePaymentsFiles = importPostfinancePaymentsFilesFunction;
export const importExchangeRates = importExchangeRatesFunction;
