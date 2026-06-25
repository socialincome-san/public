import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
import type { Currency } from '@/generated/prisma/client';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

type Props = {
	blok: DonationsTotal | undefined;
	totalAmount: number;
	currency: Currency;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const StoryblokPayoutsTotal = ({ blok, totalAmount, currency, lang, region }: Props) => {
	if (!blok || totalAmount === 0) {
		return null;
	}

	return <DonationsTotalBlock blok={blok} lang={lang} region={region} totalAmount={totalAmount} currency={currency} />;
};
