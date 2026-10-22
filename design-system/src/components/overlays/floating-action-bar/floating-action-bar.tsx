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
	// Accessible name of the summary button, which should say what clicking it does
	summaryLabel: string;
	onSummaryClick: () => void;
	action: ReactNode;
};

export const FloatingActionBar = ({
	label,
	visible,
	title,
	subtitle,
	icon,
	summaryLabel,
	onSummaryClick,
	action,
}: FloatingActionBarProps) => (
	<section
		aria-label={label}
		aria-hidden={!visible}
		inert={!visible}
		className={cn(
			'bg-background fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex w-fit items-center gap-2 rounded-full p-2 shadow-lg transition-all duration-200 ease-out motion-reduce:transition-none',
			visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
		)}
	>
		<Button variant="ghost" size="md" aria-label={summaryLabel} onClick={onSummaryClick}>
			{icon ? <span className="text-muted-foreground flex pr-1 pl-1">{icon}</span> : null}
			<span className="flex flex-col items-start leading-tight">
				<span className="text-foreground text-sm font-bold">{title}</span>
				{subtitle ? <span className="text-muted-foreground text-xs font-normal">{subtitle}</span> : null}
			</span>
		</Button>
		{action}
	</section>
);
