import { APIResponse, expect, Page } from '@playwright/test';

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

export async function loginAs(page: Page, actor: Actor): Promise<void> {
	const { email, testId, state } = ACTORS[actor];

	await page.goto('/en/int/login');
	await page.fill('input[type="email"]', email);
	await page.click('button[type="submit"]');

	const response: APIResponse = await page.request.get(EMULATOR_API);
	const json: FirebaseOobCodesResponse = await response.json();

	const latest = [...json.oobCodes].reverse().find((x) => x.email === email && x.requestType === 'EMAIL_SIGNIN');

	if (!latest) throw new Error(`No EMAIL_SIGNIN oobCode found for ${email}`);

	await page.goto(latest.oobLink);

	await expect(page.getByTestId(testId)).toBeVisible();

	await page.context().storageState({ path: state });
}
