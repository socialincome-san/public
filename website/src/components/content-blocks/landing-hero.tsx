import { BlockButton, hasBlockButton } from '@/components/content-blocks/block-button';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import type { LandingHero } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { MediaHeroCard } from '@socialincome/design-system/layout/media-hero/media-hero';

type Props = {
	blok: LandingHero;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LandingHeroBlock = ({ blok, lang, currency }: Props) => {
	const button = blok.button?.[0];
	const card =
		!blok.showDonationForm && hasBlockButton(button, blok.buttonAction, lang, currency) ? (
			<MediaHeroCard
				title={blok.cardTitle?.trim() ? blok.cardTitle : (button?.label ?? '')}
				description={blok.cardDescription}
				action={
					<BlockButton
						button={button}
						action={blok.buttonAction}
						variant="default"
						fullWidth
						lang={lang}
						currency={currency}
					/>
				}
			/>
		) : undefined;
	const showAside = blok.showDonationForm === true || card !== undefined;

	return (
		<HeroHeader
			title={blok.title}
			description={blok.description}
			heroImage={blok.image}
			stats={(blok.facts ?? []).map((fact) => ({ label: fact.label }))}
			heroCard={card}
			showDonationForm={showAside}
			showDonationsFormMobile={showAside}
		/>
	);
};
