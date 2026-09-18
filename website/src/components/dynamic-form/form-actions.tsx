import { Button } from '@/components/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { useState } from 'react';

export type ExtraAction = {
	label: string;
	confirmTitle: string;
	confirmDescription: string;
	confirmLabel?: string;
	onConfirm: () => void;
};

type FormActionsProps = {
	mode: 'add' | 'edit' | 'readonly';
	isLoading?: boolean;
	onCancel?: () => void;
	onDelete?: () => void;
	extraAction?: ExtraAction;
};

type ConfirmState = {
	title: string;
	description: string;
	confirmLabel: string;
	variant: 'default' | 'destructive';
	onConfirm: () => void;
};

export const FormActions = ({ mode, isLoading = false, onCancel, onDelete, extraAction }: FormActionsProps) => {
	const [confirm, setConfirm] = useState<ConfirmState | null>(null);
	const showSave = mode !== 'readonly';
	const showSecondaryActions = mode === 'edit' && (onDelete !== undefined || extraAction !== undefined);

	const closeConfirm = () => setConfirm(null);

	return (
		<>
			<div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
				{showSecondaryActions && (
					<div className="mr-auto flex flex-wrap items-center gap-3">
						{onDelete && (
							<Button
								type="button"
								variant="ghost"
								className="text-destructive hover:text-destructive"
								disabled={isLoading}
								onClick={() =>
									setConfirm({
										title: 'Delete item?',
										description: 'This action cannot be undone.',
										confirmLabel: 'Delete permanently',
										variant: 'destructive',
										onConfirm: onDelete,
									})
								}
							>
								Delete
							</Button>
						)}

						{extraAction && (
							<Button
								type="button"
								variant="ghost"
								disabled={isLoading}
								onClick={() =>
									setConfirm({
										title: extraAction.confirmTitle,
										description: extraAction.confirmDescription,
										confirmLabel: extraAction.confirmLabel ?? extraAction.label,
										variant: 'default',
										onConfirm: extraAction.onConfirm,
									})
								}
							>
								{extraAction.label}
							</Button>
						)}
					</div>
				)}

				{(onCancel !== undefined || showSave) && (
					<div className="flex items-center gap-3">
						{onCancel && (
							<Button type="button" variant="outline" disabled={isLoading} onClick={onCancel}>
								Cancel
							</Button>
						)}

						{showSave && (
							<Button type="submit" disabled={isLoading}>
								Save
							</Button>
						)}
					</div>
				)}
			</div>

			<Dialog
				open={confirm !== null}
				onOpenChange={(open) => {
					if (!open) {
						closeConfirm();
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{confirm?.title}</DialogTitle>
					</DialogHeader>

					<p className="text-muted-foreground text-sm">{confirm?.description}</p>

					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={closeConfirm}>
							Cancel
						</Button>
						<Button
							variant={confirm?.variant}
							onClick={() => {
								const onConfirm = confirm?.onConfirm;
								closeConfirm();
								onConfirm?.();
							}}
						>
							{confirm?.confirmLabel}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
