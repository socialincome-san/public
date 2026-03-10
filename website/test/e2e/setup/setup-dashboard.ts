import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server/storyblok-mock';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

test.describe.configure({ mode: 'serial' });

const STORYBLOK_RECORDING = 'setup-dashboard/seed-and-login-dashboard-actor';

test('seed and login dashboard actor', async ({ browser }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await seedDatabase();
	await assertContactExistsByEmail('test@dashboard.org');
	await loginAs(browser, 'contributor');
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
