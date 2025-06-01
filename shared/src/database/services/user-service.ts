import { User as PrismaUser } from '@prisma/client';
import { prisma } from '@socialincome/shared/src/database/prisma';
import { Result, resultFail, resultOk } from '@socialincome/shared/src/database/utils/result';

export const getUsers = async (options?: { take?: number; skip?: number }): Promise<Result<PrismaUser[]>> => {
	try {
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			...options,
		});
		return resultOk(users);
	} catch (e) {
		console.error('[getUsers]', e);
		return resultFail('Could not fetch users');
	}
};
