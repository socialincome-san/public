'use client';

import { isGalleryBatch, type GalleryBatch, type GalleryImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useActionState, useState } from 'react';
import { ImageGallery } from './image-gallery';

type State = { loaded: GalleryImage[]; hasMore: boolean; error: string | null };

export const GalleryLoadMore = ({ images: firstBatch, hasMore }: GalleryBatch) => {
	// Versions made in the edit dialog are newer than everything loaded, so they go first without reloading the page.
	const [added, setAdded] = useState<GalleryImage[]>([]);
	const [state, loadMore, isPending] = useActionState(
		async (previous: State): Promise<State> => {
			const last = [...firstBatch, ...previous.loaded].at(-1);
			const batch: unknown = await fetch(`/api/gallery-images?after=${last?.id}`)
				.then((response) => response.json())
				.catch(() => null);
			if (!isGalleryBatch(batch)) return { ...previous, error: 'Images could not be loaded. Please try again.' };
			return { loaded: [...previous.loaded, ...batch.images], hasMore: batch.hasMore, error: null };
		},
		{ loaded: [], hasMore, error: null },
	);

	return (
		<>
			<ImageGallery
				images={[...added, ...firstBatch, ...state.loaded]}
				onImageAdded={(image) => setAdded((previous) => [image, ...previous])}
			/>
			{state.hasMore && (
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
