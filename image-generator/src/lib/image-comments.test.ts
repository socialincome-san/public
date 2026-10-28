import assert from 'node:assert/strict';
import { MAX_COMMENT_LENGTH, MAX_IMAGE_COMMENTS, parseImageComments } from './image-comments.ts';

const comment = { x: 0.5, y: 0.25, text: '  Make the shirt blue  ' };

test('returns trimmed comments without extra fields', () => {
	assert.deepEqual(parseImageComments([{ ...comment, id: 'abc' }]), [{ x: 0.5, y: 0.25, text: 'Make the shirt blue' }]);
});

test('accepts positions on the image edges', () => {
	assert.ok(parseImageComments([{ ...comment, x: 0, y: 1 }]));
});

test('rejects anything but 1 to 20 valid comments', () => {
	const invalid: unknown[] = [
		null,
		'[]',
		[],
		Array.from({ length: MAX_IMAGE_COMMENTS + 1 }, () => comment),
		[{ ...comment, x: 1.01 }],
		[{ ...comment, y: -0.1 }],
		[{ ...comment, x: Number.NaN }],
		[{ ...comment, x: '0.5' }],
		[{ ...comment, text: '   ' }],
		[{ ...comment, text: 'a'.repeat(MAX_COMMENT_LENGTH + 1) }],
		[{ x: 0.5, y: 0.5 }],
	];

	for (const value of invalid) {
		assert.equal(parseImageComments(value), null, JSON.stringify(value)?.slice(0, 80));
	}
});
