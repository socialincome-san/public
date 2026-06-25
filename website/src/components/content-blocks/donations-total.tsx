'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { FloatingImage } from '@/components/floating-image';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { Currency } from '@/generated/prisma/client';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { useDonationTotalAnimations } from '@/lib/hooks/use-donation-total-animations';
import { getSafeNumberFormatLocale, WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextLink from 'next/link';

type Props = {
	blok: DonationsTotal;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	totalAmount: number;
	currency: Currency;
	disableAnimation?: boolean;
};

export const DonationsTotalBlock = ({ blok, lang, region, totalAmount, currency, disableAnimation = false }: Props) => {
	const hasFilename = (image: StoryblokAsset): image is StoryblokAsset & { filename: string } => Boolean(image.filename);
	const locale = getSafeNumberFormatLocale(lang);
	const { disableMarginBottom, disableMarginTop } = blok;

	const { sectionRef, displayValue, smoothMouseX, smoothMouseY } = useDonationTotalAnimations({
		totalAmount,
		disableAnimation,
	});

	const images = blok.images?.filter(hasFilename).slice(0, 4) ?? [];
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;

	return (
		<BlockWrapper
			ref={sectionRef}
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
			{...storyblokEditable(blok as SbBlokData)}
		>
			{images.map((image, index) => (
				<FloatingImage key={image.id} image={image} index={index} smoothMouseX={smoothMouseX} smoothMouseY={smoothMouseY} />
			))}

			<div className="relative z-10 flex flex-col items-center justify-center py-16 text-center md:py-24 lg:py-32">
				{blok.heading && (
					<SectionHeading className="mb-6 text-2xl leading-tight whitespace-pre-wrap md:mb-6 md:text-3xl lg:text-5xl">
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				)}

				<div className="text-primary mb-8 flex items-baseline justify-center gap-3">
					<span className="text-xl md:text-2xl">{currency}</span>
					<span className="text-6xl font-light tracking-tight md:text-8xl lg:text-[10rem]">
						{formatNumberLocale(displayValue, locale)}
					</span>
				</div>

				{button && buttonHref && (
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				)}
			</div>
		</BlockWrapper>
	);
};
