import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';

type Props = {
	programDetailData: ProgramDetailData;
	translator: Translator;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramPayoutsTotal = async ({ programDetailData, translator, lang, region }: Props) => {
	const totalChf = programDetailData.dashboardStats?.paidOutSoFarChf ?? 0;
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const displayResult = await resolveChfAmountsAction({ amounts: [totalChf], displayCurrency });
	const displayAmount = displayResult.success ? displayResult.data[0] : undefined;
	const { amount: totalAmount, currency } = displayAmount ?? { amount: totalChf, currency: 'CHF' as const };

	const blok: DonationsTotal = {
		component: 'donationsTotal',
		_uid: 'program-payouts-total',
		heading: translator.t('program-detail-page.payouts-total-title'),
		images: programDetailData.images,
	};

	return <StoryblokPayoutsTotal blok={blok} totalAmount={totalAmount} currency={currency} lang={lang} region={region} />;
};
