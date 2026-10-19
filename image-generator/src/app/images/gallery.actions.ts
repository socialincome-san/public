'use server';

import { getGalleryBatch } from './gallery-database';

export const loadMoreGalleryImages = async (offset: number) => {
	if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) {
		return { success: false, error: 'Ungültige Anfrage.' } as const;
	}

	try {
		return { success: true, data: await getGalleryBatch(offset) } as const;
	} catch (error) {
		console.error('Loading more gallery images failed', error);
		return { success: false, error: 'Bilder konnten nicht geladen werden. Bitte erneut versuchen.' } as const;
	}
};
