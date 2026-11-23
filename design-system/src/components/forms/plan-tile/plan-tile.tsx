import { useId, type ReactNode } from 'react';
import { cn } from '../../../cn';
import { Badge } from '../../data-display/badge/badge';

type PlanTileProps = {
	label?: string;
	amount: string;
	// Muted right after the amount, e.g. "/month"
	amountSuffix?: string;
	caption?: string;
	// A second, muted line under the caption, e.g. why that plan helps
	captionNote?: string;
	// A secondary fact under the amount, e.g. the yearly total
	detail?: string;
	// A short benefit under the amount, shown as a mint badge, e.g. "Double the impact"
	highlight?: string;
	footer: ReactNode;
	// An interactive element at the end of the footer, e.g. an InfoTooltip explaining it
	footerAction?: ReactNode;
	selected: boolean;
	onSelect: () => void;
	testId?: string;
};

export const PlanTile = ({
	label,
	amount,
	amountSuffix,
	caption,
	captionNote,
	detail,
	highlight,
	footer,
	footerAction,
	selected,
	onSelect,
	testId,
}: PlanTileProps) => {
	const contentId = useId();
	const footerId = useId();

	return (
		<div
			className={cn(
				'bg-secondary text-foreground relative flex w-full min-w-0 flex-col rounded-2xl transition-shadow',
				selected ? 'ring-primary ring-2' : 'ring-input/60 ring-1',
			)}
		>
			{/* An overlay over the whole tile, so the footer selects too; footerAction sits above it */}
			<button
				type="button"
				data-testid={testId}
				aria-pressed={selected}
				aria-labelledby={contentId}
				aria-describedby={footerId}
				onClick={onSelect}
				className="focus-visible:ring-ring absolute inset-0 rounded-2xl outline-hidden focus-visible:ring-2"
			/>
			<div id={contentId} className="bg-card ring-input/60 flex flex-1 flex-col rounded-2xl px-4 pt-4 pb-5 shadow-sm ring-1">
				<span className="mb-3 flex items-center justify-between gap-2">
					{label ? <Badge variant={selected ? 'primary-outline' : 'default'}>{label}</Badge> : <span />}
					<span
						aria-hidden
						className={cn(
							'size-5 shrink-0 rounded-full',
							selected ? 'border-primary bg-card border-[6px]' : 'border-muted-foreground/55 border-[1.5px]',
						)}
					/>
				</span>
				<span className="flex items-baseline gap-1">
					<span className="text-2xl font-semibold tracking-tight">{amount}</span>
					{amountSuffix ? <span className="text-muted-foreground text-sm">{amountSuffix}</span> : null}
				</span>
				{caption ? <span className="text-muted-foreground mt-1.5 text-sm">{caption}</span> : null}
				{captionNote ? <span className="text-muted-foreground text-sm">{captionNote}</span> : null}
				{highlight ? (
					<span className="mt-3 flex">
						<Badge variant="positive">{highlight}</Badge>
					</span>
				) : null}
				{detail ? <span className="border-input/60 text-muted-foreground mt-3 border-t pt-3 text-sm">{detail}</span> : null}
			</div>
			{/* Inline, so the action wraps with the last word when the footer runs onto two lines */}
			<span className="block px-4 py-3 text-xs leading-snug sm:text-sm">
				<span id={footerId}>{footer}</span>
				{footerAction ? <span className="relative z-10 ml-1.5 inline-flex align-middle">{footerAction}</span> : null}
			</span>
		</div>
	);
};
