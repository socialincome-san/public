import { CampaignsGridSection } from '@/components/campaign/campaigns-grid-section';
import { getTeaserCampaigns } from '@/components/campaign/get-teaser-campaigns';
import { hasBlockButton } from '@/components/content-blocks/block-button';
import { blockMargins } from '@/components/content-blocks/block-margins';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { CampaignGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: CampaignGrid;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CampaignGridBlock = async ({ blok, lang, currency }: Props) => {
	const data = await getTeaserCampaigns(lang);
	if (data.campaigns.length === 0) {
		return null;
	}

	const button = blok.button?.[0];

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<CampaignsGridSection
				heading={blok.heading ? <StoryblokMarkdown>{blok.heading}</StoryblokMarkdown> : undefined}
				data={data}
				lang={lang}
				currency={currency}
				cta={
					button && hasBlockButton(button, undefined, lang, currency)
						? { href: resolveStoryblokLink(button.link, lang, currency), label: button.label?.trim() ?? '' }
						: undefined
				}
			/>
		</BlockWrapper>
	);
};
