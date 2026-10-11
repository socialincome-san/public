import { prisma } from '@/lib/database/prisma';
import type { ReserveCreateInput } from './reserve.types';

export const groupLatestReserveDates = async () =>
	prisma.reserve.groupBy({
		by: ['bankAccountId'],
		_max: { date: true },
	});

export const findReservesByAccountAndDate = async (filters: { bankAccountId: string; date: Date }[]) =>
	prisma.reserve.findMany({
		where: { OR: filters },
		select: {
			bankAccountId: true,
			amountChf: true,
			createdAt: true,
		},
	});

export const createReserves = async (reserves: ReserveCreateInput[]) =>
	prisma.reserve.createMany({
		data: reserves,
		skipDuplicates: true,
	});
