import { type Ref } from 'react';

export type ChangeListItem = {
	label: string;
	/** `null` when the field had no value before. */
	previous: string | null;
	/** `null` when the field has no value anymore. */
	next: string | null;
};

type ChangeListProps = {
	items: ChangeListItem[];
	ariaLabel?: string;
	/** Read by screen readers before each value. */
	previousLabel?: string;
	nextLabel?: string;
	ref?: Ref<HTMLDListElement>;
};

/** Field changes shown like a diff: the old value struck through in red, the new value in green. */
export const ChangeList = ({ items, ariaLabel, previousLabel = 'Before', nextLabel = 'After', ref }: ChangeListProps) => (
	<dl ref={ref} aria-label={ariaLabel} className="flex min-w-64 flex-col gap-2 text-sm">
		{items.map((item) => (
			<div key={item.label} className="flex flex-col gap-1">
				<dt className="text-muted-foreground text-xs font-medium">{item.label}</dt>
				<dd className="flex flex-wrap items-center gap-1.5">
					{item.previous !== null && (
						<del className="bg-destructive/10 text-destructive rounded-sm px-1.5 py-0.5 break-words">
							<span className="sr-only">{previousLabel}: </span>
							{item.previous}
						</del>
					)}
					{item.previous !== null && item.next !== null && (
						<span className="text-muted-foreground" aria-hidden>
							→
						</span>
					)}
					{item.next !== null && (
						<ins className="bg-confirm/10 text-confirm rounded-sm px-1.5 py-0.5 break-words no-underline">
							<span className="sr-only">{nextLabel}: </span>
							{item.next}
						</ins>
					)}
				</dd>
			</div>
		))}
	</dl>
);
