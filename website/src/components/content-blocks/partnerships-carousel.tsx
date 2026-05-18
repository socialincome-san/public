'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Carousel, CarouselContent, CarouselItem } from '@/components/carousel';
import type { Partnership, PartnershipsCarousel } from '@/generated/storyblok/types/109655/storyblok-components';
import { getScaledDimensions } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';
import Link from 'next/link';
import Markdown from 'react-markdown';

type Props = {
	blok: PartnershipsCarousel;
};

type PartnershipWithLogo = Partnership & {
	logo: NonNullable<Partnership['logo']> & {
		filename: string;
	};
};

const LOGO_MAX_WIDTH = 240;
const LOGO_FALLBACK_HEIGHT = 120;

const isPartnershipWithLogo = (partnership: Partnership): partnership is PartnershipWithLogo => {
	return Boolean(partnership.logo?.filename);
};

const isSvgAsset = (filename: string, contentType?: string) => {
	const pathWithoutQuery = filename.split('?')[0] ?? '';

	return contentType === 'image/svg+xml' || pathWithoutQuery.toLowerCase().endsWith('.svg');
};

const getWebsiteHref = (website: Partnership['website']) => {
	return website.url || website.cached_url || null;
};

export const PartnershipsCarouselBlock = ({ blok }: Props) => {
	const entries = blok.partnerships
		.filter((entry): entry is ISbStoryData<Partnership> => typeof entry !== 'string')
		.map((entry) => entry.content)
		.filter(isPartnershipWithLogo)
		.filter((entry) => Boolean(getWebsiteHref(entry.website)));

	if (entries.length === 0) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{blok.heading && <h2 className="text-3xl font-bold">{blok.heading}</h2>}
			{blok.description && (
				<div className="mt-4 text-lg text-black">
					<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.description}</Markdown>
				</div>
			)}
			<Carousel
				opts={{
					align: 'center',
					loop: true,
				}}
			>
				<CarouselContent>
					{entries.map((entry, index) => {
						const href = getWebsiteHref(entry.website);
						const isSvg = isSvgAsset(entry.logo.filename, entry.logo.content_type);
						const dimensions = getScaledDimensions(entry.logo.filename, LOGO_MAX_WIDTH) ?? {
							width: entry.logo.width ?? LOGO_MAX_WIDTH,
							height: entry.logo.height ?? LOGO_FALLBACK_HEIGHT,
						};

						return (
							<CarouselItem
								key={entry._uid ?? `${entry.name}-${index}`}
								className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
							>
								<Link
									href={href ?? '#'}
									target="_blank"
									rel="noopener noreferrer"
									className="flex aspect-video items-center justify-center p-6"
									aria-label={`Open ${entry.name} website`}
								>
									{isSvg ? (
										// SVG logos should keep their original vector source.
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={entry.logo.filename}
											alt={entry.logo.alt ?? entry.name}
											width={entry.logo.width ?? undefined}
											height={entry.logo.height ?? undefined}
											className="max-h-full w-full object-contain"
										/>
									) : (
										<NextImage
											src={entry.logo.filename}
											alt={entry.logo.alt ?? entry.name}
											width={dimensions.width}
											height={dimensions.height}
											className="max-h-full w-full object-contain"
										/>
									)}
								</Link>
							</CarouselItem>
						);
					})}
				</CarouselContent>
			</Carousel>
		</BlockWrapper>
	);
};
