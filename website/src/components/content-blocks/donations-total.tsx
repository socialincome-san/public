'use client';

import { FloatingImage } from '@/components/floating-image';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { Currency } from '@/generated/prisma/client';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { useDonationTotalAnimations } from '@/lib/hooks/use-donation-total-animations';
import { getSafeNumberFormatLocale, WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { formatStoryblokResizeUrl, getScaledAssetDimensions, resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';
import NextLink from 'next/link';

const MOBILE_IMAGE_MAX_WIDTH = 140;

type MobileImageRowProps = {
	images: (StoryblokAsset & { filename: string })[];
};

const MobileImageRow = ({ images }: MobileImageRowProps) => {
	if (images.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center justify-center gap-4 md:hidden">
			{images.map((image) => {
				const dimensions = getScaledAssetDimensions(image, MOBILE_IMAGE_MAX_WIDTH);
				const imageSrc = formatStoryblokResizeUrl(image.filename, dimensions.width, dimensions.height);

				return (
					<NextImage
						key={image.id}
						src={imageSrc}
						alt={image.alt ?? ''}
						width={dimensions.width}
						height={dimensions.height}
						sizes={`${MOBILE_IMAGE_MAX_WIDTH}px`}
						className="rounded-3xl"
					/>
				);
			})}
		</div>
	);
};

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

			<div className="relative z-10 flex flex-col items-center justify-center gap-6 py-8 text-center md:py-24 lg:py-32">
				<MobileImageRow images={images.slice(0, 2)} />

				{blok.heading && (
					<div className="max-w-sm">
						<SectionHeading size={3}>
							<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
						</SectionHeading>
					</div>
				)}

				<div className="flex justify-center">
					<div className="flex items-baseline">
						<span className="text-primary text-xl md:text-2xl">{currency}</span>
						<span className="text-primary text-6xl font-light tracking-tight md:text-8xl lg:text-[10rem]">
							{formatNumberLocale(displayValue, locale)}
						</span>
					</div>
				</div>

				{button && buttonHref && (
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				)}

				<MobileImageRow images={images.slice(2, 4)} />
			</div>
		</BlockWrapper>
	);
};
