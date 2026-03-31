import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { expectToHaveScreenshot, selectMultiOptionsByTestId, selectOptionByTestId } from '../../../utils';

const openProgramSettingsDialog = async (page: Page, programId = 'program-si-core-sl') => {
	await page.goto(`/portal/programs/${programId}/overview`);
	await page.getByRole('button', { name: 'Program settings' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();

	return dialog;
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('Program ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-si-core-sl/overview');
	await expectToHaveScreenshot(page);
});

test('Program not ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-si-education-sl/overview');
	await expectToHaveScreenshot(page);
});

test('program settings dialog for program-si-core-sl updates all editable values and saves', async ({ page }) => {
	const updatedName = 'Program One Updated E2E';
	const updatedDuration = '24';
	const updatedPayoutPerInterval = '77';
	const updatedOwnerOrganizations = ['Social Income GH'];
	const updatedOperatorOrganizations = ['Social Income SL'];

	let dialog = await openProgramSettingsDialog(page);
	await dialog.getByTestId('form-item-name').locator('input').fill(updatedName);
	await selectOptionByTestId(page, 'country', 'Angola (AOA)');
	await dialog.getByTestId('form-item-programDurationInMonths').locator('input').fill(updatedDuration);
	await dialog.getByTestId('form-item-payoutPerInterval').locator('input').fill(updatedPayoutPerInterval);
	await dialog.getByTestId('form-item-coveredByReserves').getByRole('switch').click();
	await selectOptionByTestId(page, 'payoutInterval', 'Quarterly');
	await selectMultiOptionsByTestId(page, 'targetFocuses', ['poverty']);
	await selectMultiOptionsByTestId(page, 'targetProfiles', ['female']);
	await selectMultiOptionsByTestId(page, 'ownerOrganizations', updatedOwnerOrganizations);
	await selectMultiOptionsByTestId(page, 'operatorOrganizations', updatedOperatorOrganizations);
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog).not.toBeVisible();

	dialog = await openProgramSettingsDialog(page);
	await expect(dialog.getByTestId('form-item-name').locator('input')).toHaveValue(updatedName);
	await expect(dialog.getByTestId('form-item-country')).toContainText('Angola');
	await expect(dialog.getByTestId('form-item-programDurationInMonths').locator('input')).toHaveValue(updatedDuration);
	await expect(dialog.getByTestId('form-item-payoutPerInterval').locator('input')).toHaveValue(updatedPayoutPerInterval);
	await expect(dialog.getByTestId('form-item-coveredByReserves').getByRole('switch')).toHaveAttribute(
		'aria-checked',
		'true',
	);
	await expect(dialog.getByTestId('form-item-payoutInterval')).toContainText('Quarterly');
	await expect(dialog.getByTestId('form-item-targetFocuses')).toContainText('poverty');
	await expect(dialog.getByTestId('form-item-targetProfiles')).toContainText('female');
	await expect(dialog.getByTestId('form-item-ownerOrganizations')).toContainText('Social Income GH');
	await expect(dialog.getByTestId('form-item-operatorOrganizations')).toContainText('Social Income SL');

	await expectToHaveScreenshot(page);
});

test('program settings dialog shows owner and operator for owner-only active organization', async ({ page }) => {
	const programId = 'program-si-core-sl';
	const programAccesses = await prisma.programAccess.findMany({
		where: { programId },
		select: {
			permission: true,
			organizationId: true,
			organization: {
				select: {
					name: true,
				},
			},
		},
	});
	const ownerAccess = programAccesses.find((access) => access.permission === 'owner');
	const operatorAccess = programAccesses.find((access) => access.permission === 'operator');
	expect(ownerAccess).toBeDefined();
	expect(operatorAccess).toBeDefined();

	const portalUser = await prisma.user.findFirst({
		where: { contact: { email: 'power@portal.test' } },
		select: { id: true },
	});
	expect(portalUser).toBeDefined();

	if (!ownerAccess || !operatorAccess || !portalUser) {
		throw new Error('Seeded owner/operator program accesses or portal user missing');
	}

	await prisma.user.update({
		where: { id: portalUser.id },
		data: { activeOrganizationId: ownerAccess.organizationId },
	});

	const dialog = await openProgramSettingsDialog(page, programId);

	await expect(dialog.getByRole('heading', { name: 'View program settings' })).toBeVisible();
	await expect(dialog.getByTestId('form-item-ownerOrganizations')).toContainText(ownerAccess.organization.name);
	await expect(dialog.getByTestId('form-item-operatorOrganizations')).toContainText(operatorAccess.organization.name);
});

test('program settings dialog can delete a newly created program and redirects to portal', async ({ page }) => {
	await page.goto('/portal');
	await page.getByTestId('create-program-modal-trigger').click();

	await page.getByTestId('radio-card-country-sierra-leone').click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByTestId('radio-card-targeted').click();
	await page.getByTestId('pill-multi-select-focus-poverty').click();
	await page.getByTestId('pill-multi-select-focus-health').click();
	await page.getByTestId('pill-multi-select-female').click();
	await expect(page.getByText(/recipients match the selected country and filters/i)).toBeVisible();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(page.getByText('Great! You initiated a new program')).toBeVisible();

	const createdProgramPath = new URL(page.url()).pathname;
	const createdProgramId = createdProgramPath.split('/')[3];
	expect(createdProgramId).toBeTruthy();

	const dialog = await openProgramSettingsDialog(page, createdProgramId);
	await dialog.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();

	await expect(page).toHaveURL('/portal');
});
