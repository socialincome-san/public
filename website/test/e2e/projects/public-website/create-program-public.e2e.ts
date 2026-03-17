import { UserRole } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { getFirebaseAdminService } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

const createProgramFromPublicWizard = async (page: Page, input: { firstName: string; lastName: string; email: string }) => {
	await page.goto('/en/int');

	const createProgramTrigger = page.getByTestId('create-program-modal-trigger');
	await expect(createProgramTrigger).toBeVisible();
	await createProgramTrigger.click();

	await page.getByTestId('radio-card-country-sierra-leone').click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByTestId('radio-card-universal').click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByLabel('First name').fill(input.firstName);
	await page.getByLabel('Last name').fill(input.lastName);
	await page.getByLabel('Email').fill(input.email);
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.waitForURL(/\/(en\/int\/)?login(\?.*)?$/);
};

test('public user can create a program and account', async ({ page }) => {
	const unique = Date.now();
	const firstName = 'Public';
	const lastName = `Creator${unique}`;
	const email = `e2e.public.create.program.${unique}@example.com`;

	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByEmailIfExists(email);

	await createProgramFromPublicWizard(page, { firstName, lastName, email });

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
			campaigns: {
				some: { organizationId: createdUser.activeOrganizationId },
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

test('public flow upgrades an existing contributor contact to a user', async ({ page }) => {
	const unique = Date.now();
	const firstName = 'Existing';
	const lastName = `Contributor${unique}`;
	const email = `e2e.public.existing.contributor.${unique}@example.com`;

	const account = await prisma.account.create({
		data: { firebaseAuthUserId: `e2e-existing-contributor-${unique}` },
	});
	const contact = await prisma.contact.create({
		data: {
			firstName,
			lastName,
			email,
		},
	});
	const contributor = await prisma.contributor.create({
		data: {
			accountId: account.id,
			contactId: contact.id,
			referral: 'other',
		},
	});

	await createProgramFromPublicWizard(page, { firstName, lastName, email });

	const upgradedUser = await prisma.user.findUnique({
		where: { contactId: contact.id },
		include: { activeOrganization: true },
	});
	expect(upgradedUser).toBeTruthy();
	if (!upgradedUser) {
		throw new Error('Expected user to be created for existing contributor contact');
	}

	expect(upgradedUser.role).toBe(UserRole.user);
	expect(upgradedUser.accountId).toBe(contributor.accountId);
	expect(upgradedUser.contactId).toBe(contributor.contactId);
	expect(upgradedUser.activeOrganizationId).toBeTruthy();

	if (!upgradedUser.activeOrganizationId) {
		throw new Error('Expected upgraded user to have an active organization');
	}

	const createdProgram = await prisma.program.findFirst({
		where: {
			campaigns: {
				some: { organizationId: upgradedUser.activeOrganizationId },
			},
		},
		orderBy: { createdAt: 'desc' },
	});
	expect(createdProgram).toBeTruthy();
});

test('public flow reuses an existing user and organization', async ({ page }) => {
	const unique = Date.now();
	const firstName = 'Existing';
	const lastName = `User${unique}`;
	const email = `e2e.public.existing.user.${unique}@example.com`;

	const account = await prisma.account.create({
		data: { firebaseAuthUserId: `e2e-existing-user-${unique}` },
	});
	const contact = await prisma.contact.create({
		data: {
			firstName,
			lastName,
			email,
		},
	});
	const organization = await prisma.organization.create({
		data: { name: `${email} existing organization` },
	});
	const existingUser = await prisma.user.create({
		data: {
			role: UserRole.user,
			accountId: account.id,
			contactId: contact.id,
			activeOrganizationId: organization.id,
			organizationAccesses: {
				create: {
					organizationId: organization.id,
					permission: 'edit',
				},
			},
		},
	});

	await createProgramFromPublicWizard(page, { firstName, lastName, email });

	const usersForEmail = await prisma.user.count({
		where: { contact: { email } },
	});
	expect(usersForEmail).toBe(1);

	const reusedUser = await prisma.user.findUnique({
		where: { id: existingUser.id },
		select: { activeOrganizationId: true },
	});
	expect(reusedUser?.activeOrganizationId).toBe(organization.id);

	const createdProgram = await prisma.program.findFirst({
		where: {
			campaigns: {
				some: { organizationId: organization.id },
			},
		},
		orderBy: { createdAt: 'desc' },
	});
	expect(createdProgram).toBeTruthy();
});
