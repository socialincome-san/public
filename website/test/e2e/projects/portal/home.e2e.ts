import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('portal home-page matches screenshot', async ({ page }) => {
	await page.goto('/portal');
	await expectToHaveScreenshot(page);
});

test('country list in create program wizard matches screenshot', async ({ page }) => {
	await page.goto('/portal');

	await page.getByTestId('create-program-modal-trigger').click();

	for (const countryLabel of ['Algeria', 'Angola', 'Burkina Faso', 'Ethiopia', 'Kenya', 'Malawi', 'Tanzania']) {
		// The radio button's cell is named after the country too, but only the name cell shows it as text
		await page.getByRole('cell', { name: countryLabel }).filter({ hasText: countryLabel }).click();
	}

	await page.getByRole('dialog').evaluate((element) => {
		const dialog = element as HTMLElement;
		dialog.style.maxHeight = 'none';
		dialog.style.overflow = 'visible';
	});
	// The table scrolls inside a frame of limited height: lifting every limit puts all rows in the screenshot
	await page.getByTestId('country-table').evaluate((element) => {
		for (const node of [element, ...element.querySelectorAll('*')]) {
			if (node instanceof HTMLElement && getComputedStyle(node).maxHeight !== 'none') {
				node.style.maxHeight = 'none';
				node.style.overflow = 'visible';
			}
		}
	});

	await expectToHaveScreenshot(page.getByTestId('country-table'));
});
