'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export const DeleteImageDialog = ({ imageId, onDeleted }: { imageId: string | number; onDeleted: () => void }) => {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState(false);

	const deleteImage = async () => {
		setIsDeleting(true);
		setError(false);
		try {
			const response = await fetch(`/api/gallery-images/${imageId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Delete failed');
			setOpen(false);
			onDeleted();
		} catch {
			setError(true);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Delete image"
				onClick={() => {
					setError(false);
					setOpen(true);
				}}
			>
				<Trash2 aria-hidden="true" />
			</Button>
			<Dialog open={open} onOpenChange={setOpen} dismissible={!isDeleting}>
				<DialogContent hideCloseButton>
					<DialogHeader divided={false}>
						<DialogTitle>Delete image?</DialogTitle>
						<DialogDescription>
							This hides the image from the gallery. Other images and versions are not deleted.
						</DialogDescription>
					</DialogHeader>
					{error && (
						<p className="text-destructive text-sm" role="alert">
							Image could not be deleted. Please try again.
						</p>
					)}
					<DialogFooter divided={false}>
						<Button type="button" variant="outline" disabled={isDeleting} onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="button" variant="destructive" disabled={isDeleting} onClick={deleteImage}>
							{isDeleting ? 'Deleting …' : 'Delete image'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
