import { type ReactNode } from 'react';

type AmountDisplayProps = {
	label: string;
	currency: string;
	// Already formatted for the visitor's locale
	value: string;
	// After the value, such as "per month"
	suffix?: string;
	// Below the value, such as a projection
	children?: ReactNode;
};

export const AmountDisplay = ({ label, currency, value, suffix, children }: AmountDisplayProps) => (
	<div className="flex flex-col gap-2">
		<span className="text-muted-foreground text-sm font-medium">{label}</span>
		<p className="flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3">
			<span className="text-muted-foreground text-lg leading-none sm:text-xl">{currency}</span>
			<span className="text-primary text-5xl leading-none font-medium tracking-tight sm:text-6xl lg:text-7xl">{value}</span>
			{suffix ? <span className="text-muted-foreground text-lg">{suffix}</span> : null}
		</p>
		{children ? <div className="text-muted-foreground text-sm">{children}</div> : null}
	</div>
);
