'use client';

import { Button } from '@/components/button';
import { ActionMenu, type ActionMenuItem } from '@/components/data-table/elements/action-menu';
import DOMPurify from 'isomorphic-dompurify';
import { InboxIcon } from 'lucide-react';

type DataTableEmptyStateProps = {
	emptyMessage: string;
	actions?: ActionMenuItem[];
};

export const DataTableEmptyState = ({ emptyMessage, actions = [] }: DataTableEmptyStateProps) => {
	const singleAction = actions.length === 1 ? actions[0] : undefined;

	return (
		<div className="border-border/60 bg-muted/20 rounded-md border p-8 text-center">
			<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border">
				<InboxIcon className="text-muted-foreground size-5" />
			</div>
			<div
				className="text-muted-foreground mb-4 text-sm"
				dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emptyMessage) }}
			></div>
			{singleAction ? (
				<Button
					disabled={singleAction.disabled}
					onClick={() => {
						if (singleAction.onSelect) {
							singleAction.onSelect();
							return;
						}
						if (singleAction.href) {
							window.location.href = singleAction.href;
						}
					}}
				>
					{singleAction.icon}
					<span>{singleAction.label}</span>
				</Button>
			) : actions.length > 1 ? (
				<div className="flex justify-center">
					<ActionMenu items={actions} />
				</div>
			) : null}
		</div>
	);
};
