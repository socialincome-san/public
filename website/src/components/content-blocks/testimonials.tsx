'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import type { Testimonial, Testimonials } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@/lib/utils/cn';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { Quote } from 'lucide-react';
import NextImage from 'next/image';
import * as React from 'react';
import Markdown from 'react-markdown';

type Props = {
	blok: Testimonials;
};

type TestimonialWithImage = Testimonial & {
	image: NonNullable<Testimonial['image']> & {
		filename: string;
	};
};

type TestimonialProps = {
	entry: TestimonialWithImage;
};

const Testimonial = ({ entry }: TestimonialProps) => (
	<div className="overflow-hidden rounded-xl bg-white p-3">
		<div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_281px]">
			<div className="flex flex-col justify-between gap-8 p-8 md:p-10">
				<Quote className="text-primary h-12 w-12" aria-hidden="true" />
				<p className="text-foreground text-lg leading-snug lg:text-xl">{entry.quote}</p>
				<div className="flex items-center gap-3">
					<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full md:hidden">
						<NextImage
							src={entry.image.filename}
							alt={`${entry.name} portrait`}
							fill
							sizes="48px"
							className="object-cover"
						/>
					</div>
					<p className="text-foreground text-base font-medium">
						{entry.country ? `${entry.name}, ${entry.country}` : entry.name}
					</p>
				</div>
			</div>
			<div className="relative hidden h-[433px] w-[281px] overflow-hidden rounded-lg md:block">
				<NextImage src={entry.image.filename} alt={`${entry.name} portrait`} fill sizes="281px" className="object-cover" />
			</div>
		</div>
	</div>
);

export const TestimonialsBlock = ({ blok }: Props) => {
	const entries = blok.testimonials.filter((entry): entry is TestimonialWithImage => Boolean(entry.image?.filename));

	const [api, setApi] = React.useState<CarouselApi>();
	const [activeIndex, setActiveIndex] = React.useState(0);

	React.useEffect(() => {
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
