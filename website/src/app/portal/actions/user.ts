'use server';

import { User as PrismaUser } from '@prisma/client';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';

export async function getCurrentUserByAuthId(uid: string): Promise<PrismaUser | null> {
	const service = new UserService();
	const result = await service.getCurrentUserByAuthId(uid);
	return result.success ? result.data : null;
}
