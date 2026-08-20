import { prisma } from '@/lib/database/prisma';
import { expect, Locator, Page } from '@playwright/test';

const FIREBASE_EMULATOR_OOB_CODES_API = 'http://127.0.0.1:9099/emulator/v1/projects/demo-social-income-local/oobCodes';

type FirebaseOobCode = {
	email: string;
	requestType: string;
	oobLink: string;
};

type FirebaseOobCodesResponse = {
	oobCodes: FirebaseOobCode[];
};

export const loginContributorViaEmailLink = async (page: Page, email: string) => {
	await page.goto('/en/int');
	await page.getByTestId('login-button').click();

	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await dialog.locator('input[type="email"]').fill(email);
	await dialog.locator('button[type="submit"]').click();

	await expect
		.poll(
			async () => {
				const response = await page.request.get(FIREBASE_EMULATOR_OOB_CODES_API);
				const json = (await response.json()) as FirebaseOobCodesResponse;

				return json.oobCodes.some((code) => code.email === email && code.requestType === 'EMAIL_SIGNIN');
			},
			{ timeout: 15_000 },
		)
		.toBeTruthy();

	const response = await page.request.get(FIREBASE_EMULATOR_OOB_CODES_API);
	const json = (await response.json()) as FirebaseOobCodesResponse;
	const latest = json.oobCodes.filter((code) => code.email === email && code.requestType === 'EMAIL_SIGNIN').pop();

	if (!latest) {
		throw new Error(`No EMAIL_SIGNIN oobCode found for ${email}`);
	}

	await page.goto(latest.oobLink);
	await page.waitForURL((url) => url.pathname.includes('/auth/confirm-login'));

	const confirmButton = page.getByTestId('confirm-login-button');
	await expect(confirmButton).toBeVisible();
	await confirmButton.click();

	await page.waitForURL((url) => url.pathname.includes('/dashboard'));
};

export const getFirebaseAdminService = async () => {
	const { FirebaseAdminService } = await import('@/lib/services/firebase/firebase-admin.service');
	const { prisma } = await import('@/lib/database/prisma');

	return new FirebaseAdminService(prisma);
};

export const deleteFirebaseEmailsIfExist = async (...emails: string[]) => {
	const firebaseService = await getFirebaseAdminService();
	for (const email of emails) {
		await firebaseService.deleteByEmailIfExists(email);
	}
};

export const deleteFirebasePhonesIfExist = async (...phoneNumbers: string[]) => {
	const firebaseService = await getFirebaseAdminService();
	for (const phoneNumber of phoneNumbers) {
		await firebaseService.deleteByPhoneNumberIfExists(phoneNumber);
	}
};

export const getRecipientProgramAndLocalPartnerByName = async (firstName: string, lastName: string) => {
	return prisma.recipient.findFirst({
		where: {
			contact: {
				firstName,
				lastName,
			},
		},
		select: {
			program: { select: { name: true } },
			localPartner: { select: { name: true } },
		},
	});
};

export const getRecipientIdByName = async (firstName: string, lastName: string) => {
	return prisma.recipient.findFirst({
		where: {
			contact: {
				firstName,
				lastName,
			},
		},
		select: {
			id: true,
		},
	});
};

export const getCandidateByName = async (firstName: string, lastName: string) => {
	return prisma.recipient.findFirst({
		where: {
			programId: null,
			contact: {
				firstName,
				lastName,
			},
		},
		select: {
			id: true,
			localPartner: { select: { name: true } },
			paymentInformation: {
				select: {
					code: true,
					phone: { select: { number: true } },
				},
			},
		},
	});
};

export const assertContactExistsByEmail = async (email: string) => {
	await prisma.contact.findUniqueOrThrow({
		where: {
			email,
		},
	});
};

export const selectOptionByTestId = async (page: Page, fieldName: string, optionName?: string) => {
	const sectionName = fieldName.includes('.') ? fieldName.split('.')[0] : null;
	if (sectionName) {
		const accordionTrigger = page.getByTestId(`form-accordion-trigger-${sectionName}`);
		if ((await accordionTrigger.count()) > 0) {
			const isExpanded = await accordionTrigger.getAttribute('aria-expanded');
			if (isExpanded !== 'true') {
				await accordionTrigger.click();
			}
		}
	}

	const trigger = page.getByTestId(`form-item-${fieldName}`).locator('button').first();
	await page.getByTestId(`form-item-${fieldName}`).waitFor({ state: 'visible' });
	await trigger.click();
	if (optionName) {
		await page.getByRole('option', { name: optionName, exact: true }).click();

		return;
	}
	await page.getByRole('option').first().click();
};

export const clickDataTableActionItem = async (page: Page, actionItemTestId: string) => {
	const actionButton = page.getByTestId('data-table-actions-button');

	// If there's only one action, we render a primary button directly instead of the dropdown
	if ((await actionButton.count()) === 0) {
		await page.getByTestId(actionItemTestId).click();

		return;
	}

	await actionButton.click();
	try {
		await page.getByTestId(actionItemTestId).click({ timeout: 3000 });
	} catch {
		await actionButton.click({ force: true });
		await page.getByTestId(actionItemTestId).click();
	}
};

export const selectMultiOptionsByTestId = async (page: Page, fieldName: string, optionLabels: string[]) => {
	const field = page.getByTestId(`form-item-${fieldName}`);
	await field.waitFor({ state: 'visible' });
	await field.locator('button[role="combobox"]').click();

	const desiredLabels = new Set(optionLabels);
	for (const optionLabel of optionLabels) {
		const unselectedOption = page.getByRole('option', { name: `${optionLabel}, not selected`, exact: true });
		if ((await unselectedOption.count()) > 0) {
			await unselectedOption.first().click();
			continue;
		}

		const selectedOption = page.getByRole('option', { name: `${optionLabel}, selected`, exact: true });
		if ((await selectedOption.count()) > 0) {
			continue;
		}

		await page.getByRole('option', { name: optionLabel, exact: true }).first().click();
	}

	const selectedLabels = await page.locator('[role="option"][aria-label$=", selected"]').evaluateAll((elements) =>
		elements
			.map((element) => element.getAttribute('aria-label'))
			.filter((value): value is string => Boolean(value))
			.map((value) => value.replace(/, selected$/, '')),
	);

	for (const selectedLabel of selectedLabels) {
		if (desiredLabels.has(selectedLabel)) {
			continue;
		}
		await page.getByRole('option', { name: `${selectedLabel}, selected`, exact: true }).click();
	}

	await page.keyboard.press('Escape');
};

const scrollToBottomAndTop = async (page: Page) => {
	await page.evaluate(() => {
		window.scrollTo(0, document.body.scrollHeight);
	});
	await page.evaluate(() => {
		window.scrollTo(0, 0);
	});
};

const isPage = (target: Page | Locator): target is Page => {
	return 'goto' in target;
};

export const expectToHaveScreenshot = async (target: Page | Locator, scrollBeforeScreenshot = false) => {
	const page = isPage(target) ? target : target.page();
	if (scrollBeforeScreenshot) {
		await scrollToBottomAndTop(page);
	}
	if (isPage(target)) {
		await expect(target).toHaveScreenshot({ fullPage: true });

		return;
	}
	await expect(target).toHaveScreenshot();
};
