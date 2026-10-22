'use client';

import { blockMargins } from '@/components/content-blocks/block-margins';
import { FloatingImage } from '@/components/floating-image';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { Currency } from '@/generated/prisma/client';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { useDonationTotalAnimations } from '@/lib/hooks/use-donation-total-animations';
import { getSafeNumberFormatLocale, WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { formatStoryblokResizeUrl, getScaledAssetDimensions, resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable } from '@storyblok/react';
import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { useRef } from 'react';

const MOBILE_IMAGE_MAX_WIDTH = 140;

// `x`, `y` and `grow` are how far an image moves and how much wider it gets while its row scrolls through the screen,
// `offsetY` where it rests, all in px.
type Drift = { x: number; y: number; grow: number; offsetY: number };

// Left image first. The rows mirror each other, so they move like the floating images on large screens.
const MOBILE_IMAGE_DRIFTS: Record<'top' | 'bottom', [Drift, Drift]> = {
	top: [
		{ x: 4, y: -2.5, grow: 4, offsetY: -6 },
		{ x: 6, y: 2.5, grow: 0, offsetY: 6 },
	],
	bottom: [
		{ x: -6, y: 2.5, grow: 0, offsetY: 6 },
		{ x: -4, y: -2.5, grow: 4, offsetY: -6 },
	],
};

type MobileImage = StoryblokAsset & { filename: string };

type DriftingImageProps = {
	image: MobileImage;
	progress: MotionValue<number>;
	drift: Drift;
};

const DriftingImage = ({ image, progress, drift }: DriftingImageProps) => {
	const dimensions = getScaledAssetDimensions(image, MOBILE_IMAGE_MAX_WIDTH);
	// A drift of zero instead of no style: motion would keep the last offset.
	const amount = useReducedMotion() ? 0 : 1;
	const x = useTransform(progress, [0, 1], [-drift.x * amount, drift.x * amount]);
	const y = useTransform(progress, [0, 1], [drift.offsetY - drift.y * amount, drift.offsetY + drift.y * amount]);
	const scale = useTransform(progress, [0, 1], [1, 1 + (drift.grow * amount) / dimensions.width]);
	const imageSrc = formatStoryblokResizeUrl(image.filename, dimensions.width, dimensions.height);

	return (
		<motion.div style={{ x, y, scale }}>
			<NextImage
				src={imageSrc}
				alt={image.alt ?? ''}
				width={dimensions.width}
				height={dimensions.height}
				sizes={`${MOBILE_IMAGE_MAX_WIDTH}px`}
				className="rounded-3xl"
			/>
		</motion.div>
	);
};

type MobileImageRowProps = {
	images: MobileImage[];
	position: 'top' | 'bottom';
};

const MobileImageRow = ({ images, position }: MobileImageRowProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

	if (images.length === 0) {
		return null;
	}

	return (
		<div ref={ref} className="flex items-center justify-center gap-4 md:hidden">
			{images.map((image, index) => (
				<DriftingImage
					key={image.id}
					image={image}
					progress={scrollYProgress}
					drift={MOBILE_IMAGE_DRIFTS[position][index] ?? { x: 0, y: 0, grow: 0, offsetY: 0 }}
				/>
			))}
		</div>
	);
};

type Props = {
	blok: DonationsTotal;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	totalAmount: number;
	totalCurrency: Currency;
	disableAnimation?: boolean;
};

export const DonationsTotalBlock = ({
	blok,
	lang,
	currency,
	totalAmount,
	totalCurrency,
	disableAnimation = false,
}: Props) => {
	const hasFilename = (image: StoryblokAsset): image is StoryblokAsset & { filename: string } => Boolean(image.filename);
	const locale = getSafeNumberFormatLocale(lang);

	const { sectionRef, displayValue, smoothMouseX, smoothMouseY } = useDonationTotalAnimations({
		totalAmount,
		disableAnimation,
	});

	const images = blok.images?.filter(hasFilename).slice(0, 4) ?? [];
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, currency) : null;

	return (
		<BlockWrapper ref={sectionRef} {...blockMargins(blok)} {...storyblokEditable(blok)}>
			{images.map((image, index) => (
				<FloatingImage key={image.id} image={image} index={index} smoothMouseX={smoothMouseX} smoothMouseY={smoothMouseY} />
			))}

			<div className="relative z-10 flex flex-col items-center justify-center gap-6 py-8 text-center md:min-h-152 md:py-24 lg:py-32">
				<MobileImageRow images={images.slice(0, 2)} position="top" />

				{blok.heading && (
					<div className="max-w-sm">
						<SectionHeading size={3}>
							<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
						</SectionHeading>
					</div>
				)}

				<div className="flex justify-center">
					<div className="flex items-baseline gap-2">
						<span className="text-primary text-xl md:text-2xl">{totalCurrency}</span>
						<span className="text-primary 2xl:text-display-lg text-6xl font-light tracking-tight md:text-7xl lg:text-8xl xl:text-9xl">
							{formatNumberLocale(displayValue, locale)}
						</span>
					</div>
				</div>

				{button && buttonHref && (
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				)}

				<MobileImageRow images={images.slice(2, 4)} position="bottom" />
			</div>
		</BlockWrapper>
	);
};
