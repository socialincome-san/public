import { Prisma, Program, PayoutInterval, Cause } from '@prisma/client';

export const programsData: Program[] = [
	{
		id: 'program-1',
		name: 'Migros Relief SL',
		amountOfRecipientsForStart: null,
		programDurationInMonths: 12,
		payoutPerInterval: new Prisma.Decimal(50),
		payoutCurrency: 'SLE',
		payoutInterval: 'monthly',
		targetCauses: [],
		countryId: 'country-algeria',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-2',
		name: 'Migros Education SL',
		amountOfRecipientsForStart: null,
		programDurationInMonths: 8,
		payoutPerInterval: new Prisma.Decimal(40),
		payoutCurrency: 'SLE',
		payoutInterval: 'monthly',
		targetCauses: [],
		countryId: 'country-algeria',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-3',
		name: 'Coop Cash Aid SL',
		amountOfRecipientsForStart: null,
		programDurationInMonths: 6,
		payoutPerInterval: new Prisma.Decimal(75),
		payoutCurrency: 'SLE',
		payoutInterval: 'monthly',
		targetCauses: [],
		countryId: 'country-algeria',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-4',
		name: 'Red Cross Basic Needs',
		amountOfRecipientsForStart: null,
		programDurationInMonths: 9,
		payoutPerInterval: new Prisma.Decimal(60),
		payoutCurrency: 'SLE',
		payoutInterval: 'monthly',
		targetCauses: [],
		countryId: 'country-algeria',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-5',
		name: 'Caritas Family Support',
		amountOfRecipientsForStart: null,
		programDurationInMonths: 10,
		payoutPerInterval: new Prisma.Decimal(80),
		payoutCurrency: 'LRD',
		payoutInterval: 'monthly',
		targetCauses: [],
		countryId: 'country-angola',
		createdAt: new Date(),
		updatedAt: null
	}
];