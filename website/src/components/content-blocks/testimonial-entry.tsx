import { Testimonial } from '@/components/testimonial';
import type { Testimonial as StoryblokTestimonial } from '@/generated/storyblok/types/109655/storyblok-components';
import { BlockWrapper } from '@socialincome/design-system/block-wrapper/block-wrapper';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: StoryblokTestimonial;
};

export const TestimonialBlock = ({ blok }: Props) => {
	if (!blok.image?.filename) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<Testimonial entry={blok} />
		</BlockWrapper>
	);
};
