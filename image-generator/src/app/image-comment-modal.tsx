'use client';

import { MAX_COMMENT_LENGTH, MAX_IMAGE_COMMENTS } from '@/lib/image-comment-limits';
import { isGenerateResponse } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	ImageCommentEditor,
	type ImageComment,
} from '@socialincome/design-system/forms/image-comment-editor/image-comment-editor';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export const ImageCommentModal = ({ src }: { src: string }) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [result, setResult] = useState<{ src: string; version: number }>({ src, version: 1 });
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const applyComments = (comments: ImageComment[]) => {
		setError(null);
		startTransition(async () => {
			try {
				const original = await fetch(result.src);
				if (!original.ok) throw new Error('Image could not be loaded.');
				const body = new FormData();
				body.set('commentImage', await original.blob(), 'original.png');
				body.set('comments', JSON.stringify(comments));
				const response = await fetch('/api/generate-image', { method: 'POST', body });
				const json: unknown = await response.json();
				if (!isGenerateResponse(json)) throw new Error('Invalid generation response.');
				if (!response.ok || json.error || !json.imageBase64 || !json.mediaType) {
					setError(json.error ?? 'Image editing failed. Please try again.');
					return;
				}
				setResult((previous) => ({
					src: `data:${json.mediaType};base64,${json.imageBase64}`,
					version: previous.version + 1,
				}));
				router.refresh();
			} catch {
				setError('Image editing failed. Please try again.');
			}
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				if (!pending) setOpen(value);
			}}
		>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" size="sm">
					<MessageSquare aria-hidden="true" />
					Comment
				</Button>
			</DialogTrigger>
			<DialogContent
				size="xl"
				height="viewport"
				padding="responsive"
				closeOnClickOutside={!pending}
				closeOnEscape={!pending}
				hideCloseButton={pending}
			>
				<ImageCommentEditor
					key={result.version}
					src={result.src}
					alt="Image to comment on"
					disabled={pending}
					maxComments={MAX_IMAGE_COMMENTS}
					maxLength={MAX_COMMENT_LENGTH}
					onApply={applyComments}
					onCancel={() => setOpen(false)}
					header={
						<>
							<DialogTitle size="lg">Comment on image · Version {result.version}</DialogTitle>
							<DialogDescription>
								Click the image to add a comment. Drag a pin to adjust its position.
								<span className="sr-only sm:not-sr-only sm:[@media(max-height:30rem)]:sr-only">
									{' '}
									Use arrow keys and Enter to place a comment with the keyboard. Arrow keys move a focused pin; Shift moves
									it faster. Generate a new version to apply all comments, keeping the original.
								</span>
							</DialogDescription>
						</>
					}
					feedback={
						<>
							{error && (
								<p className="text-destructive text-sm" role="alert">
									{error}
								</p>
							)}
							{result.version > 1 && (
								<p className="text-muted-foreground text-sm" role="status">
									Version {result.version} saved in the gallery. Add more comments to refine it.
								</p>
							)}
						</>
					}
					labels={{
						place: 'Place a comment on the image',
						loading: 'Loading original image …',
						loadError: 'Image could not be loaded. Close and try again.',
						comment: 'Comment',
						comments: 'Comments',
						cancel: 'Cancel',
						placeholder: 'Describe what should change here …',
						remove: 'Remove',
						empty: 'Click the image to add up to 20 comments.',
						apply: 'Generate new version',
						pending: 'Creating new version …',
					}}
				/>
			</DialogContent>
		</Dialog>
	);
};
