import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { MAX_COMMENT_IMAGE_BYTES, MAX_COMMENT_LENGTH } from './image-comment-limits.ts';
import { prepareImageComments } from './image-comments.ts';

const makeImage = async (width = 1024, height = 1024) =>
	new File(
		[
			new Uint8Array(
				await sharp({ create: { width, height, channels: 3, background: 'white' } })
					.png()
					.toBuffer(),
			),
		],
		'image.png',
		{ type: 'image/png' },
	);
const comments = [
	{ x: 128.125, y: 768.5, text: 'Make the shirt blue' },
	{ x: 900, y: 200, text: 'Remove this object' },
];

test('sends all comments with exact original-image coordinates and coordinate convention', async () => {
	const edit = await prepareImageComments(await makeImage(), JSON.stringify(comments));
	assert.equal(edit.width, 1024);
	assert.equal(edit.height, 1024);
	assert.match(edit.prompt, /top-left/);
	assert.match(edit.prompt, /1024 pixels wide and 1024 pixels high/);
	assert.deepEqual(
		JSON.parse(edit.prompt.split('Comments: ')[1]),
		comments.map((comment, index) => ({ comment: index + 1, ...comment })),
	);
	assert.equal((await sharp(edit.image).metadata()).format, 'png');
});

test('rejects empty, malformed, excessive and out-of-bounds comments', async () => {
	const image = await makeImage();
	for (const value of [
		'not json',
		'{}',
		'[]',
		'[{"x":1e400,"y":0,"text":"Change"}]',
		'[{"x":0,"y":1e400,"text":"Change"}]',
		JSON.stringify(Array.from({ length: 21 }, () => comments[0])),
		JSON.stringify([{ x: -1, y: 0, text: 'Change' }]),
		JSON.stringify([{ x: 0, y: -1, text: 'Change' }]),
		JSON.stringify([{ x: 1024, y: 0, text: 'Change' }]),
		JSON.stringify([{ x: 0, y: 1024, text: 'Change' }]),
		JSON.stringify([{ x: '5', y: 0, text: 'Change' }]),
		JSON.stringify([{ x: null, y: 0, text: 'Change' }]),
		JSON.stringify([{ x: 0, y: 0, text: '  ' }]),
		JSON.stringify([{ x: 0, y: 0, text: 'x'.repeat(MAX_COMMENT_LENGTH + 1) }]),
	]) {
		await assert.rejects(prepareImageComments(image, value), /comments/i);
	}
});

test('preserves portrait and landscape dimensions and accepts edge pixels', async () => {
	for (const [width, height] of [
		[1536, 1024],
		[864, 1536],
	]) {
		const edit = await prepareImageComments(
			await makeImage(width, height),
			JSON.stringify([{ x: width - 1, y: height - 1, text: 'Change this corner' }]),
		);
		assert.equal(edit.width, width);
		assert.equal(edit.height, height);
	}
});

test('rejects unsupported dimensions, corrupt and oversized images', async () => {
	await assert.rejects(prepareImageComments(await makeImage(512, 512), JSON.stringify(comments)), /supported/);
	await assert.rejects(prepareImageComments(new File(['invalid'], 'image.png'), JSON.stringify(comments)));
	await assert.rejects(
		prepareImageComments(new File([new Uint8Array(MAX_COMMENT_IMAGE_BYTES + 1)], 'image.png'), JSON.stringify(comments)),
		/20 MB/,
	);
});

test('normalizes EXIF orientation so coordinates match the displayed image', async () => {
	const bytes = await sharp({ create: { width: 1536, height: 864, channels: 3, background: 'white' } })
		.jpeg()
		.withMetadata({ orientation: 6 })
		.toBuffer();
	const edit = await prepareImageComments(
		new File([new Uint8Array(bytes)], 'rotated.jpg', { type: 'image/jpeg' }),
		JSON.stringify([{ x: 800, y: 1500, text: 'Change the bottom-right detail' }]),
	);
	assert.equal(edit.width, 864);
	assert.equal(edit.height, 1536);
	const metadata = await sharp(edit.image).metadata();
	assert.equal(metadata.width, 864);
	assert.equal(metadata.height, 1536);
	assert.equal(metadata.orientation, undefined);
});
