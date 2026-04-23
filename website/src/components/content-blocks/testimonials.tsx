'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import type { Testimonial, Testimonials } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';
import Markdown from 'react-markdown';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
const IMAGE_WIDTH = 281;
const IMAGE_FRAME_CLASS = 'relative mx-auto h-[433px] w-[281px] max-w-full overflow-hidden rounded-lg border border-white';

type Props = {
	blok: Testimonials;
};


type TestimonialProps = {
	entry: Testimonial;
};

const Testimonial = ({ entry }: TestimonialProps) => (
	<div className="overflow-hidden rounded-xl bg-white p-3">
		<div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_281px]">
			<div className="flex flex-col justify-between gap-8 p-8 md:p-10">
				<p className="text-5xl leading-none text-primary">“</p>
				<p className="text-lg leading-snug text-foreground lg:text-xl">{entry.quote}</p>
				<p className="text-base font-medium text-foreground">
					{entry.country ? `${entry.name}, ${entry.country}` : entry.name}
				</p>
			</div>
			<div className={`${IMAGE_FRAME_CLASS} md:mx-0`}>
				<NextImage
					src={entry.image.filename!}
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
	if (!blok.testimonials?.length) {
		return null;
	}

	const entries = blok.testimonials
		.filter((entry): Boolean => Boolean(entry.image?.filename));

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
				<Carousel opts={{
					align: "center",
					loop: true,
				}}>
					<CarouselContent>
						{entries.map((entry) => (
							<CarouselItem className="basis-full md:basis-4/5 lg:basis-3/5">
								<Testimonial key={entry.name} entry={entry} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>



			</div>
		</BlockWrapper>
	);
};
