import type { Prisma } from '@/generated/prisma/client';

const mockFindMany = jest.fn<Promise<unknown[]>, [Prisma.RecipientFindManyArgs]>();
const mockCount = jest.fn<Promise<number>, [Prisma.RecipientCountArgs]>();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		recipient: {
			findMany: mockFindMany,
			count: mockCount,
		},
	},
}));

import { findRecipientTableSource, findSurveyRecipients } from './recipient.repository.read';

const expectedWhere = (search: string, phoneSearch?: string): Prisma.RecipientWhereInput => ({
	AND: [
		{ programId: { in: ['program-1'] } },
		{
			OR: [
				{ id: { contains: search, mode: 'insensitive' } },
				{ contact: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
				{ contact: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
				{ paymentInformation: { is: { code: { contains: search, mode: 'insensitive' } } } },
				{ localPartner: { is: { name: { contains: search, mode: 'insensitive' } } } },
				{ program: { is: { name: { contains: search, mode: 'insensitive' } } } },
				...(phoneSearch
					? [
							{ contact: { is: { phone: { is: { number: { contains: phoneSearch } } } } } },
							{ paymentInformation: { is: { phone: { is: { number: { contains: phoneSearch } } } } } },
						]
					: []),
			],
		},
	],
});

describe('recipient table phone search', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindMany.mockResolvedValue([]);
		mockCount.mockResolvedValue(0);
	});

	const search = async (searchInput: string) => {
		await findRecipientTableSource({
			programIds: ['program-1'],
			localPartnerId: undefined,
			query: { page: 1, pageSize: 10, search: searchInput },
			canSearchRecipientNames: true,
			paginate: true,
		});

		return mockFindMany.mock.calls[0]?.[0].where;
	};

	test('normalizes a formatted international phone number before partial matching', async () => {
		const where = await search('+232 798 184 28');

		expect(where).toEqual(expectedWhere('+232 798 184 28', '23279818428'));
	});

	test('supports searching by a phone number suffix', async () => {
		const where = await search('8428');

		expect(where).toEqual(expectedWhere('8428', '8428'));
	});

	test('does not interpret ordinary text as a phone number', async () => {
		const where = await search('Awa');

		expect(where).toEqual(expectedWhere('Awa'));
	});

	test('excludes interrupted recipients from survey generation', async () => {
		await findSurveyRecipients(['program-1'], new Date('2025-06-15T12:00:00.000Z'));

		expect(mockFindMany.mock.calls[0]?.[0].where).toHaveProperty('interruptedAt', null);
	});
});
