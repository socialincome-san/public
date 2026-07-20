import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { BlockWrapper } from '../block-wrapper';
import { DonationForm } from './donation-form';
import { getDonationAmountFieldsTranslations } from './i18n/donation-amount-fields-translations';

type Props = {
	lang: WebsiteLanguage;
	campaignId?: string;
};

export const DonationFormServer = async ({ lang, campaignId }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'donation-wizard' });
	const currency = await getWebsiteCurrencyFromCookie();

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<DonationForm
				campaignId={campaignId}
				translations={getDonationAmountFieldsTranslations(translator.t)}
				currency={currency}
			/>
		</BlockWrapper>
	);
};
