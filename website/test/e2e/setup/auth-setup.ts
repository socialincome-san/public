import 'dotenv/config';

import { expect, test } from '@playwright/test';

test('auth as mr playwright', async ({ page }) => {
	expect(true).toBe(true);
	await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
