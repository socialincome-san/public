import { type PrismaClient } from '@/generated/prisma/client';
import { ReserveWriteService } from './reserve-write.service';
import { type ReserveCreateInput } from './reserve.types';

jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
}));

describe('ReserveWriteService.createMany', () => {
	const reserve: ReserveCreateInput = {
		bankAccountId: 'postfinance-account',
		date: new Date('2026-08-12T00:00:00.000Z'),
		amount: 125,
		currency: 'CHF' as ReserveCreateInput['currency'],
		amountChf: 125,
	};

	test('uses skipDuplicates so repeated writes keep a single snapshot', async () => {
		const snapshots = new Map<string, ReserveCreateInput>();
		const createMany = jest.fn().mockImplementation(async ({ data, skipDuplicates }) => {
			let count = 0;

			for (const row of data as ReserveCreateInput[]) {
				const key = `${row.bankAccountId}:${row.date.toISOString()}`;
				if (snapshots.has(key)) {
					if (!skipDuplicates) {
						throw new Error(`Duplicate reserve for ${key}`);
					}
					continue;
				}

				snapshots.set(key, row);
				count += 1;
			}

			return { count };
		});
		const service = new ReserveWriteService({ reserve: { createMany } } as unknown as PrismaClient, {} as never);

		await expect(service.createMany([reserve])).resolves.toEqual({ success: true, data: 1 });
		await expect(service.createMany([reserve])).resolves.toEqual({ success: true, data: 0 });

		expect(createMany).toHaveBeenCalledTimes(2);
		expect(createMany).toHaveBeenCalledWith({ data: [reserve], skipDuplicates: true });
		expect(snapshots.size).toBe(1);
		expect([...snapshots.values()]).toEqual([reserve]);
	});

	test('returns zero without writing when the input list is empty', async () => {
		const createMany = jest.fn();
		const service = new ReserveWriteService({ reserve: { createMany } } as unknown as PrismaClient, {} as never);

		await expect(service.createMany([])).resolves.toEqual({ success: true, data: 0 });
		expect(createMany).not.toHaveBeenCalled();
	});
});
