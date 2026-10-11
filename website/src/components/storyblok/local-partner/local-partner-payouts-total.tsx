import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getPublicLocalPartnerPayoutTotalsAction } from '@/modules/payouts/payout.actions';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LocalPartnerPayoutsTotal = async ({ localPartner, lang, currency }: Props) => {
	const blok = localPartner.content.payouts?.[0];
	const localPartnerSlug = localPartner.content.portalSlug?.trim();
	const totalsResult = localPartnerSlug ? await getPublicLocalPartnerPayoutTotalsAction(localPartnerSlug) : null;

	const totalChf = localPartnerSlug && totalsResult?.success ? totalsResult.data.totalPayoutsChf : 0;

	return <StoryblokPayoutsTotal blok={blok} totalChf={totalChf} lang={lang} currency={currency} />;
};
