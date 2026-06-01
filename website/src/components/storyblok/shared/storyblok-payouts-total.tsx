import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

type Props = {
	blok: DonationsTotal | undefined;
	totalChf: number;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const StoryblokPayoutsTotal = ({ blok, totalChf, lang, region }: Props) => {
	if (!blok || totalChf === 0) {
		return null;
	}

	return <DonationsTotalBlock blok={blok} lang={lang} region={region} totalChf={totalChf} />;
};
