import { prisma } from '@/lib/database/prisma';
import { expect, Locator, Page } from '@playwright/test';

export const findFirebaseUserByEmail = async (email: string) => {
	const { findFirebaseUserByEmail: findUser } = await import('@/modules/auth/auth.service');

	return findUser(email);
};

export const createFirebaseUserByPhoneNumber = async (phoneNumber: string) => {
	const { createFirebaseUserByPhoneNumber: createUser } = await import('@/modules/auth/auth.service');

	return createUser(phoneNumber);
};

export const deleteFirebaseUserByPhoneNumberIfExists = async (phoneNumber: string) => {
	const { deleteFirebaseUserByPhoneNumberIfExists: deleteUser } = await import('@/modules/auth/auth.service');

	return deleteUser(phoneNumber);
};

export const deleteFirebaseEmailsIfExist = async (...emails: string[]) => {
	const { deleteFirebaseUserByEmailIfExists } = await import('@/modules/auth/auth.service');
	for (const email of emails) {
		await deleteFirebaseUserByEmailIfExists(email);
	}
};

export const deleteFirebasePhonesIfExist = async (...phoneNumbers: string[]) => {
	const { deleteFirebaseUserByPhoneNumberIfExists } = await import('@/modules/auth/auth.service');
	for (const phoneNumber of phoneNumbers) {
		await deleteFirebaseUserByPhoneNumberIfExists(phoneNumber);
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
