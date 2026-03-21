/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { APIResponse, Browser, expect } from '@playwright/test';

const ACTORS = {
	user: {
		email: 'power@portal.test',
		testId: 'welcome-message-portal',
		expectedPath: '/portal',
		state: 'playwright/.auth/user.json',
	},
	contributor: {
		email: 'coreh@dashboard.test',
		testId: 'welcome-message-dashboard',
		expectedPath: '/dashboard',
		state: 'playwright/.auth/contributor.json',
	},
	partner: {
		email: 'sl@partner.test',
		testId: 'welcome-message-partner-space',
		expectedPath: '/partner-space',
		state: 'playwright/.auth/partner.json',
	},
} as const;

export type Actor = keyof typeof ACTORS;

type FirebaseOobCode = {
	email: string;
	requestType: string;
	oobCode: string;
	oobLink: string;
};

type FirebaseOobCodesResponse = {
	oobCodes: FirebaseOobCode[];
};

const EMULATOR_API = 'http://127.0.0.1:9099/emulator/v1/projects/demo-social-income-local/oobCodes';
const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_CONSENT_VALUE = 'denied';

export const loginAs = async (browser: Browser, actor: Actor): Promise<void> => {
	const context = await browser.newContext();
	const page = await context.newPage();

	const { email, testId, expectedPath, state } = ACTORS[actor];

	await page.goto(`/en/int/${NEW_WEBSITE_SLUG}`);
	await page.getByTestId('login-button').click();
	await page.fill('input[type="email"]', email);
	await page.click('button[type="submit"]');

	await expect(page.getByText(`If an account exists for ${email}`)).toBeVisible();

	const response: APIResponse = await page.request.get(EMULATOR_API);
	const json: FirebaseOobCodesResponse = await response.json();

	const latest = json.oobCodes.filter((x) => x.email === email && x.requestType === 'EMAIL_SIGNIN').pop();

	if (!latest) {
		await context.close();
		throw new Error(`No EMAIL_SIGNIN oobCode found for ${email}`);
	}

	await page.goto(latest.oobLink);
	await page.waitForURL((url) => url.pathname.includes('/auth/confirm-login'));

	const confirmButton = page.getByTestId('confirm-login-button');
	await expect(
		confirmButton,
		`Expected confirm screen for "${actor}" (${email}) but confirm button was not found.`,
	).toBeVisible();
	await confirmButton.click();

	await page.waitForURL((url) => {
		return url.pathname.includes(expectedPath);
	});

	const currentPath = new URL(page.url()).pathname;
	expect(
		currentPath.includes(expectedPath),
		`Expected actor "${actor}" to land on "${expectedPath}", but got "${currentPath}"`,
	).toBeTruthy();
	await expect(page.getByTestId(testId)).toBeVisible();

	await page.evaluate(
		({ key, value }) => {
			window.localStorage.setItem(key, value);
		},
		{ key: COOKIE_CONSENT_KEY, value: COOKIE_CONSENT_VALUE },
	);

	await context.storageState({ path: state, indexedDB: true });

	await context.close();
};
