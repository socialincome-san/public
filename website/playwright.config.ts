import { defineConfig, type BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', quiet: true });
dotenv.config({ path: '.env.local', quiet: true });

const port = process.env.PORT ?? '3000';
const baseURL = `http://localhost:${port}`;

const e2eStorageState: Awaited<ReturnType<BrowserContext['storageState']>> = {
	cookies: [
		{
			name: 'si_currency',
			value: 'CHF',
			domain: 'localhost',
			path: '/',
			expires: -1,
			httpOnly: false,
			secure: false,
			sameSite: 'Lax',
		},
	],
	origins: [
		{
			origin: baseURL,
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
	retries: process.env.CI ? 1 : 0,
	// A broken build stops early instead of running (and retrying) every test
	maxFailures: process.env.CI ? 10 : undefined,

	snapshotDir: 'snapshots',
	snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{testName}{ext}',

	// In CI, list prints one line per test so progress is visible in the log, and github annotates failures on the PR
	reporter: process.env.CI ? [['list'], ['github'], ['html', { open: 'never' }]] : [['html', { open: 'never' }]],
	reportSlowTests: { max: 10, threshold: 15_000 },

	use: {
		baseURL,
		// A blocked click or fill fails after 10s instead of using up the whole test timeout
		actionTimeout: 10_000,
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
				storageState: e2eStorageState,
			},
		},
		{
			name: 'setup-auth',
			testMatch: /setup-auth\.ts/,
			use: {
				storageState: e2eStorageState,
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
				storageState: e2eStorageState,
			},
			dependencies: ['setup-infra'],
		},
		{
			name: 'website',
			testMatch: /projects\/website\/.*\.e2e\.ts/,
			use: {
				storageState: e2eStorageState,
			},
			dependencies: ['setup-infra'],
		},
	],
	webServer: {
		command: 'npm run build && npm run start',
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
		env: {
			...process.env,
			E2E_STORYBLOK_MOCK: '1',
			PORT: port,
		},
	},
});
