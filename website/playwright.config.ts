import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development', quiet: true });

export default defineConfig({
	testDir: './test',
	testMatch: ['**/*.e2e.ts'],

	fullyParallel: false,
	workers: 1,

	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,

	snapshotDir: 'snapshots',
	snapshotPathTemplate: '{testDir}/{testFileDir}/__screenshots__/{projectName}/{testName}{ext}',

	reporter: [['html', { open: 'never' }]],

	use: {
		baseURL: 'http://localhost:3000',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
		video: 'retain-on-failure',
	},

	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.005,
			animations: 'disabled',
		},
	},

	projects: [
		{
			name: 'setup',
			testMatch: /test-setup\.ts/,
		},
		{
			name: 'portal',
			testMatch: /portal\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/user.json',
			},
			dependencies: ['setup'],
		},
		{
			name: 'dashboard',
			testMatch: /dashboard\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/contributor.json',
			},
			dependencies: ['setup'],
		},
		{
			name: 'partner-space',
			testMatch: /partner-space\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/partner.json',
			},
			dependencies: ['setup'],
		},
		{
			name: 'mobile-app-api',
			testMatch: /mobile-app-api\/.*\.e2e\.ts/,
		},
		{
			name: 'public-website',
			testMatch: /public-website\/.*\.e2e\.ts/,
		},
	],
	webServer: {
		command: 'bash -lc "set -x; npm run build:e2e && npm run start"',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
