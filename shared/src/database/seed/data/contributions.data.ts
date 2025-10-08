import { Contribution, ContributionStatus, Prisma } from '@prisma/client';

export const contributionsData: Contribution[] = [
	{
		id: 'contribution-1',
		amount: new Prisma.Decimal(100),
		currency: 'CHF',
		amountChf: new Prisma.Decimal(100),
		feesChf: new Prisma.Decimal(2),
		contributorId: 'contributor-1',
		status: ContributionStatus.succeeded,
		campaignId: 'campaign-1',
		createdAt: new Date('2025-01-05'),
		updatedAt: null
	},
	{
		id: 'contribution-2',
		amount: new Prisma.Decimal(50),
		currency: 'CHF',
		amountChf: new Prisma.Decimal(50),
		feesChf: new Prisma.Decimal(1),
		contributorId: 'contributor-2',
		status: ContributionStatus.succeeded,
		campaignId: 'campaign-1',
		createdAt: new Date('2025-02-12'),
		updatedAt: null
	},
	{
		id: 'contribution-3',
		amount: new Prisma.Decimal(150),
		currency: 'CHF',
		amountChf: new Prisma.Decimal(150),
		feesChf: new Prisma.Decimal(3),
		contributorId: 'contributor-3',
		status: ContributionStatus.succeeded,
		campaignId: 'campaign-2',
		createdAt: new Date('2025-03-10'),
		updatedAt: null
	},
	{
		id: 'contribution-4',
		amount: new Prisma.Decimal(200),
		currency: 'CHF',
		amountChf: new Prisma.Decimal(200),
		feesChf: new Prisma.Decimal(4),
		contributorId: 'contributor-4',
		status: ContributionStatus.succeeded,
		campaignId: 'campaign-1',
		createdAt: new Date('2025-04-15'),
		updatedAt: null
	},
	{
		id: 'contribution-5',
		amount: new Prisma.Decimal(300),
		currency: 'CHF',
		amountChf: new Prisma.Decimal(300),
		feesChf: new Prisma.Decimal(5),
		contributorId: 'contributor-4',
		status: ContributionStatus.succeeded,
		campaignId: 'campaign-3',
		createdAt: new Date('2025-05-20'),
		updatedAt: null
	},
	{
		id: 'contribution-6',
		amount: new Prisma.Decimal(500),
		currency: 'CHF',
		amountChf: new Prisma.Decimal(500),
		feesChf: new Prisma.Decimal(10),
		contributorId: 'contributor-5',
		status: ContributionStatus.succeeded,
		campaignId: 'campaign-2',
		createdAt: new Date('2025-06-11'),
		updatedAt: null
	},
	{
		id: 'contribution-7',
		amount: new Prisma.Decimal(120),
		currency: 'CHF',
		amountChf: new Prisma.Decimal(120),
		feesChf: new Prisma.Decimal(2.5),
		contributorId: 'contributor-6',
		status: ContributionStatus.succeeded,
		campaignId: 'campaign-3',
		createdAt: new Date('2025-07-22'),
		updatedAt: null
	}
];