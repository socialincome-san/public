import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import {
	MediaHero,
	MediaHeroChips,
	MediaHeroIntro,
	MediaHeroPill,
} from '@socialincome/design-system/layout/media-hero/media-hero';
import type { ReactNode } from 'react';

const HERO_HEADER_IMAGE_WIDTH = 1920;
const HERO_HEADER_IMAGE_HEIGHT = 1080;

type HeroHeaderStat = {
	value?: number;
	label: string;
};

export type HeroHeaderImage = Pick<StoryblokAsset, 'filename' | 'alt' | 'focus'>;

type Props = {
	lang: WebsiteLanguage;
	title: string;
	heroImage?: HeroHeaderImage | null;
	stats: HeroHeaderStat[];
	titleIcon?: string;
	titleIconAlt?: string;
	preTitle?: ReactNode;
	badges?: ReactNode;
	campaignId?: string;
	/** Replaces the default donation form in both the desktop hero slot and the mobile slot. */
	heroCard?: ReactNode;
	showDonationForm?: boolean;
	showDonationsFormMobile?: boolean;
};

export const HeroHeader = ({
	lang,
	title,
	heroImage,
	stats,
	titleIcon,
	titleIconAlt,
	preTitle,
	badges,
	campaignId,
	heroCard,
	showDonationForm = true,
	showDonationsFormMobile = true,
}: Props) => {
	const heroImageSrc = heroImage?.filename
		? formatStoryblokUrl(heroImage.filename, HERO_HEADER_IMAGE_WIDTH, HERO_HEADER_IMAGE_HEIGHT, heroImage.focus)
		: null;
	const heroCardNode = heroCard ?? <DonationFormServer lang={lang} campaignId={campaignId} />;

	return (
		<MediaHero
			image={heroImageSrc ? { src: heroImageSrc, alt: heroImage?.alt ?? title } : null}
			aside={showDonationForm ? heroCardNode : null}
			mobileAside={showDonationsFormMobile ? heroCardNode : null}
		>
			<MediaHeroIntro
				title={title}
				eyebrow={preTitle ? <MediaHeroChips>{preTitle}</MediaHeroChips> : null}
				titleIcon={titleIcon ? { src: titleIcon, alt: titleIconAlt ?? title } : undefined}
			>
				{stats.length > 0 ? (
					<MediaHeroChips>
						{stats.map((stat) => (
							<MediaHeroPill key={stat.label}>
								{stat.value !== undefined ? `${stat.value} ` : ''}
								{stat.label}
							</MediaHeroPill>
						))}
					</MediaHeroChips>
				) : null}
				{badges ? <MediaHeroChips>{badges}</MediaHeroChips> : null}
			</MediaHeroIntro>
		</MediaHero>
	);
};
