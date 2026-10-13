import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test, type Page } from '@playwright/test';
import { clickDataTableActionItem, getRecipientIdByName, selectOptionByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

// Seeding cannot clear the append-only audit_event table, so each run uses a
// new recipient to start without earlier audit events.
const createRecipientName = () => ({ firstName: `Audit-${Date.now()}`, lastName: 'Recipient' });

const findAuditEvents = (recipientId: string) =>
	prisma.auditEvent.findMany({
		where: { entityType: 'recipient', entityId: recipientId },
		orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		select: { action: true, actorId: true, source: true, snapshot: true },
	});

const openRecipient = async (page: Page, firstName: string) => {
	await page.goto(`/portal/management/recipients?page=1&pageSize=10&search=${encodeURIComponent(firstName)}`);
	await page.getByRole('cell', { name: firstName }).click();
};

const saveRecipient = async (page: Page) => {
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });
};

test('recipient create, edit and delete in the portal are audited', async ({ page }) => {
	const { firstName, lastName } = createRecipientName();

	await page.goto('/portal/management/recipients');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-recipient');
	await selectOptionByTestId(page, 'program', 'Sierra Leone Unconditional');
	await selectOptionByTestId(page, 'localPartner', 'Local Partner SL Operations');
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(lastName);
	await saveRecipient(page);

	const recipient = await getRecipientIdByName(firstName, lastName);
	expect(recipient).toBeTruthy();
	const recipientId = recipient!.id;
	expect(await findAuditEvents(recipientId)).toMatchObject([
		{
			action: 'create',
			actorId: 'user-si-power',
			source: 'portal',
			snapshot: { programId: 'program-si-core-sl', contact: { firstName, lastName } },
		},
	]);

	await openRecipient(page, firstName);
	await page.getByTestId('form-item-successorName').locator('input').fill('Grace');
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Audited');
	await saveRecipient(page);

	const afterEdit = await findAuditEvents(recipientId);
	expect(afterEdit).toHaveLength(2);
	expect(afterEdit[1]).toMatchObject({
		action: 'update',
		actorId: 'user-si-power',
		snapshot: { successorName: 'Grace', contact: { firstName, lastName: 'Audited' } },
	});

	const auditLogUrl = `/portal/admin/audit-log?page=1&pageSize=10&search=${encodeURIComponent(recipientId)}`;
	await page.goto(auditLogUrl);
	const rows = page.getByTestId('data-table').getByRole('row').filter({ hasText: firstName });
	await expect(rows).toHaveCount(2);
	await expect(rows.filter({ hasText: 'Created' })).toHaveCount(1);
	const updateRow = rows.filter({ hasText: 'Last name' });
	await expect(updateRow.locator('del', { hasText: 'Recipient' })).toBeVisible();
	await expect(updateRow.locator('ins', { hasText: 'Audited' })).toBeVisible();
	await expect(updateRow.getByText('Successor')).toBeVisible();
	await expect(updateRow.locator('ins', { hasText: 'Grace' })).toBeVisible();
	await expect(updateRow.getByText('si_power_user')).toBeVisible();
	await expect(updateRow.getByText('Portal')).toBeVisible();

	await openRecipient(page, firstName);
	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	expect(await getRecipientIdByName(firstName, 'Audited')).toBeNull();
	const afterDelete = await findAuditEvents(recipientId);
	expect(afterDelete).toHaveLength(3);
	expect(afterDelete[2]).toMatchObject({ action: 'delete', actorId: 'user-si-power', snapshot: null });

	await page.goto(auditLogUrl);
	await expect(rows).toHaveCount(3);
	await expect(rows.filter({ hasText: 'Deleted' })).toHaveCount(1);
});
