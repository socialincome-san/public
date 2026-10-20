import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { compositeImageEdit, prepareImageEdit } from './image-edit.ts';

const makeImage = async (width = 1024, height = 1024) =>
	sharp({ create: { width, height, channels: 4, background: { r: 200, g: 100, b: 50, alpha: 1 } } })
		.png()
		.toBuffer();

const file = (bytes: Uint8Array) => new File([new Uint8Array(bytes)], 'image.png', { type: 'image/png' });

const makeSelection = async (width = 1024, height = 1024) => {
	const pixels = Buffer.alloc(width * height * 4);
	pixels[3] = 255;
	pixels[7] = 128;
	return sharp(pixels, { raw: { width, height, channels: 4 } })
		.png()
		.toBuffer();
};

test('inverts the selection alpha for the provider', async () => {
	const edit = await prepareImageEdit(file(await makeImage()), file(await makeSelection()));
	const alpha = await sharp(edit.mask).extractChannel('alpha').raw().toBuffer();
	assert.deepEqual([...alpha.subarray(0, 3)], [0, 127, 255]);
});

test('composites selected pixels and preserves all pixels outside the selection', async () => {
	const original = await makeImage();
	const edit = await prepareImageEdit(file(original), file(await makeSelection()));
	const generated = await sharp({
		create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 1 } },
	})
		.png()
		.toBuffer();
	const result = await sharp(await compositeImageEdit(edit, generated))
		.ensureAlpha()
		.raw()
		.toBuffer();
	const source = await sharp(original).ensureAlpha().raw().toBuffer();
	assert.deepEqual([...result.subarray(0, 4)], [0, 0, 255, 255]);
	assert.ok(result[4] > 0 && result[4] < 200);
	assert.deepEqual(result.subarray(8), source.subarray(8));
});

test('rejects mismatched masks and unsupported original dimensions', async () => {
	await assert.rejects(prepareImageEdit(file(await makeImage()), file(await makeSelection(512, 512))), /matching/);
	await assert.rejects(prepareImageEdit(file(await makeImage(512, 512)), file(await makeSelection(512, 512))), /supported/);
});

test('rejects empty selections, missing alpha and undecodable images', async () => {
	const original = file(await makeImage());
	const empty = await sharp({
		create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
	})
		.png()
		.toBuffer();
	await assert.rejects(prepareImageEdit(original, file(empty)), /Select an area/);
	await assert.rejects(
		prepareImageEdit(original, file(await sharp(empty).removeAlpha().png().toBuffer())),
		/transparent PNG/,
	);
	await assert.rejects(prepareImageEdit(file(new Uint8Array([1, 2, 3])), file(await makeSelection())));
});

test('rejects edited output with different dimensions', async () => {
	const edit = await prepareImageEdit(file(await makeImage()), file(await makeSelection()));
	await assert.rejects(compositeImageEdit(edit, await makeImage(512, 512)), /dimensions/);
});
