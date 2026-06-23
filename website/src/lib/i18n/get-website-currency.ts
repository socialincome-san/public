import { CURRENCY_COOKIE } from '@/app/[lang]/[region]';
import { isWebsiteCurrency, type WebsiteCurrency } from '@/lib/i18n/utils';
import { cookies } from 'next/headers';

export const getWebsiteCurrencyFromCookie = async (): Promise<WebsiteCurrency> => {
	const cookieStore = await cookies();
	const currency = cookieStore.get(CURRENCY_COOKIE)?.value;

	return isWebsiteCurrency(currency) ? currency : 'CHF';
};
