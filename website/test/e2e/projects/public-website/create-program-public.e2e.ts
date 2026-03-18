import { UserRole } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getFirebaseAdminService } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('public user can create a program and account', async ({ page }) => {
	const unique = Date.now();
	const firstName = 'Public';
	const lastName = `Creator${unique}`;
	const email = `e2e.public.create.program.${unique}@example.com`;

	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByEmailIfExists(email);

	await page.goto('/en/int');

	const createProgramTrigger = page.getByTestId('create-program-modal-trigger');
	await expect(createProgramTrigger).toBeVisible();
	await createProgramTrigger.click();

	await page.getByTestId('radio-card-country-sierra-leone').click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByTestId('radio-card-universal').click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByLabel('First name').fill(firstName);
	await page.getByLabel('Last name').fill(lastName);
	await page.getByLabel('Email').fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(page.getByText('Your program is ready')).toBeVisible();
	await expect(
		page.getByText(
			'We created your account, organization, and initial program setup. Next, log in with your email to open your dashboard and start managing your program.',
		),
	).toBeVisible();
	await page.getByRole('button', { name: 'Go to login' }).click();
	await page.waitForURL(/\/(en\/int\/)?login(\?.*)?$/);

	const createdUser = await prisma.user.findFirst({
		where: { contact: { email } },
		include: {
			contact: true,
			activeOrganization: true,
		},
	});

	expect(createdUser).toBeTruthy();
	if (!createdUser) {
		throw new Error('Expected created user in DB');
	}

	expect(createdUser.role).toBe(UserRole.user);
	expect(createdUser.contact.firstName).toBe(firstName);
	expect(createdUser.contact.lastName).toBe(lastName);
	expect(createdUser.activeOrganization?.name).toBe(`${email.toLowerCase()} organization`);
	expect(createdUser.activeOrganizationId).toBeTruthy();
	if (!createdUser.activeOrganizationId) {
		throw new Error('Expected created user to have an active organization');
	}

	const createdProgram = await prisma.program.findFirst({
		where: {
			programAccesses: {
				some: { organizationId: createdUser.activeOrganizationId, permission: 'owner' },
			},
		},
		orderBy: { createdAt: 'desc' },
	});
	expect(createdProgram).toBeTruthy();

	const firebaseCreatedResult = await firebaseService.getByEmail(email);
	expect(firebaseCreatedResult.success).toBeTruthy();
	if (!firebaseCreatedResult.success) {
		throw new Error(firebaseCreatedResult.error);
	}
	expect(firebaseCreatedResult.data).toBeTruthy();
	expect(firebaseCreatedResult.data?.displayName).toBe(`${firstName} ${lastName}`);
});
