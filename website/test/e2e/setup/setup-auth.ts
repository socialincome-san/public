import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

test('seed and login default auth actors', async ({ browser }) => {
	await seedDatabase();

	await assertContactExistsByEmail('power@portal.test');
	await loginAs(browser, 'user');

	await assertContactExistsByEmail('coreh@dashboard.test');
	await loginAs(browser, 'contributor');

	await assertContactExistsByEmail('sl@partner.test');
	await loginAs(browser, 'partner');
});
