import { Testimonial } from '@/components/testimonial';
import type { Testimonial as StoryblokTestimonial } from '@/generated/storyblok/types/109655/storyblok-components';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: StoryblokTestimonial;
};

export const TestimonialBlock = ({ blok }: Props) => {
	if (!blok.image?.filename) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<Testimonial entry={blok} />
		</BlockWrapper>
	);
};
