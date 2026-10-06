'use client';

import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import MuxVideo from '@mux/mux-video-react';
import { cn } from '@socialincome/design-system/cn';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from '@socialincome/design-system/data-display/carousel/carousel';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { useEffect, useState } from 'react';

type Props = {
	translations: {
		title: string;
		description: string;
		videoTitles: string[];
		showVideoLabels: string[];
	};
	videoPlaybackIds: string[];
};

const getMuxPosterUrl = (playbackId: string) => `https://image.mux.com/${playbackId}/thumbnail.jpg?time=2`;

export const CampaignVideoSlider = ({ translations, videoPlaybackIds }: Props) => {
	const [api, setApi] = useState<CarouselApi>();
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		const updateActiveIndex = () => {
			setActiveIndex(api.selectedScrollSnap());
		};

		updateActiveIndex();
		api.on('select', updateActiveIndex);
		api.on('reInit', updateActiveIndex);

		return () => {
			api.off('select', updateActiveIndex);
			api.off('reInit', updateActiveIndex);
		};
	}, [api]);

	if (videoPlaybackIds.length === 0) {
		return null;
	}

	const handleSelectVideo = (index: number) => {
		api?.scrollTo(index);
	};

	return (
		<BlockWrapper width="bleed">
			<div className="flex flex-col items-center gap-12">
				<div className="flex max-w-4xl flex-col items-center gap-7 text-center">
					<SectionHeading size={1}>
						<StoryblokMarkdown>{translations.title}</StoryblokMarkdown>
					</SectionHeading>
					<p className="text-foreground max-w-[840px] text-lg leading-7">{translations.description}</p>
				</div>

				<div className="w-full">
					<Carousel
						setApi={setApi}
						opts={{
							align: 'center',
							loop: videoPlaybackIds.length > 1,
						}}
						gap="lg"
					>
						<CarouselContent>
							{videoPlaybackIds.map((playbackId, index) => (
								<CarouselItem key={playbackId} size="featured">
									<div className="bg-foreground aspect-video overflow-hidden rounded-2xl">
										{index === activeIndex ? (
											<MuxVideo
												key={playbackId}
												className="size-full object-cover"
												playbackId={playbackId}
												poster={getMuxPosterUrl(playbackId)}
												title={translations.videoTitles[index]}
												controls
												preload="metadata"
												playsInline
											/>
										) : (
											// eslint-disable-next-line @next/next/no-img-element -- Mux CDN poster thumbnail
											<img
												src={getMuxPosterUrl(playbackId)}
												alt={translations.videoTitles[index]}
												className="size-full object-cover"
											/>
										)}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>

					{videoPlaybackIds.length > 1 && (
						<div className="mt-10 flex items-center justify-center gap-4">
							{videoPlaybackIds.map((playbackId, index) => (
								<button
									key={playbackId}
									type="button"
									onClick={() => handleSelectVideo(index)}
									className={cn(
										'h-1.5 w-16 rounded-full transition-colors',
										index === activeIndex ? 'bg-primary' : 'bg-primary/25',
									)}
									aria-label={translations.showVideoLabels[index]}
									aria-current={index === activeIndex ? 'true' : undefined}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</BlockWrapper>
	);
};
