import { InboxIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../../cn';
import { dataTableStableMinHeight } from '../data-table/data-table';

type DataTableErrorStateProps = {
	message: ReactNode;
};

export const DataTableErrorState = ({ message }: DataTableErrorStateProps) => (
	<div className={cn('flex items-center', dataTableStableMinHeight)}>
		<div className="text-destructive border-destructive/20 bg-destructive-foreground w-full rounded-md border p-4">
			<p className="font-medium">Could not load table data.</p>
			<p className="mt-1 text-sm">{message}</p>
		</div>
	</div>
);

type DataTableMessageProps = {
	message: ReactNode;
};

/** Shown when the dataset itself has no rows */
export const DataTableEmptyState = ({ message }: DataTableMessageProps) => (
	<div className={cn('flex items-start pt-2', dataTableStableMinHeight)}>
		<div className="w-full">
			<div className="border-border/60 bg-muted/20 rounded-md border p-8 text-center">
				<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border">
					<InboxIcon className="text-muted-foreground size-5" />
				</div>
				<div className="text-muted-foreground mb-4 text-sm">{message}</div>
			</div>
		</div>
	</div>
);

/** Shown when rows exist but the current search or filters match none of them */
export const DataTableNoResults = ({ message }: DataTableMessageProps) => (
	<div className={cn('flex items-start pt-2', dataTableStableMinHeight)}>
		<div className="text-muted-foreground w-full p-4">{message}</div>
	</div>
);
