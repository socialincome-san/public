import { Button } from '@/components/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { useState } from 'react';

type FormActionsProps = {
	mode: 'add' | 'edit' | 'readonly';
	isLoading?: boolean;
	onCancel?: () => void;
	onDelete?: () => void;
	onRemoveFromProgram?: () => void;
};

export const FormActions = ({ mode, isLoading = false, onCancel, onDelete, onRemoveFromProgram }: FormActionsProps) => {
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [confirmRemoveFromProgramOpen, setConfirmRemoveFromProgramOpen] = useState(false);

	const showSave = mode !== 'readonly';
	const showCancel = Boolean(onCancel);
	const showDelete = mode === 'edit' && Boolean(onDelete);
	const showRemoveFromProgram = mode === 'edit' && Boolean(onRemoveFromProgram);

	return (
		<>
			<div className="flex flex-col gap-3">
				{(showRemoveFromProgram || showDelete) && (
					<div className="flex flex-wrap items-center justify-end gap-3">
						{showDelete && (
							<Button
								type="button"
								variant="ghost"
								className="text-destructive hover:text-destructive"
								disabled={isLoading}
								onClick={() => setConfirmDeleteOpen(true)}
							>
								Delete Recipient
							</Button>
						)}
						{showRemoveFromProgram && (
							<Button
								type="button"
								variant="outline"
								disabled={isLoading}
								onClick={() => setConfirmRemoveFromProgramOpen(true)}
							>
								Remove from program
							</Button>
						)}
					</div>
				)}

				<div className="flex flex-wrap items-center justify-end gap-3">
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
			</div>

			{showDelete && (
				<Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete item?</DialogTitle>
						</DialogHeader>

						<p className="text-muted-foreground text-sm">This action cannot be undone.</p>

						<div className="mt-4 flex justify-end gap-2">
							<Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									setConfirmDeleteOpen(false);
									onDelete?.();
								}}
							>
								Delete permanently
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{showRemoveFromProgram && (
				<Dialog open={confirmRemoveFromProgramOpen} onOpenChange={setConfirmRemoveFromProgramOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Remove from program?</DialogTitle>
						</DialogHeader>

						<p className="text-muted-foreground text-sm">
							The recipient stays in the pool and can be reassigned to a program later. This is only possible for recipients
							without payouts.
						</p>

						<div className="mt-4 flex justify-end gap-2">
							<Button variant="outline" onClick={() => setConfirmRemoveFromProgramOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									setConfirmRemoveFromProgramOpen(false);
									onRemoveFromProgram?.();
								}}
							>
								Remove from program
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};
