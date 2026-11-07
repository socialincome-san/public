import { test } from '@playwright/test';
import { selectCustomAmountChip } from './utils/donation-wizard-flow';

test('a custom amount chip in the hero form fills the custom amount', async ({ page }) => {
	await selectCustomAmountChip(page, 60, 'mouse');
});

test('custom amount chips stay reachable with the keyboard', async ({ page }) => {
	await selectCustomAmountChip(page, 100, 'keyboard');
});
