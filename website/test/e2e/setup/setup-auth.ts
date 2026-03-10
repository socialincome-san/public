import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server/storyblok-mock';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

test('seed and login all auth actors', async ({ browser }) => {
	await seedDatabase();

	await setupStoryblokMock('setup-portal/seed-and-login-portal-actor');
	await assertContactExistsByEmail('test@portal.org');
	await loginAs(browser, 'user');
	await saveStoryblokMock('setup-portal/seed-and-login-portal-actor');

	await setupStoryblokMock('setup-dashboard/seed-and-login-dashboard-actor');
	await assertContactExistsByEmail('test@dashboard.org');
	await loginAs(browser, 'contributor');
	await saveStoryblokMock('setup-dashboard/seed-and-login-dashboard-actor');

	await setupStoryblokMock('setup-partner-space/seed-and-login-partner-space-actor');
	await assertContactExistsByEmail('test@partner.org');
	await loginAs(browser, 'partner');
	await saveStoryblokMock('setup-partner-space/seed-and-login-partner-space-actor');
});
