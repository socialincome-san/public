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
		createdAt: new Date(),
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
		createdAt: new Date(),
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
		createdAt: new Date(),
		updatedAt: null
	}
];