import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatImageCost, getGenerationCost } from './image-cost.ts';

test('uses actual gateway costs for an image, including multiple calls and free generations', () => {
	assert.equal(
		getGenerationCost([
			{ providerMetadata: { gateway: { cost: '0.04' } } },
			{ providerMetadata: { gateway: { cost: 0.02 } } },
		]),
		0.06,
	);
	assert.equal(getGenerationCost([{ providerMetadata: { gateway: { cost: '0' } } }]), 0);
});

test('never estimates missing or invalid costs', () => {
	for (const metadata of [
		undefined,
		null,
		{},
		{ gateway: { marketCost: '0.04' } },
		{ gateway: { cost: '' } },
		{ gateway: { cost: -1 } },
		{ gateway: { cost: 'NaN' } },
	]) {
		assert.equal(getGenerationCost([{ providerMetadata: metadata }]), null);
	}
	assert.equal(getGenerationCost([]), null);
	assert.equal(getGenerationCost([{ providerMetadata: { gateway: { cost: '0.04' } } }, {}]), null);
});

test('formats image prices with two decimal places', () => {
	assert.equal(formatImageCost(0.045), '$0.05');
	assert.equal(formatImageCost(0), '$0.00');
	assert.equal(formatImageCost(null), '—');
});
