import { defineConfig, devices } from '@playwright/test';

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
		baseURL: 'http://localhost:3001',
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
		command: 'echo "🔧 Building…" && npm run build && echo "🚀 Starting server…" && npm run start',
		url: 'http://localhost:3001',
		timeout: 60_000,
		reuseExistingServer: !process.env.CI,
	},
});
