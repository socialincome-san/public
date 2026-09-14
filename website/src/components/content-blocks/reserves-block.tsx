import { BlockWrapper } from '@/components/block-wrapper';
import { ReservesTotal } from '@/components/reserves/reserves-total';
import type { ReservesBlock as ReservesBlockBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

const FINANCIAL_INSTITUTIONS = [
	{ id: 'postfinance', labelKey: 'transparency-page.reserves.institutions.postfinance' },
	{ id: 'ecobank', labelKey: 'transparency-page.reserves.institutions.ecobank' },
	{ id: 'orange-money', labelKey: 'transparency-page.reserves.institutions.orange-money' },
] as const;

type Props = {
	blok: ReservesBlockBlok;
	lang: WebsiteLanguage;
};

export const ReservesBlock = async ({ blok, lang }: Props) => {
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [translator, reservesResult, rates] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
		services.transparency.getLatestReservesChf(),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);

	if (!reservesResult.success) {
		return null;
	}

	const reserves = services.currencyDisplay.resolveFromChf(reservesResult.data, displayCurrency, rates);

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<ReservesTotal
				amount={reserves.amount}
				title={translator.t('transparency-page.reserves.total-today')}
				titleCurrency={translator.t('transparency-page.reserves.title-currency', {
					context: { currency: reserves.currency },
				})}
				institutionsHeading={translator.t('transparency-page.reserves.institutions-heading')}
				institutions={FINANCIAL_INSTITUTIONS.map(({ id, labelKey }) => ({
					id,
					label: translator.t(labelKey),
				}))}
				lang={lang}
			/>
		</BlockWrapper>
	);
};
