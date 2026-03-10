import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server/storyblok-mock';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

const STORYBLOK_RECORDING = 'setup-portal/seed-and-login-portal-actor';

test.only('seed and login portal actor', async ({ browser }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await seedDatabase();
	await assertContactExistsByEmail('test@portal.org');
	await loginAs(browser, 'user');
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
