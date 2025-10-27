import { OrganizationPermission, Prisma, PrismaClient, ProgramPermission, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export const DEFAULT_ORGANIZATION: Prisma.OrganizationCreateInput = {
	name: 'Default Social Income Organization',
};

export const DEFAULT_PROGRAM: Omit<Prisma.ProgramCreateInput, 'ownerOrganization'> = {
	name: 'Default Social Income Program',
	totalPayments: 36,
	payoutAmount: 700,
	payoutCurrency: 'SLE',
	payoutInterval: 30,
	country: 'Sierra Leone',
};

export const DEFAULT_CAMPAIGN: Omit<Prisma.CampaignCreateInput, 'organization' | 'program'> = {
	title: 'Default Social Income Campaign',
	description: 'Automatically created campaign for unmapped contributions.',
	currency: 'CHF',
	endDate: new Date('2100-01-01'),
	isActive: false,
};

export const ADMIN_STAGING_ACCOUNT: Prisma.AccountCreateInput = {
	firebaseAuthUserId: 'V7t5fgxerMgVKiPZZTpsVCKIwW43',
	user: {
		create: {
			role: UserRole.admin,
			contact: {
				create: {
					firstName: 'Admin',
					lastName: 'Staging',
					email: 'dev+john@socialincome.org',
					language: 'en',
					address: {
						create: {
							street: 'Bahnhofstrasse',
							number: '10',
							city: 'Zürich',
							zip: '8001',
							country: 'Switzerland',
						},
					},
					phone: {
						create: {
							number: '+41791234567',
						},
					},
				},
			},
		},
	},
};

export const ADMIN_LOCAL_ACCOUNT: Prisma.AccountCreateInput = {
	firebaseAuthUserId: 'w43IydQbr8lgeGeevbSBoP9ui3WQ',
	user: {
		create: {
			role: UserRole.admin,
			contact: {
				create: {
					firstName: 'Admin',
					lastName: 'Local',
					email: 'test@test.org',
					language: 'en',
					address: {
						create: {
							street: 'Teststrasse',
							number: '1',
							city: 'Bern',
							zip: '3000',
							country: 'Switzerland',
						},
					},
					phone: {
						create: {
							number: '+41790000000',
						},
					},
				},
			},
		},
	},
};

async function main() {
	const organization = await prisma.organization.upsert({
		where: { name: DEFAULT_ORGANIZATION.name },
		update: {},
		create: DEFAULT_ORGANIZATION,
	});

	const program = await prisma.program.upsert({
		where: { name: DEFAULT_PROGRAM.name },
		update: {},
		create: {
			...DEFAULT_PROGRAM,
			ownerOrganization: { connect: { id: organization.id } },
		},
	});

	await prisma.campaign.upsert({
		where: { title: DEFAULT_CAMPAIGN.title },
		update: {},
		create: {
			...DEFAULT_CAMPAIGN,
			organization: { connect: { id: organization.id } },
			program: { connect: { id: program.id } },
		},
	});

	const accounts = [ADMIN_STAGING_ACCOUNT, ADMIN_LOCAL_ACCOUNT];

	for (const accountData of accounts) {
		const account = await prisma.account.upsert({
			where: { firebaseAuthUserId: accountData.firebaseAuthUserId },
			update: {},
			create: accountData,
			include: { user: true },
		});

		const user = account.user;
		if (!user) continue;

		await prisma.organizationAccess.upsert({
			where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
			update: {},
			create: {
				user: { connect: { id: user.id } },
				organization: { connect: { id: organization.id } },
				permissions: [OrganizationPermission.edit],
			},
		});

		await prisma.programAccess.upsert({
			where: { userId_programId: { userId: user.id, programId: program.id } },
			update: {},
			create: {
				user: { connect: { id: user.id } },
				program: { connect: { id: program.id } },
				permissions: [ProgramPermission.edit],
			},
		});

		await prisma.user.update({
			where: { id: user.id },
			data: { activeOrganizationId: organization.id },
		});
	}

	console.log('✅ Seeding of default data completed successfully');
}

if (require.main === module) {
	main()
		.catch((error) => console.log('❌ Error seeding default data:', error))
		.finally(async () => prisma.$disconnect());
}
