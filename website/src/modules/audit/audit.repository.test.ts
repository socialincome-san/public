const mockFindMany = jest.fn();
const mockCount = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: { auditEvent: { findMany: mockFindMany, count: mockCount } },
}));

import { findAuditEventPage } from './audit.repository';

describe('findAuditEventPage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindMany.mockResolvedValue([]);
		mockCount.mockResolvedValue(0);
	});

	test('finds every event of entities whose name matches the search', async () => {
		mockFindMany.mockResolvedValueOnce([{ entityType: 'recipient', entityId: 'recipient-1' }]);

		await findAuditEventPage({ entityType: 'recipient', search: 'ada', skip: 0, take: 10 });

		expect(mockFindMany).toHaveBeenNthCalledWith(1, {
			where: { entityType: 'recipient', entityName: { contains: 'ada', mode: 'insensitive' } },
			distinct: ['entityType', 'entityId'],
			select: { entityType: true, entityId: true },
		});
		expect(mockCount).toHaveBeenCalledWith({
			where: {
				entityType: 'recipient',
				OR: [
					{ entityId: { contains: 'ada', mode: 'insensitive' } },
					{ actorName: { contains: 'ada', mode: 'insensitive' } },
					{ entityType: 'recipient', entityId: 'recipient-1' },
				],
			},
		});
	});

	test('skips the name lookup without a search', async () => {
		await findAuditEventPage({ search: '', skip: 0, take: 10 });

		expect(mockFindMany).toHaveBeenCalledTimes(1);
		expect(mockCount).toHaveBeenCalledWith({ where: { entityType: undefined, OR: undefined } });
	});
});
