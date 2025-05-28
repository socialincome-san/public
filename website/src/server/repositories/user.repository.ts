import { prisma } from '@/server/prisma';
import { User } from '@prisma/client';

export const getUsers = async (): Promise<User[]> => {
	try {
		return await prisma.user.findMany();
	} catch (error) {
		console.error('Failed to fetch users from db:', error);
		return [];
	}
};
