'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import type { Testimonials } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';
import { useState } from 'react';
import Markdown from 'react-markdown';

const IMAGE_WIDTH = 281;
const IMAGE_FRAME_CLASS = 'relative mx-auto h-[433px] w-[281px] max-w-full overflow-hidden rounded-lg border border-white';

type Props = {
	blok: Testimonials;
};

type Entry = {
	name: string;
	text: string;
	country: string;
	image: string;
};

type PreviewButtonProps = {
	entry: Entry;
	onClick: () => void;
	className: string;
	ariaLabel: string;
};

const PreviewButton = ({ entry, onClick, className, ariaLabel }: PreviewButtonProps) => (
	<button type="button" onClick={onClick} className={className} aria-label={ariaLabel}>
		<div className={IMAGE_FRAME_CLASS}>
			<NextImage src={entry.image} alt={`${entry.name} portrait`} fill sizes={`${IMAGE_WIDTH}px`} className="object-cover" />
		</div>
	</button>
);

export const TestimonialsBlock = ({ blok }: Props) => {
	if (!blok.testimonials?.length) {
		return null;
	}

	const entries = blok.testimonials
		.map<Entry | null>((testimonial) => {
			if (!testimonial.image?.filename) {
				return null;
			}

			return {
				name: testimonial.name,
				text: testimonial.quote,
				country: testimonial.country ?? '',
				image: testimonial.image.filename,
			};
		})
		.filter((entry): entry is Entry => entry !== null);

	if (entries.length === 0) {
		return null;
	}

	const [activeIndex, setActiveIndex] = useState(0);
	const wrapIndex = (index: number) => (index + entries.length) % entries.length;
	const activeEntry = entries[activeIndex];
	const previousEntry = entries[wrapIndex(activeIndex - 1)];
	const nextEntry = entries[wrapIndex(activeIndex + 1)];
	const showSidePreviews = entries.length > 1;

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="space-y-8">
				{blok.heading && (
					<h2 className="text-center text-4xl xl:text-5xl [&_strong]:font-bold">
						<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.heading}</Markdown>
					</h2>
				)}
				<div className="flex items-start gap-4">
					{showSidePreviews && (
						<PreviewButton
							entry={previousEntry}
							onClick={() => setActiveIndex(wrapIndex(activeIndex - 1))}
							className="hidden shrink-0 rounded-xl bg-white p-3 lg:block lg:w-1/5"
							ariaLabel="Show previous testimonial"
						/>
					)}

					<article className="overflow-hidden rounded-xl bg-white p-3 md:w-3/4 lg:w-3/5">
						<div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_281px]">
							<div className="flex flex-col justify-between gap-8 p-8 md:p-10">
								<p className="text-5xl leading-none text-primary">“</p>
								<p className="text-lg leading-snug text-foreground lg:text-xl">{activeEntry.text}</p>
								<p className="text-base font-medium text-foreground">
									{activeEntry.country ? `${activeEntry.name}, ${activeEntry.country}` : activeEntry.name}
								</p>
							</div>
							<div className={`${IMAGE_FRAME_CLASS} md:mx-0`}>
								<NextImage
									src={activeEntry.image}
									alt={`${activeEntry.name} portrait`}
									fill
									sizes={`${IMAGE_WIDTH}px`}
									className="object-cover"
								/>
							</div>
						</div>
					</article>

					{showSidePreviews && (
						<PreviewButton
							entry={nextEntry}
							onClick={() => setActiveIndex(wrapIndex(activeIndex + 1))}
							className="hidden shrink-0 rounded-xl bg-white p-3 md:block md:w-1/4 lg:w-1/5"
							ariaLabel="Show next testimonial"
						/>
					)}
				</div>

				{entries.length > 1 && (
					<div className="flex items-center justify-center gap-4">
						{entries.map((entry, index) => (
							<button
								key={`${entry.name}-${index}`}
								type="button"
								onClick={() => setActiveIndex(index)}
								className={`h-1.5 w-16 rounded-full transition ${index === activeIndex ? 'bg-primary' : 'bg-primary/25'}`}
								aria-label={`Show testimonial ${index + 1}`}
							/>
						))}
					</div>
				)}
			</div>
		</BlockWrapper>
	);
};
