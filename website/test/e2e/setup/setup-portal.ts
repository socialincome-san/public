import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server/storyblok-mock';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

test.describe.configure({ mode: 'serial' });

test('seed and login portal actor', async ({ browser }, testInfo) => {
	await setupStoryblokMock(testInfo);
	await seedDatabase();
	await assertContactExistsByEmail('test@portal.org');
	await loginAs(browser, 'user');
	await saveStoryblokMock(testInfo);
});
