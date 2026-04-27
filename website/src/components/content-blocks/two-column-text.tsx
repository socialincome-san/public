import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: TwoColumnText;
};

export const TwoColumnTextBlock = ({ blok }: Props) => {
	if (!blok.leftText && !blok.rightText) {
		return null;
	}

	return (
		<BlockWrapper
			{...storyblokEditable(blok as SbBlokData)}
			className="flex flex-col gap-6 text-lg text-black sm:flex-row sm:gap-14"
		>
			<div className="sm:w-1/3">
				{blok.leftText ? <RichTextRenderer richTextDocument={blok.leftText as StoryblokRichtext} /> : null}
			</div>
			<div className="sm:w-2/3">
				{blok.rightText ? <RichTextRenderer richTextDocument={blok.rightText as StoryblokRichtext} /> : null}
			</div>
		</BlockWrapper>
	);
};
