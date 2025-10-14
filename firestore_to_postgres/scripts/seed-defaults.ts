import { Prisma, PrismaClient } from '@prisma/client';

export const DEFAULT_ORGANIZATION: Prisma.OrganizationCreateInput = {
	name: 'Default Social Income Organization',
};

export const DEFAULT_PROGRAM: Omit<Prisma.ProgramCreateInput, 'owner' | 'operator'> = {
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

export const DEFAULT_LOCAL_PARTNER: Prisma.LocalPartnerCreateInput = {
	name: 'Default Social Income Local Partner',
	contact: {
		create: {
			firstName: 'Default',
			lastName: 'Partner',
			email: 'default.partner@socialincome.org',
		},
	},
};

const prisma = new PrismaClient();

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
			owner: { connect: { id: organization.id } },
			operator: { connect: { id: organization.id } },
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

	await prisma.localPartner.upsert({
		where: { name: DEFAULT_LOCAL_PARTNER.name },
		update: {},
		create: DEFAULT_LOCAL_PARTNER,
	});

	console.log('✅ Seeding of default data completed successfully');
}

main()
	.catch((error) => console.error('❌ Error seeding default data:', error))
	.finally(async () => prisma.$disconnect());
