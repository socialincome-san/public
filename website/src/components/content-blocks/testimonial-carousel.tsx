'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/carousel';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { Testimonial } from '@/components/testimonial';
import type { TestimonialCarousel } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@/lib/utils/cn';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
	blok: TestimonialCarousel;
};

const AUTOPLAY_DELAY_MS = 14000;

export const TestimonialCarouselBlock = ({ blok }: Props) => {
	const { disableMarginBottom, disableMarginTop } = blok;
	const entries = blok.testimonials;
	const autoplayEnabled = Boolean(blok.autoplay);

	const [api, setApi] = useState<CarouselApi>();
	const [activeIndex, setActiveIndex] = useState(0);
	const autoplayPlugin = useMemo(() => Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false }), []);
	const progressBarRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
	};

	useEffect(() => {
		if (!api || !autoplayEnabled) {
			return;
		}

		let animationFrameId: number | null = null;

		const restartProgressAnimation = () => {
			cancelProgressAnimation();
			aimateProgressBar();
		};

		const cancelProgressAnimation = () => {
			if (animationFrameId !== null) {
				window.cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
		};

		const aimateProgressBar = () => {
			const autoplay = api.plugins().autoplay;

			const nextDelay = autoplay.timeUntilNext() ?? AUTOPLAY_DELAY_MS;
			const progress = Math.min(Math.max(1 - nextDelay / AUTOPLAY_DELAY_MS, 0), 1);
			const selectedIndex = api.selectedScrollSnap();

			progressBarRefs.current.forEach((progressBar, index) => {
				if (progressBar) {
					progressBar.style.transform = `scaleX(${index === selectedIndex ? progress : 0})`;
				}
			});

			animationFrameId = window.requestAnimationFrame(aimateProgressBar);
		};

		aimateProgressBar();
		api.on('autoplay:stop', cancelProgressAnimation);
		api.on('autoplay:play', aimateProgressBar);

		return () => {
			cancelProgressAnimation();
			api.off('autoplay:stop', cancelProgressAnimation);
			api.off('autoplay:play', restartProgressAnimation);
		};
	}, [api, autoplayEnabled]);

	if (entries.length === 0) {
		return null;
	}

	if (entries.length === 1) {
		return (
			<BlockWrapper
				disableMarginBottom={disableMarginBottom}
				disableMarginTop={disableMarginTop}
				{...storyblokEditable(blok as SbBlokData)}
			>
				{blok.heading && (
					<SectionHeading>
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				)}
				<div className="mx-auto w-full max-w-4xl">
					<Testimonial entry={entries[0]} />
				</div>
			</BlockWrapper>
		);
	}

	return (
		<BlockWrapper
			className="overflow-visible md:w-full md:px-0"
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
			{...storyblokEditable(blok as SbBlokData)}
		>
			{blok.heading && (
				<SectionHeading>
					<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
				</SectionHeading>
			)}
			<Carousel
				setApi={setApi}
				opts={{
					align: 'center',
					loop: true,
				}}
				plugins={autoplayEnabled ? [autoplayPlugin] : []}
			>
				<CarouselContent>
					{entries.map((entry, index) => (
						<CarouselItem key={entry._uid ?? `${entry.name}-${index}`} className="basis-full md:basis-4/5 lg:basis-3/5">
							<Testimonial entry={entry} />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			<div className="mt-8 flex items-center justify-center gap-4">
				{entries.map((entry, index) => (
					<button
						key={`${entry.name}-${index}`}
						type="button"
						onClick={() => handleSelectTestimonialItem(index)}
						className={cn('bg-primary/25 relative h-1.5 w-16 overflow-hidden rounded-full')}
						aria-label={`Show testimonial ${index + 1}`}
					>
						<span
							ref={(element) => {
								progressBarRefs.current[index] = element;
							}}
							className="bg-primary absolute inset-0 origin-left transition-transform duration-100"
							style={{
								transform: `scaleX(${index === activeIndex && !autoplayEnabled ? 1 : 0})`,
							}}
							aria-hidden="true"
						/>
					</button>
				))}
			</div>
		</BlockWrapper>
	);
};
