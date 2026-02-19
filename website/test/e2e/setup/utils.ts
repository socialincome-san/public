import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { APIResponse, Browser, expect } from '@playwright/test';

const ACTORS = {
	user: {
		email: 'test@portal.org',
		testId: 'welcome-message-portal',
		state: 'playwright/.auth/user.json',
	},
	contributor: {
		email: 'test@dashboard.org',
		testId: 'welcome-message-dashboard',
		state: 'playwright/.auth/contributor.json',
	},
	partner: {
		email: 'test@partner.org',
		testId: 'welcome-message-partner-space',
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

export const loginAs = async (browser: Browser, actor: Actor): Promise<void> => {
	const context = await browser.newContext();
	const page = await context.newPage();

	const { email, testId, state } = ACTORS[actor];

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

	await expect(page.getByTestId(testId)).toBeVisible();

	await context.storageState({ path: state });

	await context.close();
};
