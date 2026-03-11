import { expect, test } from '@playwright/test';
import { ROUTES } from '@/lib/constants/routes';

test('program surveys page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalProgramSurveys('program-1'));
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
