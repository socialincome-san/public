import { BlockWrapper } from '@/components/block-wrapper';
import { TwoColumnTextContent } from '@/components/content-blocks/two-column-text-content';
import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: TwoColumnText;
};

export const TwoColumnTextBlock = ({ blok }: Props) => {
	const { columnRatio, disableMarginBottom, disableMarginTop, leftText, rightText } = blok;

	if (!leftText && !rightText) {
		return null;
	}

	return (
		<BlockWrapper
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
			{...storyblokEditable(blok as SbBlokData)}
		>
			<TwoColumnTextContent leftText={leftText} rightText={rightText} columnRatio={columnRatio} />
		</BlockWrapper>
	);
};
