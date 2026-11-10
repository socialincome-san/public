import { type ReactNode } from 'react';
import { cn } from '../../../cn';

type SplitCardProps = {
	children: ReactNode;
	// The right column on a muted surface, e.g. a summary with the main action
	aside: ReactNode;
	// A strip attached below the card, e.g. payment methods or a certification
	footer?: ReactNode;
};

export const SplitCard = ({ children, aside, footer }: SplitCardProps) => (
	// Like the site menu dropdown: the card sits on the secondary base, which shows through as the footer strip
	<div className={cn('flex flex-col overflow-hidden rounded-3xl shadow-md', footer && 'bg-secondary')}>
		<div
			className={cn(
				'bg-card grid overflow-hidden rounded-3xl md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]',
				footer ? 'border-border border-b shadow-xs' : 'border-border border',
			)}
		>
			{/* Both columns spread their blocks over the full card height, so neither ends with an empty gap */}
			<div className="flex min-w-0 flex-col items-start justify-between gap-8 px-6 py-8 md:p-12">{children}</div>
			<div className="bg-muted/40 border-border flex min-w-0 flex-col justify-between gap-8 border-t px-6 py-8 md:border-t-0 md:border-l md:p-12">
				{aside}
			</div>
		</div>
		{footer ? (
			<div className="text-foreground flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 text-sm font-medium md:px-12">
				{footer}
			</div>
		) : null}
	</div>
);
