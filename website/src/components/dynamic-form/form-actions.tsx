import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { useState } from 'react';

type FormActionsProps = {
	mode: 'add' | 'edit' | 'readonly';
	isLoading?: boolean;
	onCancel?: () => void;
	onDelete?: () => void;
};

export function FormActions({ mode, isLoading = false, onCancel, onDelete }: FormActionsProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const showSave = mode !== 'readonly';
	const showCancel = Boolean(onCancel);
	const showDelete = mode === 'edit' && Boolean(onDelete);

	return (
		<>
			<div className="flex items-center justify-end gap-3">
				{showDelete && (
					<Button
						type="button"
						variant="ghost"
						className="text-destructive hover:text-destructive"
						disabled={isLoading}
						onClick={() => setConfirmOpen(true)}
					>
						Delete
					</Button>
				)}

				{showCancel && (
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

			{showDelete && (
				<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete item?</DialogTitle>
						</DialogHeader>

						<p className="text-muted-foreground text-sm">This action cannot be undone.</p>

						<div className="mt-4 flex justify-end gap-2">
							<Button variant="outline" onClick={() => setConfirmOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									setConfirmOpen(false);
									onDelete?.();
								}}
							>
								Delete permanently
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
