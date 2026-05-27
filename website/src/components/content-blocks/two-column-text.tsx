import { BlockWrapper } from '@/components/block-wrapper';
import { TwoColumnTextContent } from '@/components/content-blocks/two-column-text-content';
import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: TwoColumnText;
};

export const TwoColumnTextBlock = ({ blok }: Props) => {
	const leftText = blok.leftText as StoryblokRichtext | undefined;
	const rightText = blok.rightText as StoryblokRichtext | undefined;

	if (!leftText && !rightText) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<TwoColumnTextContent leftText={leftText} rightText={rightText} />
		</BlockWrapper>
	);
};
