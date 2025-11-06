import {
	OrganizationPermission,
	Prisma,
	PrismaClient,
	ProgramPermission,
	SurveyQuestionnaire,
	UserRole,
} from '@prisma/client';

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

// Survey schedules with UUIDs
export const recipientSurveys: (Omit<Prisma.SurveyScheduleCreateInput, 'program'> & { id: string })[] = [
	{ id: '1', name: 'onboarding', questionnaire: SurveyQuestionnaire.onboarding, dueInMonthsAfterStart: 0 },
	{ id: '2', name: 'checkin-1', questionnaire: SurveyQuestionnaire.checkin, dueInMonthsAfterStart: 6 },
	{ id: '3', name: 'checkin-2', questionnaire: SurveyQuestionnaire.checkin, dueInMonthsAfterStart: 12 },
	{ id: '4', name: 'checkin-3', questionnaire: SurveyQuestionnaire.checkin, dueInMonthsAfterStart: 18 },
	{ id: '5', name: 'checkin-4', questionnaire: SurveyQuestionnaire.checkin, dueInMonthsAfterStart: 24 },
	{ id: '6', name: 'checkin-5', questionnaire: SurveyQuestionnaire.checkin, dueInMonthsAfterStart: 30 },
	{ id: '7', name: 'offboarding', questionnaire: SurveyQuestionnaire.offboarding, dueInMonthsAfterStart: 36 },
	{
		id: '8',
		name: 'offboarded-checkin-1',
		questionnaire: SurveyQuestionnaire.offboarded_checkin,
		dueInMonthsAfterStart: 42,
	},
	{
		id: '9',
		name: 'offboarded-checkin-2',
		questionnaire: SurveyQuestionnaire.offboarded_checkin,
		dueInMonthsAfterStart: 48,
	},
	{
		id: '10',
		name: 'offboarded-checkin-3',
		questionnaire: SurveyQuestionnaire.offboarded_checkin,
		dueInMonthsAfterStart: 60,
	},
	{
		id: '11',
		name: 'offboarded-checkin-4',
		questionnaire: SurveyQuestionnaire.offboarded_checkin,
		dueInMonthsAfterStart: 72,
	},
];

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
				permission: OrganizationPermission.edit,
			},
		});

		await prisma.programAccess.upsert({
			where: { userId_programId: { userId: user.id, programId: program.id } },
			update: {},
			create: {
				user: { connect: { id: user.id } },
				program: { connect: { id: program.id } },
				permission: ProgramPermission.edit,
			},
		});

		await prisma.user.update({
			where: { id: user.id },
			data: { activeOrganizationId: organization.id },
		});
	}

	await prisma.surveySchedule.createMany({
		data: recipientSurveys.map((surveySchedule) => ({
			id: surveySchedule.id,
			name: surveySchedule.name,
			questionnaire: surveySchedule.questionnaire,
			dueInMonthsAfterStart: surveySchedule.dueInMonthsAfterStart,
			programId: program.id,
		})),
		skipDuplicates: true,
	});

	console.log('✅ Seeding of default data completed successfully');
}

if (require.main === module) {
	main()
		.catch((error) => console.log('❌ Error seeding default data:', error))
		.finally(async () => prisma.$disconnect());
}
