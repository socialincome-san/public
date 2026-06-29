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
import { getScaledDimensions, resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';
import NextLink from 'next/link';

const MOBILE_IMAGE_MAX_WIDTH = 140;

type MobileImageRowProps = {
	images: Array<StoryblokAsset & { filename: string }>;
	className?: string;
};

const MobileImageRow = ({ images, className }: MobileImageRowProps) => {
	if (images.length === 0) {
		return null;
	}

	return (
		<div className={cn('flex justify-center gap-4 md:hidden', className)}>
			{images.map((image) => {
				const dimensions = getScaledDimensions(image.filename, MOBILE_IMAGE_MAX_WIDTH) ?? {
					width: MOBILE_IMAGE_MAX_WIDTH,
					height: MOBILE_IMAGE_MAX_WIDTH,
				};

				return (
					<NextImage
						key={image.id}
						src={image.filename}
						alt={image.alt ?? ''}
						width={dimensions.width}
						height={dimensions.height}
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

			<div className="relative z-10 flex flex-col items-center justify-center py-16 text-center md:py-24 lg:py-32">
				<MobileImageRow images={images.slice(0, 2)} className="mb-6" />

				{blok.heading && (
					<SectionHeading className="mb-6 leading-tight whitespace-pre-wrap md:mb-6">
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				)}

				<div className="mb-8 flex justify-center">
					<div className="relative">
						<span className="text-primary text-6xl font-light tracking-tight md:text-8xl lg:text-[10rem]">
							{formatNumberLocale(displayValue, locale)}
						</span>
						<span className="text-primary absolute right-full bottom-0 mr-3 text-xl leading-none md:text-2xl">
							{currency}
						</span>
					</div>
				</div>

				{button && buttonHref && (
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				)}

				<MobileImageRow images={images.slice(2, 4)} className="mt-8" />
			</div>
		</BlockWrapper>
	);
};
