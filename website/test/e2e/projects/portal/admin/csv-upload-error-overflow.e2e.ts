import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem } from '../../../utils';

const makeCsvWithManyInvalidRows = (rows = 40) => {
	const header = 'firstName,lastName,localPartnerId,contactPhone,paymentPhone,dateOfBirth,gender,paymentInformationCode';
	const invalidRows = Array.from({ length: rows }, (_, index) => `Long${index + 1},Error${index + 1},,,,,,`);

	return [header, ...invalidRows].join('\n');
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('CSV upload errors stay inside the scrollable dialog viewport', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto('/portal/admin/candidates');
	await clickDataTableActionItem(page, 'data-table-action-item-upload-csv');

	await page.getByTestId('csv-dropzone-input').setInputFiles({
		name: 'many-invalid-candidates.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(makeCsvWithManyInvalidRows()),
	});
	await page.getByTestId('import-button').click();

	const alert = page.getByRole('alert');
	await expect(alert).toContainText('CSV contains invalid candidate data');

	const alertDescription = alert.locator('[data-slot="alert-description"]');
	await expect(alertDescription).toHaveCSS('white-space', 'pre-wrap');
	await expect(alertDescription).toHaveCSS('overflow-wrap', 'break-word');

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
