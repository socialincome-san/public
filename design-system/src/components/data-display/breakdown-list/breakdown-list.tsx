import { type ReactNode, type Ref } from 'react';

type BreakdownListProps = {
	children: ReactNode;
	ariaLabel?: string;
	ref?: Ref<HTMLUListElement>;
};

export const BreakdownList = ({ children, ariaLabel, ref }: BreakdownListProps) => (
	<ul ref={ref} className="flex w-full list-none flex-col gap-6 pl-0 sm:gap-7" aria-label={ariaLabel}>
		{children}
	</ul>
);

type BreakdownRowProps = {
	label: string;
	value: string;
	description: string;
	// A colour dot that links the row to a chart segment
	markerColor?: string;
	// Below the text, e.g. a progress bar
	children?: ReactNode;
};

export const BreakdownRow = ({ label, value, description, markerColor, children }: BreakdownRowProps) => (
	<li className="flex w-full flex-col gap-2">
		<div className="flex flex-col gap-1">
			<div className="flex items-baseline justify-between gap-4">
				<span className="text-foreground flex min-w-0 items-center gap-2 text-base leading-6 font-medium">
					{markerColor ? (
						<span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: markerColor }} aria-hidden />
					) : null}
					{label}
				</span>
				<span className="text-foreground shrink-0 text-base leading-6 font-medium tabular-nums">{value}</span>
			</div>
			<p className="text-muted-foreground text-sm leading-5">{description}</p>
		</div>
		{children}
	</li>
);
