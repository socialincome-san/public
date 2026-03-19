import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', quiet: true });

const cookieConsentState = {
	cookies: [],
	origins: [
		{
			origin: 'http://localhost:3000',
			localStorage: [{ name: 'cookie_consent', value: 'denied' }],
		},
	],
};

export default defineConfig({
	testDir: './test',
	testMatch: ['**/*.e2e.ts'],

	fullyParallel: false,
	workers: 1,

	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,

	snapshotDir: 'snapshots',
	snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{testName}{ext}',

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
			name: 'setup-infra',
			testMatch: /setup-infra\.ts/,
			use: {
				storageState: cookieConsentState,
			},
		},
		{
			name: 'setup-auth',
			testMatch: /setup-auth\.ts/,
			use: {
				storageState: cookieConsentState,
			},
			dependencies: ['setup-infra'],
		},
		{
			name: 'portal',
			testMatch: /projects\/portal\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/user.json',
			},
			dependencies: ['setup-auth'],
		},
		{
			name: 'dashboard',
			testMatch: /projects\/dashboard\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/contributor.json',
			},
			dependencies: ['setup-auth'],
		},
		{
			name: 'partner-space',
			testMatch: /projects\/partner-space\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/partner.json',
			},
			dependencies: ['setup-auth'],
		},
		{
			name: 'mobile-app-api',
			testMatch: /projects\/mobile-app-api\/.*\.e2e\.ts/,
			use: {
				storageState: cookieConsentState,
			},
			dependencies: ['setup-infra'],
		},
		{
			name: 'public-website-desktop',
			testMatch: /projects\/public-website\/.*\.e2e\.ts/,
			use: {
				storageState: cookieConsentState,
			},
			dependencies: ['setup-infra'],
		},
		{
			name: 'public-website-mobile',
			testMatch: /projects\/public-website\/.*\.e2e\.ts/,
			use: {
				...devices['iPhone 15'],
				storageState: cookieConsentState,
			},
			dependencies: ['setup-infra'],
		},
	],
	webServer: {
		command: 'npm run build && npm run start',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
