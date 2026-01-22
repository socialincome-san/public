import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development', quiet: true });

export default defineConfig({
	testDir: './test',
	testMatch: ['**/*.e2e.test.ts'],

	fullyParallel: false,
	workers: 1,

	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,

	snapshotDir: 'snapshots',
	snapshotPathTemplate: '{testDir}/{testFileDir}/__screenshots__/{projectName}/{testName}{ext}',

	reporter: [['html', { open: 'never' }]],

	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
	},

	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.005,
			animations: 'disabled',
		},
	},

	globalSetup: './test/e2e/setup/global-setup.ts',
	globalTeardown: './test/e2e/setup/global-teardown.ts',

	projects: [
		{
			name: 'setup',
			testMatch: /auth-setup\.ts/,
		},
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				storageState: 'playwright/.auth/user.json',
			},
			dependencies: ['setup'],
		},
	],

	webServer: {
		command: 'npm run build:test && npm run e2e:run',

		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
