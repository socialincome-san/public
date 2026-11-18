import { type ReactNode } from 'react';

type ItemCardStat = {
	label: string;
	value: string;
};

type ItemCardProps = {
	title: string;
	// Status badges next to the title
	badges?: ReactNode;
	stats: ItemCardStat[];
	actions?: ReactNode;
};

export const ItemCard = ({ title, badges, stats, actions }: ItemCardProps) => (
	<article className="border-border bg-background flex flex-col gap-4 rounded-xl border p-4 sm:p-6">
		<header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
			<div className="flex min-w-0 flex-col gap-2">
				<h3 className="text-foreground text-base font-semibold break-words">{title}</h3>
				{badges ? <div className="flex flex-wrap gap-1.5">{badges}</div> : null}
			</div>
			{actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
		</header>
		{stats.length > 0 ? (
			<dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
				{stats.map((stat) => (
					<div key={stat.label} className="flex flex-col gap-0.5">
						<dt className="text-muted-foreground text-xs">{stat.label}</dt>
						<dd className="text-foreground text-sm font-medium">{stat.value}</dd>
					</div>
				))}
			</dl>
		) : null}
	</article>
);
