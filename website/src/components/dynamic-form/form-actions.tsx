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

	const isEdit = mode === 'edit';
	const showSave = mode !== 'readonly';

	return (
		<>
			<div className="flex items-center justify-end gap-3">
				{isEdit && onDelete && (
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

				{isEdit && extraAction && (
					<Button
						type="button"
						variant="outline"
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

			<Dialog
				open={confirm !== null}
				onOpenChange={(open) => {
					if (!open) {
						setConfirm(null);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{confirm?.title}</DialogTitle>
					</DialogHeader>

					<p className="text-muted-foreground text-sm">{confirm?.description}</p>

					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={() => setConfirm(null)}>
							Cancel
						</Button>
						<Button
							variant={confirm?.variant}
							onClick={() => {
								const onConfirm = confirm?.onConfirm;
								setConfirm(null);
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
