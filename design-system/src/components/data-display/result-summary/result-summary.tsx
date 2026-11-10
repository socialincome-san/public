import { type ReactNode } from 'react';

type ResultSummaryProps = {
	label: string;
	// Set small and muted before the value, like in AmountSlider
	currency?: string;
	value: string;
	suffix?: string;
	// Below the value, e.g. a projection or a short explanation
	children?: ReactNode;
};

export const ResultSummary = ({ label, currency, value, suffix, children }: ResultSummaryProps) => (
	<div className="flex flex-col gap-2" aria-live="polite">
		<span className="text-muted-foreground text-sm font-medium">{label}</span>
		<div className="flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3">
			{currency ? <span className="text-muted-foreground text-lg leading-none sm:text-xl">{currency}</span> : null}
			<span className="text-primary text-5xl leading-none font-medium tracking-tight sm:text-6xl lg:text-7xl">{value}</span>
			{suffix ? <span className="text-muted-foreground text-lg">{suffix}</span> : null}
		</div>
		{children ? <div className="text-muted-foreground text-sm leading-5">{children}</div> : null}
	</div>
);
