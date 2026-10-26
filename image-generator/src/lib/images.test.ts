import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mergeGalleryBatch, type GalleryImage } from './images.ts';

const image = (id: number | string, prompt = 'Image'): GalleryImage => ({
	id,
	prompt,
	media_type: 'image/png',
	created_at: null,
});

test('refresh keeps loaded images and includes new versions in the next pagination offset', () => {
	const previous = { images: [image(3), image(2), image(1)], hasMore: true };
	const refreshed = { images: [image(4), image(3, 'Updated prompt')], hasMore: true };
	const merged = mergeGalleryBatch(refreshed, previous);
	assert.deepEqual(
		merged.images.map((item) => item.id),
		[4, 3, 2, 1],
	);
	assert.equal(merged.images[1].prompt, 'Updated prompt');
	assert.equal(merged.images.length, 4);
	assert.equal(merged.hasMore, true);
});

test('refresh reopens pagination when an initially empty gallery gains more pages', () => {
	const merged = mergeGalleryBatch({ images: [image(2)], hasMore: true }, { images: [], hasMore: false });
	assert.equal(merged.hasMore, true);
});

test('exhausted pagination stays exhausted until unseen images arrive', () => {
	const previous = { images: [image(3), image(2), image(1)], hasMore: false };
	assert.equal(mergeGalleryBatch({ images: [image(3), image(2)], hasMore: true }, previous).hasMore, false);
	const refreshed = { images: [image(4), image(3)], hasMore: true };
	const merged = mergeGalleryBatch(refreshed, previous);
	assert.equal(merged.hasMore, true);
	assert.equal(mergeGalleryBatch(refreshed, { ...merged, hasMore: false }).hasMore, false);
});

test('deduplicates numeric and string image IDs without mutating either batch', () => {
	const current = { images: [image('2')], hasMore: false };
	const previous = { images: [image(2), image(1)], hasMore: false };
	assert.deepEqual(
		mergeGalleryBatch(current, previous).images.map((item) => item.id),
		['2', 1],
	);
	assert.equal(current.images.length, 1);
	assert.equal(previous.images.length, 2);
});
