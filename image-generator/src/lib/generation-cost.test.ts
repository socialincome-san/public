import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getGenerationCost } from './generation-cost.ts';

test('uses reported gateway costs, including free generations and multiple calls', () => {
	assert.equal(
		getGenerationCost([
			{ providerMetadata: { gateway: { cost: '0.04' } } },
			{ providerMetadata: { gateway: { cost: 0.02 } } },
		]),
		0.06,
	);
	assert.equal(getGenerationCost([{ providerMetadata: { gateway: { cost: '0' } } }]), 0);
});

test('does not substitute estimates or partial costs for missing or invalid actual costs', () => {
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
