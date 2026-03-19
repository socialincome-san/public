import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server/storyblok-mock';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

test.only('seed and login default auth actors', async ({ browser }) => {
	await seedDatabase();

	await setupStoryblokMock('portal-auth-login');
	await assertContactExistsByEmail('power@portal.test');
	await loginAs(browser, 'user');
	await saveStoryblokMock('portal-auth-login');

	await setupStoryblokMock('dashboard-auth-login');
	await assertContactExistsByEmail('coreh@dashboard.test');
	await loginAs(browser, 'contributor');
	await saveStoryblokMock('dashboard-auth-login');

	await setupStoryblokMock('partner-space-auth-login');
	await assertContactExistsByEmail('sl@partner.test');
	await loginAs(browser, 'partner');
	await saveStoryblokMock('partner-space-auth-login');
});
