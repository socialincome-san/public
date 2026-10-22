import sharp from 'sharp';
import { IMAGE_FORMATS } from './image-formats.ts';

export const MAX_EDIT_IMAGE_BYTES = 20 * 1024 * 1024;

export const prepareImageEdit = async (image: File, selection: File) => {
	const source = sharp(await image.arrayBuffer(), { limitInputPixels: 4_000_000 });
	const metadata = await source.metadata();
	const { width, height } = metadata;
	if (
		!['png', 'jpeg', 'webp'].includes(metadata.format ?? '') ||
		(metadata.pages ?? 1) !== 1 ||
		!IMAGE_FORMATS.some((format) => format.width === width && format.height === height)
	) {
		throw new Error('Choose a generated image in a supported format.');
	}
	const mask = sharp(await selection.arrayBuffer(), { limitInputPixels: 4_000_000 });
	const maskMetadata = await mask.metadata();
	if (
		maskMetadata.format !== 'png' ||
		!maskMetadata.hasAlpha ||
		(maskMetadata.pages ?? 1) !== 1 ||
		maskMetadata.width !== width ||
		maskMetadata.height !== height
	) {
		throw new Error('Selection must be a transparent PNG matching the image dimensions.');
	}
	const alpha = await mask.extractChannel('alpha').raw().toBuffer();
	if (!alpha.some((value) => value > 0)) throw new Error('Select an area to edit first.');
	const pixels = Buffer.alloc(alpha.length * 4, 255);
	for (let index = 0; index < alpha.length; index++) pixels[index * 4 + 3] = 255 - alpha[index];
	// OpenAI edits transparent pixels; the painted UI selection has the opposite alpha convention.
	const providerMask = await sharp(pixels, { raw: { width: maskMetadata.width, height: maskMetadata.height, channels: 4 } })
		.png()
		.toBuffer();
	return {
		image: await source.png().toBuffer(),
		mask: providerMask,
		alpha,
		width: maskMetadata.width,
		height: maskMetadata.height,
	};
};

export const compositeImageEdit = async (edit: Awaited<ReturnType<typeof prepareImageEdit>>, generated: Uint8Array) => {
	const { data, info } = await sharp(generated).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	if (info.width !== edit.width || info.height !== edit.height) throw new Error('Edited image dimensions do not match.');
	for (let index = 0; index < edit.alpha.length; index++) {
		data[index * 4 + 3] = Math.round((data[index * 4 + 3] * edit.alpha[index]) / 255);
	}
	// Composite only the selected pixels, even if the provider changes the surrounding image.
	return sharp(edit.image)
		.composite([{ input: data, raw: { width: edit.width, height: edit.height, channels: 4 } }])
		.png()
		.toBuffer();
};
