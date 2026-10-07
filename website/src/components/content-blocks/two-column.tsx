import { TwoColumnLayout } from '@/components/content-blocks/two-column-layout';
import type { TwoColumn } from '@/generated/storyblok/types/109655/storyblok-components';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import type { ReactNode } from 'react';

type Props = {
	blok: TwoColumn;
	leftColumn?: ReactNode;
	rightColumn?: ReactNode;
};

export const TwoColumnBlock = ({ blok, leftColumn, rightColumn }: Props) => {
	const { columnRatio, marginBottom, marginTop } = blok;

	if (!leftColumn && !rightColumn) {
		return null;
	}

	return (
		<BlockWrapper marginBottom={marginBottom} marginTop={marginTop} {...storyblokEditable(blok)}>
			<TwoColumnLayout leftColumn={leftColumn} rightColumn={rightColumn} columnRatio={columnRatio} content="blocks" />
		</BlockWrapper>
	);
};
