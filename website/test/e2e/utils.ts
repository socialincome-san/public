import { prisma } from '@/lib/database/prisma';
import { Page } from '@playwright/test';

export const getFirebaseAdminService = async () => {
	const { FirebaseAdminService } = await import('@/lib/services/firebase/firebase-admin.service');
	const { prisma } = await import('@/lib/database/prisma');

	return new FirebaseAdminService(prisma);
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
		await page.getByRole('option', { name: optionName }).click();

		return;
	}
	await page.getByRole('option').first().click();
};

export const clickDataTableActionItem = async (page: Page, actionItemTestId: string) => {
	const actionButton = page.getByTestId('data-table-actions-button');

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

	for (const optionLabel of optionLabels) {
		await page.getByRole('option', { name: `${optionLabel}, not selected`, exact: true }).click();
	}

	await page.keyboard.press('Escape');
};
