import { ChfDonationsTotalBlock } from '@/components/content-blocks/donations-total-server';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	blok: DonationsTotal | undefined;
	totalChf: number;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const StoryblokPayoutsTotal = ({ blok, totalChf, lang, currency }: Props) => {
	if (!blok || totalChf === 0) {
		return null;
	}

	return <ChfDonationsTotalBlock blok={blok} lang={lang} currency={currency} totalChf={totalChf} />;
};
