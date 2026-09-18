import type { TwoColumnText } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ReactNode } from 'react';

type Props = {
	leftColumn?: ReactNode;
	rightColumn?: ReactNode;
	columnRatio?: TwoColumnText['columnRatio'];
	columnClassName?: string;
};

const defaultColumnRatio = 'oneThirdTwoThirds';

const widthClassesByColumnRatio = {
	'': { left: 'sm:w-1/3', right: 'sm:w-2/3' },
	oneThirdTwoThirds: { left: 'sm:w-1/3', right: 'sm:w-2/3' },
	halfHalf: { left: 'sm:w-1/2', right: 'sm:w-1/2' },
	twoThirdsOneThird: { left: 'sm:w-2/3', right: 'sm:w-1/3' },
};

export const TwoColumnLayout = ({ leftColumn, rightColumn, columnRatio, columnClassName }: Props) => {
	if (!leftColumn && !rightColumn) {
		return null;
	}

	const widthClasses = widthClassesByColumnRatio[columnRatio ?? defaultColumnRatio];

	return (
		<div className="text-foreground flex flex-col gap-6 text-lg sm:flex-row sm:gap-14">
			<div className={`min-w-0 ${widthClasses.left} ${columnClassName ?? ''}`}>{leftColumn}</div>
			<div className={`min-w-0 ${widthClasses.right} ${columnClassName ?? ''}`}>{rightColumn}</div>
		</div>
	);
};
