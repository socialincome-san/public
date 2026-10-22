import { type ReactNode } from 'react';
import { cn } from '../../../cn';
import { Button } from '../../actions/button/button';

type FloatingActionBarProps = {
	// Accessible name of the bar's landmark region
	label: string;
	visible: boolean;
	title: string;
	subtitle?: string;
	icon?: ReactNode;
	// Makes the summary a button. Its label should say what clicking it does. Without it the summary is plain text.
	summaryAction?: { label: string; onClick: () => void };
	action: ReactNode;
	// Extra distance from the bottom in px, e.g. to stack above a cookie banner in the same corner
	bottomOffset?: number;
};

export const FloatingActionBar = ({
	label,
	visible,
	title,
	subtitle,
	icon,
	summaryAction,
	action,
	bottomOffset = 0,
}: FloatingActionBarProps) => {
	const summary = (
		<>
			{icon ? <span className="text-muted-foreground flex pr-1 pl-1">{icon}</span> : null}
			<span className="flex flex-col items-start leading-tight">
				<span className="text-foreground text-sm font-bold">{title}</span>
				{subtitle ? <span className="text-muted-foreground text-xs font-normal">{subtitle}</span> : null}
			</span>
		</>
	);

	return (
		<section
			aria-label={label}
			aria-hidden={!visible}
			inert={!visible}
			style={{ marginBottom: bottomOffset }}
			className={cn(
				'bg-background fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex w-fit items-center gap-2 rounded-full p-2 shadow-lg transition-all duration-200 ease-out motion-reduce:transition-none',
				visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
			)}
		>
			{summaryAction ? (
				<Button variant="ghost" size="md" aria-label={summaryAction.label} onClick={summaryAction.onClick}>
					{summary}
				</Button>
			) : (
				<div className="flex items-center gap-2 px-4">{summary}</div>
			)}
			{action}
		</section>
	);
};
