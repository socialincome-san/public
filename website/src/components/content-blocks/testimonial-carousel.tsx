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
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

type Props = {
	blok: TestimonialCarousel;
};

type TestimonialWithImage = StoryblokTestimonial & {
	image: NonNullable<StoryblokTestimonial['image']> & {
		filename: string;
	};
};

export const TestimonialCarouselBlock = ({ blok }: Props) => {
	const entries = blok.testimonials.filter((entry): entry is TestimonialWithImage => Boolean(entry.image?.filename));

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
							onClick={() => api?.scrollTo(index)}
							className={cn('h-1.5 w-16 rounded-full transition', index === activeIndex ? 'bg-primary' : 'bg-primary/25')}
							aria-label={`Show testimonial ${index + 1}`}
						/>
					))}
				</div>
			</div>
		</BlockWrapper>
	);
};
