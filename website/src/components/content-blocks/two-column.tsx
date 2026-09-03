import { BlockWrapper } from '@/components/block-wrapper';
import { TwoColumnLayout } from '@/components/content-blocks/two-column-layout';
import type { TwoColumn } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { ReactNode } from 'react';

type Props = {
	blok: TwoColumn;
	leftColumn?: ReactNode;
	rightColumn?: ReactNode;
};

const nestedBlockClassName = '[&>*]:m-0 [&>*]:w-full [&>*]:max-w-none [&>*]:px-0';

export const TwoColumnBlock = ({ blok, leftColumn, rightColumn }: Props) => {
	const { columnRatio, disableMarginBottom, disableMarginTop } = blok;

	if (!leftColumn && !rightColumn) {
		return null;
	}

	return (
		<BlockWrapper
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
			{...storyblokEditable(blok as SbBlokData)}
		>
			<TwoColumnLayout
				leftColumn={leftColumn}
				rightColumn={rightColumn}
				columnRatio={columnRatio}
				columnClassName={nestedBlockClassName}
			/>
		</BlockWrapper>
	);
};
