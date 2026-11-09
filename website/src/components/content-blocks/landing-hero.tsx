import { BlockButton } from '@/components/content-blocks/block-button';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import type { LandingHero } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	blok: LandingHero;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LandingHeroBlock = ({ blok, lang, currency }: Props) => (
	<HeroHeader
		title={blok.title}
		description={blok.description}
		heroImage={blok.image}
		stats={(blok.facts ?? []).map((fact) => ({ label: fact.label }))}
		showDonationForm={Boolean(blok.showDonationForm)}
		showDonationsFormMobile={Boolean(blok.showDonationForm)}
		actions={
			<BlockButton button={blok.button?.[0]} action={blok.buttonAction} variant="default" lang={lang} currency={currency} />
		}
	/>
);
