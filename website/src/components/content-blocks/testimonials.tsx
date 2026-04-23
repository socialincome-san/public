'use client';

import * as React from 'react';
import { BlockWrapper } from '@/components/block-wrapper';
import type { Testimonial, Testimonials } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@/lib/utils/cn';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';
import Markdown from 'react-markdown';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/ui/carousel";
import { Quote } from 'lucide-react';
const IMAGE_WIDTH = 281;
const IMAGE_FRAME_CLASS = 'relative mx-auto h-[433px] w-[281px] max-w-full overflow-hidden rounded-lg border border-white';

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
				<Quote className="h-12 w-12 text-primary" aria-hidden="true" />
				<p className="text-lg leading-snug text-foreground lg:text-xl">{entry.quote}</p>
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
					<p className="text-base font-medium text-foreground">
						{entry.country ? `${entry.name}, ${entry.country}` : entry.name}
					</p>
				</div>
			</div>
			<div className={`hidden md:block ${IMAGE_FRAME_CLASS} md:mx-0`}>
				<NextImage
					src={entry.image.filename}
					alt={`${entry.name} portrait`}
					fill
					sizes={`${IMAGE_WIDTH}px`}
					className="object-cover"
				/>
			</div>
		</div>
	</div>
);

export const TestimonialsBlock = ({ blok }: Props) => {
	const entries = blok.testimonials
		.filter((entry): entry is TestimonialWithImage => Boolean(entry.image?.filename));

	if (entries.length === 0) {
		return null;
	}

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
							<CarouselItem key={entry._uid ?? `${entry.name}-${index}`} className="basis-full md:basis-4/5 lg:basis-3/5 ">
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
