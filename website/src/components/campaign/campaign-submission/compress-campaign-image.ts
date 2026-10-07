import { campaignSubmissionConfig } from '@/lib/campaign-submission';
import { parseStoryblokFocus, toStoryblokFocus } from '@/lib/storyblok/storyblok-image-focus';

type CampaignImage = {
	file: File;
	focus: string | null;
};

const encodingAttempts = [
	{ maxDimension: 2400, quality: 0.85 },
	{ maxDimension: 2400, quality: 0.7 },
	{ maxDimension: 1920, quality: 0.7 },
	{ maxDimension: 1600, quality: 0.6 },
] as const;

const encodeJpeg = async (bitmap: ImageBitmap, maxDimension: number, quality: number) => {
	const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
	const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Canvas 2D context is not available');
	}
	// JPEG has no alpha channel; paint transparent areas white instead of black.
	context.fillStyle = 'white';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

	return { blob: await canvas.convertToBlob({ type: 'image/jpeg', quality }), scale };
};

// The Storyblok focus point is stored in image pixels, so it is scaled along with the image.
export const compressCampaignImage = async ({ file, focus }: CampaignImage): Promise<CampaignImage> => {
	if (file.size <= campaignSubmissionConfig.maxCompressedImageBytes) {
		return { file, focus };
	}

	let bitmap: ImageBitmap | undefined;
	try {
		bitmap = await createImageBitmap(file);
		let smallest: Awaited<ReturnType<typeof encodeJpeg>> | undefined;
		for (const { maxDimension, quality } of encodingAttempts) {
			const encoded = await encodeJpeg(bitmap, maxDimension, quality);
			if (!smallest || encoded.blob.size < smallest.blob.size) {
				smallest = encoded;
			}
			if (encoded.blob.size <= campaignSubmissionConfig.maxCompressedImageBytes) {
				break;
			}
		}
		if (!smallest || smallest.blob.size >= file.size) {
			return { file, focus };
		}

		const { blob, scale } = smallest;
		const focusPoint = parseStoryblokFocus(focus);

		return {
			file: new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' }),
			focus: focusPoint ? toStoryblokFocus(Math.round(focusPoint.x * scale), Math.round(focusPoint.y * scale)) : focus,
		};
	} catch (error) {
		console.warn('Campaign image compression failed', { error });

		return { file, focus };
	} finally {
		bitmap?.close();
	}
};
