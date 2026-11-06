'use client';

import { type GalleryImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import { ImageGallery as Gallery } from '@socialincome/design-system/data-display/image-gallery/image-gallery';
import Link from 'next/link';
import { useState } from 'react';
import { DownloadMenu } from '../download-menu';
import { ImageEditDialog } from '../image-edit-dialog';
import { DeleteImageDialog } from './delete-image-dialog';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Europe/Zurich',
});

type ImageGalleryProps = {
	images: GalleryImage[];
	onImageAdded: (image: GalleryImage) => void;
};

export const ImageGallery = ({ images, onImageAdded }: ImageGalleryProps) => {
	const [deletedIds, setDeletedIds] = useState<string[]>([]);
	const visibleImages = images.filter((image) => !deletedIds.includes(String(image.id)));
	return (
		<Gallery
			loadingLabel="Loading image …"
			errorLabel="Image could not be loaded."
			emptyState={{
				badge: 'Gallery empty',
				title: 'No images generated yet',
				description: 'Create your first AI-generated image in the Social Income style.',
				action: (
					<Button asChild>
						<Link href="/">Go to Image Generator →</Link>
					</Button>
				),
			}}
			images={visibleImages.map((image) => {
				const prompt = image.prompt || 'No prompt saved.';
				return {
					id: String(image.id),
					src: image.previewUrl,
					alt: prompt,
					date: {
						value: image.created_at ?? undefined,
						label: image.created_at ? dateFormatter.format(new Date(image.created_at)) : 'Date not saved',
					},
					prompt: { text: prompt, title: 'Image prompt', triggerLabel: 'Show image prompt' },
					overlay: (
						<DeleteImageDialog
							imageId={image.id}
							onDeleted={() => setDeletedIds((previous) => [...previous, String(image.id)])}
						/>
					),
					actions: (
						<>
							<ImageEditDialog image={image} size="sm" onEdited={onImageAdded} />
							<DownloadMenu image={image} variant="outline" size="sm" />
						</>
					),
				};
			})}
		/>
	);
};
