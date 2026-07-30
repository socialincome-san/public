'use client';

import {
	bannerRichTextMarkResolvers,
	bannerRichTextNodeResolvers,
} from '@/components/storyblok/rich-text/journal-resolvers';
import type { BannerSection } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

// `smallText` is newer than the generated types; drop the intersection after the next `npm run storyblok:generate`.
type Props = BannerSection & { smallText?: boolean };

type BannerColor = 'darkBlue' | 'blue' | 'white';

const DEFAULT_BANNER_COLOR: BannerColor = 'white';

// All three let the page gradient through at 70%: the darkest alpha that keeps text contrast
// above 4.5:1 on the dark variant, and the lightest that keeps the tints visible on the wash.
const bannerColorClassNames: Record<BannerColor, string> = {
	darkBlue: 'bg-primary/70 text-primary-foreground',
	blue: 'bg-banner-blue/70 text-foreground',
	white: 'bg-background/70 border-border text-foreground border',
};

// Values stored before the palette dropped yellow in favour of the two blues.
const legacyBannerColors: Record<string, BannerColor> = {
	yellow: 'blue',
	yello: 'blue',
	'#fbedd1': 'blue',
	'#cadde9': 'blue',
};

const isBannerColor = (value: string): value is BannerColor =>
	Object.prototype.hasOwnProperty.call(bannerColorClassNames, value);

const resolveBannerColor = (color: string): BannerColor => {
	if (isBannerColor(color)) {
		return color;
	}

	return Object.prototype.hasOwnProperty.call(legacyBannerColors, color) ? legacyBannerColors[color] : DEFAULT_BANNER_COLOR;
};

export const BannerSectionBlock = ({ text, color, smallText }: Props) => {
	if (!text) {
		return null;
	}

	return (
		<div
			className={cn(
				'my-8 rounded-2xl px-6 py-5',
				bannerColorClassNames[resolveBannerColor(color)],
				smallText ? 'text-base md:text-lg' : 'text-lg md:text-xl',
			)}
		>
			{
				render(text, {
					markResolvers: bannerRichTextMarkResolvers,
					nodeResolvers: bannerRichTextNodeResolvers,
				}) as ReactNode
			}
		</div>
	);
};
