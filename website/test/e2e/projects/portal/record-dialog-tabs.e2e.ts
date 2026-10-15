import { ProgramPermission } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

const getOperatedProgramIds = async () => {
	const user = await prisma.user.findFirstOrThrow({
		where: { contact: { email: 'power@portal.test' } },
		select: { activeOrganizationId: true },
	});
	const accesses = await prisma.programAccess.findMany({
		where: { organizationId: user.activeOrganizationId ?? '', permission: ProgramPermission.operator },
		select: { programId: true },
	});

	return accesses.map(({ programId }) => programId);
};

// With cacheComponents the previous route stays mounted but hidden, so its dialog form can still be in the DOM
const visibleForm = (page: Page) => page.getByTestId('dynamic-form').filter({ visible: true });

const dialogRows = (page: Page) => page.getByRole('dialog').getByTestId('data-table').locator('tbody tr');

test('record dialog opens from the URL and clears it on close', async ({ page }) => {
	const focus = await prisma.focus.findUniqueOrThrow({ where: { name: 'poverty' }, select: { id: true } });

	await page.goto(`/portal/admin/focuses?focusId=${focus.id}`);
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', { name: 'Edit focus' })).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(page).not.toHaveURL(/focusId=/);

	await page.getByRole('cell', { name: 'poverty' }).first().click();
	await expect(dialog.getByRole('heading', { name: 'Edit focus' })).toBeVisible();
	await expect(page).toHaveURL(new RegExp(`focusId=${focus.id}`));
});

test('focus dialog lists the programs of the focus and links to them', async ({ page }) => {
	const program = await prisma.program.findFirstOrThrow({ select: { id: true, name: true } });
	const unique = Date.now();
	const focus = await prisma.focus.create({
		data: {
			name: `e2e-focus-tabs-${unique}`,
			slug: `e2e-focus-tabs-${unique}`,
			programs: { create: { programId: program.id } },
		},
		select: { id: true },
	});

	await page.goto(`/portal/admin/focuses?focusId=${focus.id}`);
	const dialog = page.getByRole('dialog');
	await dialog.getByRole('tab', { name: 'Programs' }).click();
	await expect(dialogRows(page)).toHaveCount(1);
	await dialogRows(page).filter({ hasText: program.name }).click();

	await expect(page).toHaveURL(new RegExp(`/portal/programs/${program.id}/overview`));
});

test('child provider link reloads the dialog tabs for the child', async ({ page }) => {
	const unique = Date.now();
	const parent = await prisma.mobileMoneyProvider.create({
		data: { name: `e2e-parent-provider-${unique}` },
		select: { id: true },
	});
	const child = await prisma.mobileMoneyProvider.create({
		data: { name: `e2e-child-provider-${unique}`, parentId: parent.id },
		select: { id: true, name: true },
	});

	await page.goto(`/portal/admin/mobile-money-providers?providerId=${parent.id}`);
	const dialog = page.getByRole('dialog');
	await dialog.getByRole('tab', { name: 'Child providers' }).click();
	await dialogRows(page).filter({ hasText: child.name }).click();

	await expect(page).toHaveURL(new RegExp(`providerId=${child.id}`));
	await expect(dialog.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
	await expect(dialog.getByTestId('form-item-name').locator('input')).toHaveValue(child.name);

	await dialog.getByRole('tab', { name: 'Child providers' }).click();
	await expect(dialog.getByText('No mobile money providers found')).toBeVisible();
});

test('recipient payouts tab links to the payout on the filtered payouts page', async ({ page }) => {
	const recipient = await prisma.recipient.findFirstOrThrow({
		where: { programId: { in: await getOperatedProgramIds() }, payouts: { some: {} } },
		select: { id: true },
	});

	await page.goto(`/portal/management/recipients?recipientId=${recipient.id}`);
	await page.getByRole('dialog').getByRole('tab', { name: 'Payouts' }).click();
	await dialogRows(page).first().click();

	await expect(page).toHaveURL(new RegExp(`/portal/delivery/payouts\\?recipientId=${recipient.id}&payoutId=`));
	await expect(visibleForm(page)).toHaveCount(1);
});

test('contributor contributions tab links to the contribution on the filtered contributions page', async ({ page }) => {
	const contributor = await prisma.contributor.findFirstOrThrow({
		where: { contributions: { some: { campaign: { programId: { in: await getOperatedProgramIds() } } } } },
		select: { id: true },
	});

	await page.goto(`/portal/management/contributors?contributorId=${contributor.id}`);
	await page.getByRole('dialog').getByRole('tab', { name: 'Contributions' }).click();
	await dialogRows(page).first().click();

	await expect(page).toHaveURL(
		new RegExp(`/portal/management/contributions\\?contributorId=${contributor.id}&contributionId=`),
	);
	await expect(visibleForm(page)).toHaveCount(1);
});
