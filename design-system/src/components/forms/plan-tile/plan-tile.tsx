import type { ReactNode } from 'react';
import { cn } from '../../../cn';

type PlanTileProps = {
	label?: string;
	amount: string;
	caption?: string;
	// Stays the same when the tile is selected, so choosing a plan only changes the top part
	footer: ReactNode;
	selected: boolean;
	onSelect: () => void;
	testId?: string;
};

export const PlanTile = ({ label, amount, caption, footer, selected, onSelect, testId }: PlanTileProps) => (
	<button
		type="button"
		data-testid={testId}
		aria-pressed={selected}
		onClick={onSelect}
		className="bg-secondary text-foreground ring-input/60 focus-visible:ring-ring flex w-full min-w-0 flex-col rounded-2xl ring-1 focus-visible:ring-2 focus-visible:outline-hidden"
	>
		<span
			className={cn(
				'bg-card flex flex-1 flex-col rounded-2xl px-4 pt-4 pb-4 text-left shadow-sm transition-shadow',
				selected ? 'ring-primary ring-2' : 'ring-input/60 ring-1',
			)}
		>
			<span className="mb-3 flex items-center justify-between gap-2">
				{label ? (
					<span
						className={cn(
							'rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide uppercase',
							selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
						)}
					>
						{label}
					</span>
				) : (
					<span />
				)}
				<span
					aria-hidden
					className={cn(
						'size-5 shrink-0 rounded-full',
						selected ? 'border-primary bg-card border-[6px]' : 'border-muted-foreground/55 border-[1.5px]',
					)}
				/>
			</span>
			<span className="text-2xl font-semibold tracking-tight">{amount}</span>
			{caption ? <span className="text-muted-foreground text-sm">{caption}</span> : null}
		</span>
		<span className="block px-4 py-2.5 text-left text-sm leading-snug">{footer}</span>
	</button>
);
