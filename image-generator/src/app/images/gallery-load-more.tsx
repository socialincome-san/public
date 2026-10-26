'use client';

import { isGalleryBatch, mergeGalleryBatch, type GalleryImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useActionState } from 'react';
import { ImageGallery } from './image-gallery';

type State = {
	images: GalleryImage[];
	hasMore: boolean;
	error: string | null;
};

const loadMore = async (previous: State): Promise<State> => {
	try {
		const response = await fetch(`/api/gallery-images?offset=${previous.images.length}`);
		const batch: unknown = await response.json();
		if (!response.ok || !isGalleryBatch(batch)) {
			return { ...previous, error: 'Images could not be loaded. Please try again.' };
		}
		const existingIds = new Set(previous.images.map((image) => String(image.id)));
		return {
			images: [...previous.images, ...batch.images.filter((image) => !existingIds.has(String(image.id)))],
			hasMore: batch.hasMore,
			error: null,
		};
	} catch {
		return { ...previous, error: 'Images could not be loaded. Please try again.' };
	}
};

export const GalleryLoadMore = ({ images, hasMore }: { images: GalleryImage[]; hasMore: boolean }) => {
	const [state, formAction, isPending] = useActionState(
		(previous: State) => loadMore({ ...previous, ...mergeGalleryBatch({ images, hasMore }, previous) }),
		{ images, hasMore, error: null },
	);
	const gallery = mergeGalleryBatch({ images, hasMore }, state);

	return (
		<>
			<ImageGallery images={gallery.images} />
			{gallery.hasMore && (
				<form action={formAction} className="mt-8 flex justify-center">
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Loading …' : 'Load more'}
					</Button>
				</form>
			)}
			{state.error && (
				<p className="text-destructive mt-3 text-center text-sm" role="alert">
					{state.error}
				</p>
			)}
		</>
	);
};
