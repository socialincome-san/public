import { Check } from 'lucide-react';
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
		className="bg-secondary text-foreground ring-input/60 focus-visible:ring-ring flex w-full min-w-0 flex-col rounded-2xl text-center ring-1 focus-visible:ring-2 focus-visible:outline-hidden"
	>
		<span
			className={cn(
				'bg-card relative flex flex-1 flex-col items-center justify-center rounded-2xl px-3 pt-5 pb-4 transition-shadow',
				selected ? 'ring-primary ring-2' : 'ring-input/60 ring-1',
			)}
		>
			{selected ? (
				<span className="bg-primary text-primary-foreground absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full">
					<Check className="size-3" strokeWidth={3} aria-hidden />
				</span>
			) : null}
			{label ? <span className="text-muted-foreground text-sm">{label}</span> : null}
			<span className="mt-1 text-2xl font-semibold tracking-tight">{amount}</span>
			{caption ? <span className="text-muted-foreground text-sm">{caption}</span> : null}
		</span>
		<span className="block px-2 py-2.5 text-sm leading-snug">{footer}</span>
	</button>
);
