import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server/storyblok-mock';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

test('seed and login all auth actors', async ({ browser }) => {
	await seedDatabase();

	await setupStoryblokMock('portal-auth-login');
	await assertContactExistsByEmail('test@portal.org');
	await loginAs(browser, 'user');
	await saveStoryblokMock('portal-auth-login');

	await setupStoryblokMock('dashboard-auth-login');
	await assertContactExistsByEmail('test@dashboard.org');
	await loginAs(browser, 'contributor');
	await saveStoryblokMock('dashboard-auth-login');

	await setupStoryblokMock('partner-space-auth-login');
	await assertContactExistsByEmail('test@partner.org');
	await loginAs(browser, 'partner');
	await saveStoryblokMock('partner-space-auth-login');
});
