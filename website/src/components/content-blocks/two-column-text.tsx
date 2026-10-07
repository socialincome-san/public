import { TwoColumnTextContent } from '@/components/content-blocks/two-column-text-content';
import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: TwoColumnText;
};

export const TwoColumnTextBlock = ({ blok }: Props) => {
	const { columnRatio, marginBottom, marginTop, leftText, rightText } = blok;

	if (!leftText && !rightText) {
		return null;
	}

	return (
		<BlockWrapper marginBottom={marginBottom} marginTop={marginTop} {...storyblokEditable(blok)}>
			<TwoColumnTextContent leftText={leftText} rightText={rightText} columnRatio={columnRatio} />
		</BlockWrapper>
	);
};
