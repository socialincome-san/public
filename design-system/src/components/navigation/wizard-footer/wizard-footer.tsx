import { cva } from 'class-variance-authority';
import { type ReactNode } from 'react';

const footerVariants = cva(
	'flex shrink-0 flex-wrap items-center justify-between gap-3 border-t pt-4 sm:flex-nowrap sm:gap-4',
	{
		variants: {
			// Matches the padding of the container, so the border spans its full width
			edge: {
				flush: '',
				inset: 'px-6',
				bleed: '-mx-6 px-6',
			},
		},
	},
);

const progressVariants = cva('', {
	variants: {
		progressOnMobile: {
			above: 'order-first w-full sm:order-none sm:w-auto',
			hidden: 'hidden sm:block',
		},
	},
});

type WizardFooterProps = {
	back?: ReactNode;
	primary: ReactNode;
	progress?: ReactNode;
	progressOnMobile?: 'above' | 'hidden';
	edge?: 'flush' | 'inset' | 'bleed';
};

export const WizardFooter = ({ back, primary, progress, progressOnMobile = 'above', edge = 'flush' }: WizardFooterProps) => (
	<div className={footerVariants({ edge })}>
		<div className="flex min-w-0 flex-1 justify-start">{back}</div>
		{progress ? <div className={progressVariants({ progressOnMobile })}>{progress}</div> : null}
		<div className="flex min-w-0 flex-1 justify-end">{primary}</div>
	</div>
);
