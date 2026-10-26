'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog, type TabbedDialogTab } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import type { ReactNode } from 'react';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	/** Shown after the "Details" tab with `children`, e.g. related records and the audit log of an existing record. */
	tabs?: TabbedDialogTab[];
	children: ReactNode;
};

// Without tabs it keeps the width of TabbedDialog, so adding and editing a record look alike.
export const RecordDialog = ({ open, onOpenChange, title, tabs = [], children }: Props) =>
	tabs.length > 0 ? (
		<TabbedDialog
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			tabs={[{ value: 'details', label: 'Details', content: children }, ...tabs]}
		/>
	) : (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
