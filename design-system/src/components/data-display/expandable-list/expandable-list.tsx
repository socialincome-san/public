import { ChevronDown } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../../cn';

type ExpandableListProps = {
	children: ReactNode;
};

// The items lay their fields out by the width of the list, not of the viewport
export const ExpandableList = ({ children }: ExpandableListProps) => (
	<ul className="bg-card @container divide-y overflow-hidden rounded-xl border">{children}</ul>
);

type ExpandableListField = {
	label: string;
	value: ReactNode;
	/** Shown below the value while the item is open */
	detail?: ReactNode;
};

type ExpandableListItemProps = {
	title: ReactNode;
	/** A control in front of the title, such as a radio or checkbox; using it does not toggle the item */
	leading?: ReactNode;
	/** Sums the fields up next to the title; in a narrow list it is all a closed item shows of them */
	summary?: ReactNode;
	/** Shown below the title while the item is open, such as a link button; using it does not toggle the item */
	actions?: ReactNode;
	fields: ExpandableListField[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selected?: boolean;
};

// Opening an item never moves its fields. A narrow list hides them while closed and stacks them as rows when
// open; a wide list always shows them side by side and adds the details below each.
export const ExpandableListItem = ({
	title,
	leading,
	summary,
	actions,
	fields,
	open,
	onOpenChange,
	selected = false,
}: ExpandableListItemProps) => (
	// The button inside handles the keyboard; the click handler only widens the tap target to the whole item
	<li className={cn('cursor-pointer p-4 transition-colors', selected && 'bg-muted')} onClick={() => onOpenChange(!open)}>
		<div className="flex items-center gap-3">
			{leading !== undefined && (
				<span className="flex" onClick={(event) => event.stopPropagation()}>
					{leading}
				</span>
			)}
			<button
				type="button"
				aria-expanded={open}
				className="focus-visible:ring-ring flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-sm text-left text-sm font-medium outline-hidden focus-visible:ring-2"
			>
				<span className="min-w-0 flex-1">{title}</span>
				{summary !== undefined && <span className="shrink-0">{summary}</span>}
				<ChevronDown
					aria-hidden
					className={cn(
						'text-muted-foreground size-4 shrink-0 transition-transform motion-reduce:transition-none',
						open && 'rotate-180',
					)}
				/>
			</button>
		</div>

		{open && actions !== undefined && (
			<div className="mt-3 flex" onClick={(event) => event.stopPropagation()}>
				{actions}
			</div>
		)}

		<dl className={cn('mt-4 gap-4 @2xl:grid @2xl:auto-cols-fr @2xl:grid-flow-col', open ? 'grid' : 'hidden')}>
			{fields.map((field) => (
				<div key={field.label} className="min-w-0 border-t pt-4 @2xl:border-t-0 @2xl:pt-0">
					<div className="flex items-center justify-between gap-3 @2xl:flex-col @2xl:items-start @2xl:gap-1">
						<dt className="text-muted-foreground text-xs">{field.label}</dt>
						<dd className="flex">{field.value}</dd>
					</div>
					{open && field.detail !== undefined && <dd className="mt-2 text-sm break-words">{field.detail}</dd>}
				</div>
			))}
		</dl>
	</li>
);
