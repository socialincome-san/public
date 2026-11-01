import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { createImageEditGuide } from './image-edit-guide.ts';

test('marks exact fractional and edge positions on a separate guide for square, landscape and portrait images', async () => {
	for (const size of [
		{ width: 1024, height: 1024 },
		{ width: 1536, height: 864 },
		{ width: 864, height: 1536 },
	]) {
		const original = await sharp({ create: { ...size, channels: 3, background: 'white' } })
			.png()
			.toBuffer();
		const comments = [
			{ x: 0, y: 0, text: 'Top-left' },
			{ x: 1, y: 1, text: 'Bottom-right' },
			{ x: 0.251, y: 0.719, text: 'Specific detail' },
			{ x: 0.251 + 7 / size.width, y: 0.719, text: 'Nearby detail' },
		];
		const guide = await createImageEditGuide(original, comments, size);
		const { data, info } = await sharp(guide).removeAlpha().raw().toBuffer({ resolveWithObject: true });
		assert.equal(info.width, size.width);
		assert.equal(info.height, size.height);
		for (const { x, y } of comments) {
			const pixelX = Math.min(size.width - 1, Math.round(x * size.width));
			const pixelY = Math.min(size.height - 1, Math.round(y * size.height));
			const offset = (pixelY * size.width + pixelX) * info.channels;
			assert.deepEqual([...data.subarray(offset, offset + 3)], [255, 0, 255]);
		}
		assert.deepEqual(
			await sharp(original)
				.stats()
				.then(({ channels }) => channels.map(({ mean }) => mean)),
			[255, 255, 255],
		);
	}
});
