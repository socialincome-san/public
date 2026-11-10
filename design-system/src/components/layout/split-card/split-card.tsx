import { type ReactNode } from 'react';

type SplitCardProps = {
	children: ReactNode;
	// The right column on a muted surface, such as a summary with the main action
	aside: ReactNode;
	// A strip below the card, such as payment methods
	footer?: ReactNode;
};

export const SplitCard = ({ children, aside, footer }: SplitCardProps) => (
	<div className="bg-secondary shadow-card overflow-hidden rounded-3xl">
		<div className="bg-card border-border grid overflow-hidden rounded-3xl border md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
			<div className="flex flex-col justify-between gap-8 px-6 py-8 md:p-12">{children}</div>
			<div className="bg-muted/40 border-border flex flex-col justify-between gap-8 border-t px-6 py-8 md:border-t-0 md:border-l md:p-12">
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
