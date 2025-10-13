import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	await prisma.organization.upsert({
		where: { name: 'Default Organization' },
		update: {},
		create: { name: 'Default Organization' },
	});

	const organization = await prisma.organization.findUnique({
		where: { name: 'Default Organization' },
	});

	if (!organization) return;

	await prisma.program.upsert({
		where: { name: 'Default Program' },
		update: {},
		create: {
			name: 'Default Program',
			totalPayments: 36,
			payoutAmount: 700,
			payoutCurrency: 'SLE',
			payoutInterval: 30,
			country: 'Sierra Leone',
			owner: { connect: { id: organization.id } },
			operator: { connect: { id: organization.id } },
		},
	});

	const program = await prisma.program.findUnique({
		where: { name: 'Default Program' },
	});

	if (!program) return;

	await prisma.campaign.upsert({
		where: { title: 'Default Campaign' },
		update: {},
		create: {
			title: 'Default Campaign',
			description: 'Automatically created campaign for unmapped contributions.',
			currency: 'CHF',
			endDate: new Date('2100-01-01'),
			isActive: false,
			organization: { connect: { id: organization.id } },
			program: { connect: { id: program.id } },
		},
	});

	await prisma.localPartner.upsert({
		where: { name: 'Default Local Partner' },
		update: {},
		create: {
			name: 'Default Local Partner',
			contact: {
				create: {
					firstName: 'Default',
					lastName: 'Partner',
					email: 'default.partner@socialincome.org',
				},
			},
		},
	});
}

main()
	.catch(() => process.exit(1))
	.finally(async () => {
		await prisma.$disconnect();
		console.log('Seeding of default data completed');
	});
