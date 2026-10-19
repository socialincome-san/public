'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { useReducer, useRef, useTransition } from 'react';
import { ImageGallery, type GalleryImage } from './image-gallery';
import { loadMoreGalleryImages } from './gallery.actions';

type State = {
	images: GalleryImage[];
	hasMore: boolean;
	offset: number;
	error: string | null;
};

type Action =
	| { type: 'loaded'; images: GalleryImage[]; hasMore: boolean }
	| { type: 'error'; error: string };

const reducer = (state: State, action: Action): State => {
	if (action.type === 'error') return { ...state, error: action.error };
	const existingIds = new Set(state.images.map((image) => String(image.id)));
	return {
		images: [...state.images, ...action.images.filter((image) => !existingIds.has(String(image.id)))],
		hasMore: action.hasMore,
		offset: state.offset + action.images.length,
		error: null,
	};
};

export const GalleryLoadMore = ({ images, hasMore }: { images: GalleryImage[]; hasMore: boolean }) => {
	const [state, dispatch] = useReducer(reducer, { images, hasMore, offset: images.length, error: null });
	const [isPending, startTransition] = useTransition();
	const loading = useRef(false);

	const loadMore = () => {
		if (loading.current) return;
		loading.current = true;
		startTransition(async () => {
			try {
				const result = await loadMoreGalleryImages(state.offset);
				if (result.success) dispatch({ type: 'loaded', ...result.data });
				else dispatch({ type: 'error', error: result.error });
			} catch {
				dispatch({ type: 'error', error: 'Bilder konnten nicht geladen werden. Bitte erneut versuchen.' });
			} finally {
				loading.current = false;
			}
		});
	};

	return (
		<>
			<ImageGallery images={state.images} />
			{state.hasMore && (
				<div className="mt-8 flex justify-center">
					<Button type="button" onClick={loadMore} disabled={isPending}>
						{isPending ? 'Lädt …' : 'Mehr laden'}
					</Button>
				</div>
			)}
			{state.error && <p className="text-destructive mt-3 text-center text-sm" role="alert">{state.error}</p>}
		</>
	);
};
