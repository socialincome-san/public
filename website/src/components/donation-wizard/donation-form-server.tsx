import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { DonationForm } from './donation-form';

type Props = {
	campaignId?: string;
};

export const DonationFormServer = async ({ campaignId }: Props) => {
	const currency = await getWebsiteCurrencyFromCookie();

	return <DonationForm campaignId={campaignId} currency={currency} />;
};
