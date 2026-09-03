'use client';

import { TwoColumnLayout } from '@/components/content-blocks/two-column-layout';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';

type Props = {
	leftText?: StoryblokRichtext;
	rightText?: StoryblokRichtext;
	columnRatio?: TwoColumnText['columnRatio'];
};

export const TwoColumnTextContent = ({ leftText, rightText, columnRatio }: Props) => {
	if (!leftText && !rightText) {
		return null;
	}

	return (
		<TwoColumnLayout
			leftColumn={leftText && <RichTextRenderer richTextDocument={leftText} />}
			rightColumn={rightText && <RichTextRenderer richTextDocument={rightText} />}
			columnRatio={columnRatio}
		/>
	);
};
