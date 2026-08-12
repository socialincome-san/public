import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
import type { Currency } from '@/generated/prisma/client';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';

type Props = {
	blok: DonationsTotal | undefined;
	totalAmount: number;
	currency: Currency;
};

export const StoryblokPayoutsTotal = async ({ blok, totalAmount, currency }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
	if (!blok || totalAmount === 0) {
		return null;
	}

	return <DonationsTotalBlock blok={blok} lang={lang} region={region} totalAmount={totalAmount} currency={currency} />;
};
