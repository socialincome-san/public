import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { isStoryblokMockRecordOrReplay } from '@/lib/utils/environment';

type Props = {
	blok: DonationsTotal;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const DonationsTotalBlockServer = async ({ blok, lang, region }: Props) => {
	const totalsResult = await services.transparency.getTransparencyTotals();
	const totalChf = totalsResult.success ? totalsResult.data.totalContributionsChf : 0;

	return (
		<DonationsTotalBlock
			blok={blok}
			lang={lang}
			region={region}
			totalChf={totalChf}
			disableAnimation={isStoryblokMockRecordOrReplay()}
		/>
	);
};
