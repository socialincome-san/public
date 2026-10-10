import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem } from '../../../utils';

const makeLongMultilineError = (rows = 40) =>
	Array.from({ length: rows }, (_, index) => `Row ${index + 1}: ${'validationdetail'.repeat(12)}`).join('\n');

test.beforeEach(async () => {
	await seedDatabase();
});

test('CSV upload errors stay inside the scrollable dialog viewport', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto('/portal/admin/candidates');
	await clickDataTableActionItem(page, 'data-table-action-item-upload-csv');

	const longError = makeLongMultilineError();

	// Candidate imports intentionally return a generic validation error.
	// Inject a long client-side read failure to exercise the dialog layout
	// without changing the backend error contract.
	await page.evaluate((message) => {
		File.prototype.text = () => Promise.reject(new Error(message));
	}, longError);

	await page.getByTestId('csv-dropzone-input').setInputFiles({
		name: 'long-error.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from('firstName,lastName\nAda,Lovelace'),
	});

	const alert = page.getByRole('alert');
	await expect(alert).toContainText('Import failed');

	const errorText = alert.locator('[data-slot="alert-description"] > span');
	await expect(errorText).toContainText('Row 1:');
	await expect(errorText).toContainText('Row 40:');
	expect(await errorText.textContent()).toBe(longError);

	await expect(errorText).toHaveCSS('white-space', 'pre-wrap');
	await expect(errorText).toHaveCSS('overflow-wrap', 'break-word');

	const dialog = page.getByRole('dialog');
	const dialogBox = await dialog.boundingBox();
	const viewport = page.viewportSize();

	expect(dialogBox).not.toBeNull();
	expect(viewport).not.toBeNull();
	expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
	expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(viewport!.height + 1);

	const scrollMetrics = await dialog.evaluate((element) => ({
		scrollHeight: element.scrollHeight,
		clientHeight: element.clientHeight,
		scrollTop: element.scrollTop,
	}));
	expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);

	await dialog.evaluate((element) => element.scrollBy({ top: 500 }));
	await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBeGreaterThan(scrollMetrics.scrollTop);

	const cancelButton = page.getByRole('button', { name: 'Cancel' });
	await cancelButton.scrollIntoViewIfNeeded();
	await expect(cancelButton).toBeInViewport();
	await cancelButton.click();
	await expect(dialog).toBeHidden();
});
