'use client';

import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';

type Props = {
	leftText?: StoryblokRichtext;
	rightText?: StoryblokRichtext;
	columnRatio?: TwoColumnText['columnRatio'];
};

const defaultColumnRatio = 'oneThirdTwoThirds';

const widthClassesByColumnRatio = {
	'': { left: 'sm:w-1/3', right: 'sm:w-2/3' },
	oneThirdTwoThirds: { left: 'sm:w-1/3', right: 'sm:w-2/3' },
	halfHalf: { left: 'sm:w-1/2', right: 'sm:w-1/2' },
	twoThirdsOneThird: { left: 'sm:w-2/3', right: 'sm:w-1/3' },
};

export const TwoColumnTextContent = ({ leftText, rightText, columnRatio }: Props) => {
	if (!leftText && !rightText) {
		return null;
	}

	const widthClasses = widthClassesByColumnRatio[columnRatio ?? defaultColumnRatio];

	return (
		<div className="text-foreground flex flex-col gap-6 text-lg sm:flex-row sm:gap-14">
			<div className={widthClasses.left}>{leftText && <RichTextRenderer richTextDocument={leftText} />}</div>
			<div className={widthClasses.right}>{rightText && <RichTextRenderer richTextDocument={rightText} />}</div>
		</div>
	);
};
