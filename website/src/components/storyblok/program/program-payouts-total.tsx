import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	programDetailData: ProgramDetailData;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramPayoutsTotal = async ({ programDetailData, lang, region }: Props) => {
	const totalChf = programDetailData.dashboardStats?.paidOutSoFarChf ?? 0;
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const { amount: totalAmount, currency } = await services.currencyDisplay.resolveFromChf(totalChf, displayCurrency);

	const blok: DonationsTotal = {
		component: 'donationsTotal',
		_uid: 'program-payouts-total',
		heading: programDetailData.title,
		images: programDetailData.images,
	};

	return <StoryblokPayoutsTotal blok={blok} totalAmount={totalAmount} currency={currency} lang={lang} region={region} />;
};
