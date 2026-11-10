'use client';

import NextImage from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../../../cn';
import { SectionHeading } from '../../layout/section-heading/section-heading';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '../carousel/carousel';

type VideoCarouselItem = {
	id: string;
	title: string;
	// Shown while the video is not the active slide
	posterSrc: string;
	// Accessible name of the button that shows this video
	selectLabel: string;
	// The player, rendered only on the active slide so that a single video loads at a time
	video: ReactNode;
};

type VideoCarouselProps = {
	// Wrap the words to emphasise in <strong>
	title?: ReactNode;
	description?: string;
	items: VideoCarouselItem[];
};

export const VideoCarousel = ({ title, description, items }: VideoCarouselProps) => {
	const [api, setApi] = useState<CarouselApi>();
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}
		const updateActiveIndex = () => setActiveIndex(api.selectedScrollSnap());
		api.on('select', updateActiveIndex);
		api.on('reInit', updateActiveIndex);

		return () => {
			api.off('select', updateActiveIndex);
			api.off('reInit', updateActiveIndex);
		};
	}, [api]);

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col items-center gap-12">
			{title || description ? (
				<div className="flex max-w-4xl flex-col items-center gap-7 px-4 text-center">
					{title ? <SectionHeading size={1}>{title}</SectionHeading> : null}
					{description ? <p className="text-foreground max-w-3xl text-lg">{description}</p> : null}
				</div>
			) : null}
			<div className="w-full">
				<Carousel setApi={setApi} opts={{ align: 'center', loop: items.length > 1 }} gap="lg">
					<CarouselContent>
						{items.map((item, index) => (
							<CarouselItem key={item.id} size="featured">
								<div className="bg-foreground relative aspect-video overflow-hidden rounded-2xl *:size-full *:object-cover">
									{index === activeIndex ? (
										item.video
									) : (
										// Posters come from the video host in the right size already
										<NextImage src={item.posterSrc} alt={item.title} fill unoptimized />
									)}
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
				{items.length > 1 ? (
					<div className="mt-10 flex items-center justify-center gap-4">
						{items.map((item, index) => (
							<button
								key={item.id}
								type="button"
								onClick={() => api?.scrollTo(index)}
								aria-label={item.selectLabel}
								aria-current={index === activeIndex ? 'true' : undefined}
								className={cn(
									'focus-visible:ring-ring h-1.5 w-16 cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
									index === activeIndex ? 'bg-primary' : 'bg-primary/25',
								)}
							/>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
};
