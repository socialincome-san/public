import { CURRENCY_COOKIE } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { websiteCurrencies, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { cookies } from 'next/headers';
import { DonationForm } from './donation-form';
import { getDonationAmountFieldsTranslations } from './i18n/donation-amount-fields-translations';

type Props = {
	lang: WebsiteLanguage;
	campaignId?: string;
};

const getCurrency = async (): Promise<WebsiteCurrency> => {
	const cookieStore = await cookies();
	const currency = cookieStore.get(CURRENCY_COOKIE)?.value;

	return websiteCurrencies.includes(currency as WebsiteCurrency) ? (currency as WebsiteCurrency) : 'CHF';
};

export const DonationFormServer = async ({ lang, campaignId }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'donation-wizard' });
	const currency = await getCurrency();

	return (
		<DonationForm
			campaignId={campaignId}
			translations={getDonationAmountFieldsTranslations(translator.t)}
			currency={currency}
		/>
	);
};
