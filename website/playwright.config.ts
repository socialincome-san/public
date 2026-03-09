import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', quiet: true });

const publicWebsiteCookieConsentState = {
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

	fullyParallel: true,
	workers: process.env.CI ? '50%' : 1,

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
			name: 'setup-infra',
			testMatch: /setup-infra\.ts/,
		},
		{
			name: 'setup-portal',
			testMatch: /setup-portal\.ts/,
			dependencies: ['setup-infra'],
		},
		{
			name: 'setup-dashboard',
			testMatch: /setup-dashboard\.ts/,
			dependencies: ['setup-infra'],
		},
		{
			name: 'setup-partner-space',
			testMatch: /setup-partner-space\.ts/,
			dependencies: ['setup-infra'],
		},
		{
			name: 'portal-parallel',
			testMatch: /projects\/portal\/parallel\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/user.json',
			},
			dependencies: ['setup-portal'],
		},
		{
			name: 'dashboard-parallel',
			testMatch: /projects\/dashboard\/parallel\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/contributor.json',
			},
			dependencies: ['setup-dashboard'],
		},
		{
			name: 'partner-space-parallel',
			testMatch: /projects\/partner-space\/parallel\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/partner.json',
			},
			dependencies: ['setup-partner-space'],
		},
		{
			name: 'mobile-app-api-parallel',
			testMatch: /projects\/mobile-app-api\/parallel\/.*\.e2e\.ts/,
			dependencies: ['setup-infra'],
		},
		{
			name: 'portal-serial',
			testMatch: /projects\/portal\/serial\/.*\.e2e\.ts/,
			use: {
				storageState: 'playwright/.auth/user.json',
			},
			dependencies: [
				'setup-portal',
				'portal-parallel',
				'dashboard-parallel',
				'partner-space-parallel',
				'mobile-app-api-parallel',
			],
		},
		{
			name: 'public-website-desktop-serial',
			testMatch: /projects\/public-website\/serial\/.*\.e2e\.ts/,
			use: {
				storageState: publicWebsiteCookieConsentState,
			},
			dependencies: [
				'setup-infra',
				'portal-parallel',
				'dashboard-parallel',
				'partner-space-parallel',
				'mobile-app-api-parallel',
			],
		},
		{
			name: 'public-website-mobile-serial',
			testMatch: /projects\/public-website\/serial\/.*\.e2e\.ts/,
			use: {
				...devices['iPhone 15'],
				storageState: publicWebsiteCookieConsentState,
			},
			dependencies: [
				'setup-infra',
				'portal-parallel',
				'dashboard-parallel',
				'partner-space-parallel',
				'mobile-app-api-parallel',
			],
		},
	],
	webServer: {
		command: 'npm run build && npm run start',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
