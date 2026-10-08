import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getTranslations } from 'next-intl/server';

type Props = {
	programDetailData: ProgramDetailData;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramPayoutsTotal = async ({ programDetailData, lang, region }: Props) => {
	const totalChf = programDetailData.dashboardStats?.paidOutSoFarChf ?? 0;
	const t = await getTranslations('website-common');

	const blok: DonationsTotal = {
		component: 'donationsTotal',
		_uid: 'program-payouts-total',
		heading: t('program-detail-page.payouts-total-title'),
		images: programDetailData.images,
	};

	return <StoryblokPayoutsTotal blok={blok} totalChf={totalChf} lang={lang} region={region} />;
};
