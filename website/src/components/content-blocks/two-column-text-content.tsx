'use client';

import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';

type Props = {
	leftText?: StoryblokRichtext;
	rightText?: StoryblokRichtext;
};

export const TwoColumnTextContent = ({ leftText, rightText }: Props) => {
	if (!leftText && !rightText) {
		return null;
	}

	return (
		<div className="text-foreground flex flex-col gap-6 text-lg sm:flex-row sm:gap-14">
			<div className="sm:w-1/3">{leftText && <RichTextRenderer richTextDocument={leftText} />}</div>
			<div className="sm:w-2/3">{rightText && <RichTextRenderer richTextDocument={rightText} />}</div>
		</div>
	);
};
