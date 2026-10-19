'use client';

import { isGalleryBatch, type GalleryImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useActionState } from 'react';
import { ImageGallery } from './image-gallery';

type State = {
	images: GalleryImage[];
	hasMore: boolean;
	offset: number;
	error: string | null;
};

const loadMore = async (previous: State): Promise<State> => {
	try {
		const response = await fetch(`/api/gallery-images?offset=${previous.offset}`);
		const batch: unknown = await response.json();
		if (!response.ok || !isGalleryBatch(batch)) {
			return { ...previous, error: 'Bilder konnten nicht geladen werden. Bitte erneut versuchen.' };
		}
		const existingIds = new Set(previous.images.map((image) => String(image.id)));
		return {
			images: [...previous.images, ...batch.images.filter((image) => !existingIds.has(String(image.id)))],
			hasMore: batch.hasMore,
			offset: previous.offset + batch.images.length,
			error: null,
		};
	} catch {
		return { ...previous, error: 'Bilder konnten nicht geladen werden. Bitte erneut versuchen.' };
	}
};

export const GalleryLoadMore = ({ images, hasMore }: { images: GalleryImage[]; hasMore: boolean }) => {
	const [state, formAction, isPending] = useActionState(loadMore, {
		images,
		hasMore,
		offset: images.length,
		error: null,
	});

	return (
		<>
			<ImageGallery images={state.images} />
			{state.hasMore && (
				<form action={formAction} className="mt-8 flex justify-center">
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Lädt …' : 'Mehr laden'}
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
