import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getPublicLocalPartnerPayoutTotalsAction } from '@/modules/payouts/payout.actions';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnerPayoutsTotal = async ({ localPartner, lang, region }: Props) => {
	const blok = localPartner.content.payouts?.[0];
	const localPartnerSlug = localPartner.content.portalSlug?.trim();
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const totalsResult = localPartnerSlug ? await getPublicLocalPartnerPayoutTotalsAction(localPartnerSlug) : null;

	const totalChf = localPartnerSlug && totalsResult?.success ? totalsResult.data.totalPayoutsChf : 0;
	const displayResult = await resolveChfAmountsAction({ amounts: [totalChf], displayCurrency });
	const displayAmount = displayResult.success ? displayResult.data[0] : undefined;
	const { amount: totalAmount, currency } = displayAmount ?? { amount: totalChf, currency: 'CHF' as const };

	return <StoryblokPayoutsTotal blok={blok} totalAmount={totalAmount} currency={currency} lang={lang} region={region} />;
};
