'use client';

import { isGalleryBatch, type GalleryBatch, type GalleryImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useActionState } from 'react';
import { ImageGallery } from './image-gallery';

// Only the batches loaded here live in state; the first batch stays a prop, so a refresh after an edit shows new images.
type State = { loaded: GalleryImage[]; hasMore: boolean | null; error: string | null };

export const GalleryLoadMore = ({ images: firstBatch, hasMore: firstBatchHasMore }: GalleryBatch) => {
	const [state, loadMore, isPending] = useActionState(
		async (previous: State): Promise<State> => {
			const batch: unknown = await fetch(`/api/gallery-images?offset=${firstBatch.length + previous.loaded.length}`)
				.then((response) => response.json())
				.catch(() => null);
			if (!isGalleryBatch(batch)) return { ...previous, error: 'Images could not be loaded. Please try again.' };
			return { loaded: [...previous.loaded, ...batch.images], hasMore: batch.hasMore, error: null };
		},
		{ loaded: [], hasMore: null, error: null },
	);
	// New images shift later batches by a few places, so the same image can arrive twice.
	const images = [...new Map([...firstBatch, ...state.loaded].map((image) => [String(image.id), image])).values()];
	const hasMore = state.hasMore ?? firstBatchHasMore;

	return (
		<>
			<ImageGallery images={images} />
			{hasMore && (
				<form action={loadMore} className="mt-8 flex justify-center">
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
