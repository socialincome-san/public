import { type ReactNode } from 'react';

type CalloutProps = {
	title: string;
	description?: string;
	// e.g. a small button or link
	action?: ReactNode;
};

export const Callout = ({ title, description, action }: CalloutProps) => (
	<div className="bg-muted flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
		<div className="flex min-w-0 flex-col gap-0.5">
			<p className="text-foreground text-sm font-medium">{title}</p>
			{description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
		</div>
		{action ? <div className="shrink-0">{action}</div> : null}
	</div>
);
