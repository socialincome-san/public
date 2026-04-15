import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: TwoColumnText;
};

export const TwoColumnTextBlock = ({ blok }: Props) => {
	if (!blok.left_text && !blok.right_text) {
		return null;
	}

	return (
		<BlockWrapper
			{...storyblokEditable(blok as SbBlokData)}
			className="flex flex-col gap-6 text-lg text-black sm:flex-row sm:gap-14"
		>
			<div className="sm:w-1/3">
				{blok.left_text ? <RichTextRenderer richTextDocument={blok.left_text as StoryblokRichtext} /> : null}
			</div>
			<div className="sm:w-2/3">
				{blok.right_text ? <RichTextRenderer richTextDocument={blok.right_text as StoryblokRichtext} /> : null}
			</div>
		</BlockWrapper>
	);
};
