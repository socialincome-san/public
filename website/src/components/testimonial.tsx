import type { Testimonial as StoryblokTestimonial } from '@/generated/storyblok/types/109655/storyblok-components';
import { QuoteIcon } from '@/components/svg/quote';
import NextImage from 'next/image';

export type TestimonialEntry = StoryblokTestimonial & {
	image: NonNullable<StoryblokTestimonial['image']> & {
		filename: string;
	};
};

type Props = {
	entry: TestimonialEntry;
};

export const Testimonial = ({ entry }: Props) => (
	<div className="bg-card overflow-hidden rounded-xl p-3">
		<div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_281px]">
			<div className="flex flex-col justify-between gap-8 p-8 md:p-10">
				<QuoteIcon className="text-primary h-8 w-auto self-start" />
				<p className="text-foreground text-lg leading-snug lg:text-2xl">{entry.quote}</p>
				<div className="flex items-center gap-3">
					<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full md:hidden">
						<NextImage src={entry.image.filename} alt={entry.image.alt ?? ''} fill sizes="48px" className="object-cover" />
					</div>
					<p className="text-foreground text-base font-medium">
						{entry.country ? `${entry.name}, ${entry.country}` : entry.name}
					</p>
				</div>
			</div>
			<div className="relative hidden h-[433px] w-[281px] overflow-hidden rounded-lg md:block">
				<NextImage src={entry.image.filename} alt={entry.image.alt ?? ''} fill sizes="281px" className="object-cover" />
			</div>
		</div>
	</div>
);
