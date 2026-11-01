'use client';

import {
	bannerRichTextMarkResolvers,
	bannerRichTextNodeResolvers,
} from '@/components/storyblok/rich-text/journal-resolvers';
import type { BannerSection } from '@/generated/storyblok/types/109655/storyblok-components';
import { Banner } from '@socialincome/design-system/data-display/banner/banner';
import { useTranslations } from 'next-intl';
import { type ComponentProps, type ReactNode } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

type BannerColor = BannerSection['color'];
type BannerVariant = ComponentProps<typeof Banner>['variant'];

const bannerVariants: Record<BannerColor, BannerVariant> = {
	darkBlue: 'primary',
	blue: 'tint',
	white: 'outline',
	gradient: 'gradient',
	highlight: 'highlight',
};

// Values stored before the palette dropped yellow in favour of the two blues.
const legacyBannerColors: Record<string, BannerColor> = {
	yellow: 'blue',
	yello: 'blue',
	'#fbedd1': 'blue',
	'#cadde9': 'blue',
};

const isBannerColor = (value: string): value is BannerColor => Object.prototype.hasOwnProperty.call(bannerVariants, value);

const resolveBannerColor = (color: string): BannerColor => {
	if (isBannerColor(color)) {
		return color;
	}

	return Object.prototype.hasOwnProperty.call(legacyBannerColors, color) ? legacyBannerColors[color] : 'white';
};

export const BannerSectionBlock = ({ text, color, smallText, collapsible, collapsedByDefault }: BannerSection) => {
	const t = useTranslations('website-journal');
	if (!text) {
		return null;
	}

	return (
		<div className="my-8">
			<Banner
				variant={bannerVariants[resolveBannerColor(color)]}
				size={smallText ? 'sm' : 'default'}
				collapsible={
					collapsible
						? {
								expandLabel: t('banner.expand'),
								collapseLabel: t('banner.collapse'),
								defaultCollapsed: collapsedByDefault,
							}
						: undefined
				}
			>
				{
					render(text, {
						markResolvers: bannerRichTextMarkResolvers,
						nodeResolvers: bannerRichTextNodeResolvers,
					}) as ReactNode
				}
			</Banner>
		</div>
	);
};
