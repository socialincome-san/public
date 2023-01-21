import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
	testDir: './tests/playwright',
	reporter: 'html',
	/* Configure projects for major browsers */
	projects: [
		{
			name: 'Google Chrome',
			use: {
				channel: 'chrome',
			},
		},
		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
			},
		},
		/* Test against mobile viewports. */
		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5'],
			},
		},
		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 12'],
			},
		},
	],
	use: {
		screenshot: 'on',
	},
};

export default config;
