import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
	testDir: './tests/playwright',
	reporter: 'html',
	timeout: 60000,
	expect: { timeout: 10000 },
	projects: [
		{
			name: 'Desktop Chrome',
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],
	use: {
		screenshot: 'on',
	},
	webServer: {
		command: 'vite serve',
		port: 3000,
	},
};

export default config;
