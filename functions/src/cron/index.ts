import { ExchangeRateImporter } from './ExchangeRateImporter';
import { PostFinanceImporter } from './PostFinanceImporter';

export const importBalanceMail = new PostFinanceImporter().getFunction();
export const importExchangeRates = new ExchangeRateImporter().getFunction();
