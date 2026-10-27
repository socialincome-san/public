'use client';

import { MAX_COMMENT_LENGTH, MAX_IMAGE_COMMENTS } from '@/lib/image-comments';
import { type GalleryImage, imageUrl, type SavedImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	type ImageComment,
	ImageCommentEditor,
} from '@socialincome/design-system/forms/image-comment-editor/image-comment-editor';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { MessageSquarePlus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { requestImage } from './request-image';

type ImageEditDialogProps = {
	imageId: GalleryImage['id'];
	size: 'sm' | 'md';
	onEdited: (image: SavedImage) => void;
};

/** Comments on an image become a new version in the gallery; the dialog then shows that version for further rounds. */
export const ImageEditDialog = ({ imageId, size, onEdited }: ImageEditDialogProps) => {
	const [open, setOpen] = useState(false);
	const [currentId, setCurrentId] = useState(imageId);
	const [comments, setComments] = useState<ImageComment[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [hasNewVersion, setHasNewVersion] = useState(false);
	const [isPending, startTransition] = useTransition();
	const canApply = !isPending && comments.length > 0 && comments.every((comment) => comment.text.trim());

	const applyComments = () =>
		startTransition(async () => {
			const result = await requestImage(
				'/api/edit-image',
				JSON.stringify({ imageId: String(currentId), comments: comments.map(({ x, y, text }) => ({ x, y, text })) }),
			);
			if ('error' in result) {
				setError(result.error);
				return;
			}
			setError(null);
			setCurrentId(result.image.id);
			setComments([]);
			setHasNewVersion(true);
			onEdited(result.image);
		});

	return (
		<>
			<Button type="button" variant="outline" size={size} onClick={() => setOpen(true)}>
				<MessageSquarePlus aria-hidden="true" /> Edit
			</Button>
			<Dialog open={open} onOpenChange={setOpen} dismissible={!isPending} drawerOnMobile={false}>
				<DialogContent size="xl" height="full">
					<DialogHeader>
						<DialogTitle size="lg">Edit image</DialogTitle>
						<DialogDescription>
							Click the image where something should change and describe the change. Drag a pin to move it. Each round saves
							a new version to the gallery and keeps the original.
						</DialogDescription>
					</DialogHeader>
					<DialogBody>
						<ImageCommentEditor
							src={imageUrl(currentId, 'original')}
							alt="Image to edit"
							comments={comments}
							onCommentsChange={setComments}
							maxComments={MAX_IMAGE_COMMENTS}
							maxLength={MAX_COMMENT_LENGTH}
							disabled={isPending}
							labels={{
								addComment: 'Add a comment to the image',
								comment: 'Comment',
								remove: 'Remove',
								placeholder: 'Describe what should change here …',
								empty: `Click the image to add up to ${MAX_IMAGE_COMMENTS} comments.`,
							}}
						/>
					</DialogBody>
					{error && (
						<p className="text-destructive text-sm" role="alert">
							{error}
						</p>
					)}
					{hasNewVersion && !error && (
						<p className="text-muted-foreground text-sm" role="status">
							New version saved to the gallery. Add more comments to refine it.
						</p>
					)}
					<DialogFooter>
						<Button type="button" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
							Close
						</Button>
						<Button type="button" disabled={!canApply} onClick={applyComments}>
							{isPending ? 'Creating new version …' : 'Create new version'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
