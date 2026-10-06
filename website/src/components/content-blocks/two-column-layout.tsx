import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@socialincome/design-system/cn';
import type { ReactNode } from 'react';

type Props = {
	leftColumn?: ReactNode;
	rightColumn?: ReactNode;
	columnRatio?: TwoColumnText['columnRatio'];
	/** Blocks: the columns hold nested CMS blocks, whose own block spacing and width are reset */
	content?: 'text' | 'blocks';
};

const defaultColumnRatio = 'oneThirdTwoThirds';

const widthClassesByColumnRatio = {
	'': { left: 'sm:w-1/3', right: 'sm:w-2/3' },
	oneThirdTwoThirds: { left: 'sm:w-1/3', right: 'sm:w-2/3' },
	halfHalf: { left: 'sm:w-1/2', right: 'sm:w-1/2' },
	twoThirdsOneThird: { left: 'sm:w-2/3', right: 'sm:w-1/3' },
};

const nestedBlockResetClass = '[&>*]:m-0 [&>*]:w-full [&>*]:max-w-none [&>*]:px-0';

export const TwoColumnLayout = ({ leftColumn, rightColumn, columnRatio, content = 'text' }: Props) => {
	if (!leftColumn && !rightColumn) {
		return null;
	}

	const widthClasses = widthClassesByColumnRatio[columnRatio ?? defaultColumnRatio];

	return (
		<div className="text-foreground flex flex-col gap-6 text-lg sm:flex-row sm:gap-14">
			<div className={cn('min-w-0', widthClasses.left, content === 'blocks' && nestedBlockResetClass)}>{leftColumn}</div>
			<div className={cn('min-w-0', widthClasses.right, content === 'blocks' && nestedBlockResetClass)}>{rightColumn}</div>
		</div>
	);
};
