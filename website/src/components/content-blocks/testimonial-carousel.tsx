'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/carousel';
import { Testimonial } from '@/components/testimonial';
import type {
	Testimonial as StoryblokTestimonial,
	TestimonialCarousel,
} from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@/lib/utils/cn';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

type Props = {
	blok: TestimonialCarousel;
};

type TestimonialWithImage = StoryblokTestimonial & {
	image: NonNullable<StoryblokTestimonial['image']> & {
		filename: string;
	};
};

const AUTOPLAY_DELAY_MS = 4000;

export const TestimonialCarouselBlock = ({ blok }: Props) => {
	const entries = blok.testimonials.filter((entry): entry is TestimonialWithImage => Boolean(entry.image?.filename));
	const autoplayEnabled = Boolean(blok.autoplay);

	const [api, setApi] = useState<CarouselApi>();
	const [activeIndex, setActiveIndex] = useState(0);
	const [remainingMs, setRemainingMs] = useState(AUTOPLAY_DELAY_MS);
	const autoplayPlugin = useRef(Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false }));

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

	const handleSelectTestimonialItem = (index: number) => {
		if (!api) {
			return;
		}

		api.scrollTo(index);

		if (autoplayEnabled) {
			const autoplay = api.plugins().autoplay;
			autoplay?.reset();
			if (autoplay && !autoplay.isPlaying()) {
				autoplay.play();
			}
		}

		setRemainingMs(AUTOPLAY_DELAY_MS);
	};

	useEffect(() => {
		if (!api || !autoplayEnabled) {
			return;
		}

		let animationFrameId: number | null = null;

		const updateRemainingDelay = () => {
			const autoplay = api.plugins().autoplay;
			const nextDelay = autoplay?.timeUntilNext();
			setRemainingMs(nextDelay ?? AUTOPLAY_DELAY_MS);
			animationFrameId = window.requestAnimationFrame(updateRemainingDelay);
		};

		updateRemainingDelay();

		return () => {
			if (animationFrameId !== null) {
				window.cancelAnimationFrame(animationFrameId);
			}
		};
	}, [api, autoplayEnabled]);

	if (entries.length === 0) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="space-y-8">
				{blok.heading && (
					<h2 className="text-center text-4xl xl:text-5xl [&_strong]:font-bold">
						<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.heading}</Markdown>
					</h2>
				)}
				<Carousel
					setApi={setApi}
					opts={{
						align: 'center',
						loop: true,
					}}
					plugins={autoplayEnabled ? [autoplayPlugin.current] : []}
				>
					<CarouselContent>
						{entries.map((entry, index) => (
							<CarouselItem key={entry._uid ?? `${entry.name}-${index}`} className="basis-full md:basis-4/5 lg:basis-3/5">
								<Testimonial entry={entry} />
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>

				<div className="flex items-center justify-center gap-4">
					{entries.map((entry, index) => (
						<button
							key={`${entry.name}-${index}`}
							type="button"
							onClick={() => handleSelectTestimonialItem(index)}
							className={cn('bg-primary/25 relative h-1.5 w-16 overflow-hidden rounded-full')}
							aria-label={`Show testimonial ${index + 1}`}
						>
							<span
								className="bg-primary absolute inset-0 origin-left transition-transform duration-100"
								style={{
									transform: `scaleX(${
										index === activeIndex
											? autoplayEnabled
												? Math.min(Math.max(1 - remainingMs / AUTOPLAY_DELAY_MS, 0), 1)
												: 1
											: 0
									})`,
								}}
								aria-hidden="true"
							/>
						</button>
					))}
				</div>
			</div>
		</BlockWrapper>
	);
};
