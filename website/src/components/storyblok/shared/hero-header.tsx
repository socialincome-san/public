import { DonationForm } from '@/components/donation-wizard/donation-form';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import {
	formatStoryblokResizeUrl,
	getScaledAssetDimensions,
	getStoryblokImageObjectPosition,
} from '@/lib/storyblok/storyblok-utils';
import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import {
	MediaHero,
	MediaHeroChips,
	MediaHeroIntro,
	MediaHeroPill,
} from '@socialincome/design-system/layout/media-hero/media-hero';
import type { ReactNode } from 'react';

const HERO_HEADER_IMAGE_WIDTH = 1920;

type HeroHeaderStat = {
	value?: number;
	label: string;
	href?: string;
	icon?: ReactNode;
};

export type HeroHeaderImage = Pick<StoryblokAsset, 'filename' | 'alt' | 'focus'>;

type Props = {
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
	const scaledDimensions = heroImage?.filename
		? getScaledAssetDimensions({ filename: heroImage.filename }, HERO_HEADER_IMAGE_WIDTH)
		: null;
	const heroImageSrc =
		scaledDimensions && heroImage?.filename
			? formatStoryblokResizeUrl(heroImage.filename, scaledDimensions.width, scaledDimensions.height)
			: null;
	const objectPosition = getStoryblokImageObjectPosition(heroImage);
	const heroCardNode = heroCard ?? <DonationForm campaignId={campaignId} />;

	return (
		<MediaHero
			image={heroImageSrc ? { src: heroImageSrc, alt: heroImage?.alt ?? title, objectPosition } : null}
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
						{stats.map((stat) =>
							stat.href ? (
								<LinkPill
									key={stat.label}
									label={`${stat.value !== undefined ? `${stat.value} ` : ''}${stat.label}`}
									href={stat.href}
									icon={stat.icon}
								/>
							) : (
								<MediaHeroPill key={stat.label}>
									{stat.icon}
									{stat.value !== undefined ? `${stat.value} ` : ''}
									{stat.label}
								</MediaHeroPill>
							),
						)}
					</MediaHeroChips>
				) : null}
				{badges ? <MediaHeroChips>{badges}</MediaHeroChips> : null}
			</MediaHeroIntro>
		</MediaHero>
	);
};
