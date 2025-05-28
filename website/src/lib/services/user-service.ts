import { prisma } from '@/lib/prisma';
import { Result, fail, ok } from '@/lib/result';
import { User } from '@prisma/client';

export const getUsers = async (options?: { take?: number; skip?: number }): Promise<Result<User[]>> => {
	try {
		const users = await prisma.user.findMany(options);
		return ok(users);
	} catch (e) {
		console.error('[getUsers]', e);
		return fail('Could not fetch users');
	}
};
