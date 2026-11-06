'use client';

import { MAX_COMMENT_LENGTH, MAX_IMAGE_COMMENTS } from '@/lib/image-comments';
import { formatImageCost } from '@/lib/image-cost';
import { type GalleryImage, type SavedImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	type ImageComment,
	ImageCommentEditor,
} from '@socialincome/design-system/forms/image-comment-editor/image-comment-editor';
import { ImageHistory } from '@socialincome/design-system/navigation/image-history/image-history';
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
	image: GalleryImage;
	size: 'sm' | 'md';
	fullWidth?: boolean;
	onEdited: (image: SavedImage) => void;
};

/** Comments on an image become a new version in the gallery; the dialog then shows that version for further rounds. */
export const ImageEditDialog = ({ image, size, fullWidth, onEdited }: ImageEditDialogProps) => {
	const [open, setOpen] = useState(false);
	const [versions, setVersions] = useState<GalleryImage[]>([image]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const currentImage = versions[selectedIndex];
	const [comments, setComments] = useState<ImageComment[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [hasNewVersion, setHasNewVersion] = useState(false);
	const [isPending, startTransition] = useTransition();
	const canApply = !isPending && comments.length > 0 && comments.every((comment) => comment.text.trim());

	const applyComments = () =>
		startTransition(async () => {
			const result = await requestImage(
				'/api/edit-image',
				JSON.stringify({ imageId: String(currentImage.id), comments: comments.map(({ x, y, text }) => ({ x, y, text })) }),
			);
			if ('error' in result) {
				setError(result.error);
				return;
			}
			setError(null);
			setVersions((previous) => [...previous, result.image]);
			setSelectedIndex(versions.length);
			setComments([]);
			setHasNewVersion(true);
			onEdited(result.image);
		});

	return (
		<>
			<Button type="button" variant="outline" size={size} fullWidth={fullWidth} onClick={() => setOpen(true)}>
				<MessageSquarePlus aria-hidden="true" /> Edit
			</Button>
			<Dialog open={open} onOpenChange={setOpen} dismissible={!isPending} drawerOnMobile={false}>
				<DialogContent size="xl" height="full">
					<DialogHeader>
						<DialogTitle size="lg">Edit image · Version {selectedIndex + 1}</DialogTitle>
						<DialogDescription visuallyHidden>Add comments to create a new version of this image.</DialogDescription>
					</DialogHeader>
					<DialogBody>
						<ImageHistory
							label="Version history"
							items={versions.map((version, index) => ({
								src: version.previewUrl,
								label: `Version ${index + 1}`,
								badge: `V${index + 1}`,
								tooltip: version.cost_usd === null ? 'Price unavailable' : formatImageCost(version.cost_usd),
							}))}
							selectedIndex={selectedIndex}
							disabled={isPending}
							onSelect={(index) => {
								if (index === selectedIndex) return;
								setSelectedIndex(index);
								setComments([]);
								setError(null);
								setHasNewVersion(false);
							}}
						>
							<ImageCommentEditor
								src={currentImage.imageUrl}
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
									helpLabel: 'How image edits work',
									help: 'Click to mark an area, describe the change, then create a new version. Drag pins to move them.',
								}}
							/>
						</ImageHistory>
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
